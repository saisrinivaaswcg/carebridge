const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TTL = `${process.env.JWT_ACCESS_TTL_MIN || 15}m`;

function signAccessToken(user) {
  // Deliberately minimal claims — permissions are looked up live against
  // care_group_members + consent_records, not baked into the token. See
  // API_CONTRACT.md §3 for why.
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function generateRefreshToken() {
  const token = crypto.randomBytes(48).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateOtpCode() {
  const code = crypto.randomInt(100000, 999999).toString();
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  return { code, codeHash };
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  generateOtpCode,
};
