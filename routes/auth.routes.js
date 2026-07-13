const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { query, pool } = require('../config/db');
const {
  signAccessToken, generateRefreshToken, hashRefreshToken, generateOtpCode,
} = require('../utils/jwt');


const router = express.Router();

const otpRequestLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, keyGenerator: (req) => req.body.phone_number || req.ip });
const otpVerifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

const REFRESH_TTL_MS = (Number(process.env.JWT_REFRESH_TTL_DAYS) || 30) * 24 * 60 * 60 * 1000;

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, tokenHash } = generateRefreshToken();
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [user.id, tokenHash, new Date(Date.now() + REFRESH_TTL_MS)]
  );
  return { accessToken, refreshToken };
}

// ---------- Senior: request OTP ----------
const otpRequestSchema = z.object({ phone_number: z.string().min(8) });

router.post('/senior/otp/request', otpRequestLimiter, async (req, res, next) => {
  try {
    const { phone_number } = otpRequestSchema.parse(req.body);

    const userResult = await query(
      `SELECT id FROM users WHERE phone_number = $1 AND role = 'senior'`,
      [phone_number]
    );
    if (userResult.rowCount === 0) {
      // Don't leak which phone numbers are registered.
      return res.status(200).json({ message: 'If this number is registered, a code has been sent.' });
    }
    const userId = userResult.rows[0].id;
    const { code, codeHash } = generateOtpCode();

    await query(
      `INSERT INTO otp_codes (user_id, code_hash, expires_at) VALUES ($1, $2, now() + interval '5 minutes')`,
      [userId, codeHash]
    );

    // TODO: integrate SMS provider here. Never log the raw `code` in production.
    if (process.env.NODE_ENV === 'development') console.log(`[DEV ONLY] OTP for ${phone_number}: ${code}`);

    res.status(200).json({ message: 'If this number is registered, a code has been sent.' });
  } catch (err) {
    next(err);
  }
});

// ---------- Senior: verify OTP ----------
const otpVerifySchema = z.object({ phone_number: z.string().min(8), code: z.string().length(6) });

router.post('/senior/otp/verify', otpVerifyLimiter, async (req, res, next) => {
  try {
    const { phone_number, code } = otpVerifySchema.parse(req.body);
    const crypto = require('crypto');
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    const userResult = await query(`SELECT * FROM users WHERE phone_number = $1 AND role = 'senior'`, [phone_number]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid code' } });
    }
    const user = userResult.rows[0];

    const otpResult = await query(
      `SELECT * FROM otp_codes
        WHERE user_id = $1 AND code_hash = $2 AND consumed_at IS NULL AND expires_at > now()
        ORDER BY created_at DESC LIMIT 1`,
      [user.id, codeHash]
    );
    if (otpResult.rowCount === 0) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired code' } });
    }

    await query(`UPDATE otp_codes SET consumed_at = now() WHERE id = $1`, [otpResult.rows[0].id]);
    await query(`UPDATE users SET last_login_at = now() WHERE id = $1`, [user.id]);

    const { accessToken, refreshToken } = await issueTokenPair(user);
    res.status(200).json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: user.id, role: user.role, full_name: user.full_name },
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Family / caseworker / admin: email + password ----------
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const userResult = await query(`SELECT * FROM users WHERE email = $1 AND is_active = true`, [email]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid credentials' } });
    }
    const user = userResult.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash || '');
    if (!valid) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid credentials' } });
    }

    await query(`UPDATE users SET last_login_at = now() WHERE id = $1`, [user.id]);
    const { accessToken, refreshToken } = await issueTokenPair(user);
    res.status(200).json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: user.id, role: user.role, full_name: user.full_name },
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Refresh (rotates the refresh token) ----------
router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'refresh_token required' } });

    const tokenHash = hashRefreshToken(refresh_token);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const tokenResult = await client.query(
        `SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now() FOR UPDATE`,
        [tokenHash]
      );
      if (tokenResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired refresh token' } });
      }
      const stored = tokenResult.rows[0];
      await client.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [stored.id]);

      const userResult = await client.query(`SELECT * FROM users WHERE id = $1`, [stored.user_id]);
      const user = userResult.rows[0];
      const { token: newRefresh, tokenHash: newHash } = generateRefreshToken();
      await client.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [user.id, newHash, new Date(Date.now() + REFRESH_TTL_MS)]
      );
      await client.query('COMMIT');

      const accessToken = signAccessToken(user);
      res.status(200).json({ access_token: accessToken, refresh_token: newRefresh });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (refresh_token) {
      await query(`UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`, [hashRefreshToken(refresh_token)]);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
