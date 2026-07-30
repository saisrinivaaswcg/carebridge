const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireRole, requireService } = require('../middleware/auth');
const { loadCareGroupContext } = require('../middleware/rbac');
const { requireConsent, auditAccess } = require('../middleware/consentGate');
const consentsRouter = require('./consents.routes');

const router = express.Router();

// GET /seniors — caseworker sees list of all their seniors
router.get(
  '/',
  authenticate,
  async (req, res, next) => {
    try {
      const result = await query(
        `SELECT s.id, u.full_name, u.preferred_language,
                s.date_of_birth, s.onboarding_status,
                s.baseline_established_at,
                (SELECT COUNT(*) FROM alerts a 
                 WHERE a.senior_id = s.id 
                 AND a.status = 'open') as open_alert_count
         FROM seniors s
         JOIN users u ON u.id = s.id
         WHERE u.is_active = true
         ORDER BY u.full_name ASC`,
        []
      );
      res.status(200).json({ data: result.rows });
    } catch (err) {
      next(err);
    }
  }
);

// GET /seniors/:seniorId — single senior profile
router.get('/:seniorId', authenticate, loadCareGroupContext, auditAccess('seniors'), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT s.id, s.timezone, s.onboarding_status, s.baseline_established_at, u.full_name, u.preferred_language
         FROM seniors s JOIN users u ON u.id = s.id
        WHERE s.id = $1`,
      [req.params.seniorId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Senior not found' } });
    res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /seniors/:seniorId/trend — drift chart data for dashboard
router.get(
  '/:seniorId/trend',
  authenticate,
  loadCareGroupContext,
  async (req, res, next) => {
    try {
      const { seniorId } = req.params;
      const result = await query(
        `SELECT 
           observed_at as date,
           risk_score as value,
           alert_tier
         FROM observations
         WHERE senior_id = $1
         ORDER BY observed_at ASC`,
        [seniorId]
      );

      const rows = result.rows;
      const baseline = rows.length > 0
        ? rows.slice(0, Math.ceil(rows.length / 2))
            .reduce((sum, r) => sum + parseFloat(r.value), 0) /
          Math.ceil(rows.length / 2)
        : 0;

      const data = rows.map(row => ({
        date: row.date,
        value: parseFloat(row.value),
        baselineLow: parseFloat((baseline - 1).toFixed(2)),
        baselineHigh: parseFloat((baseline + 1).toFixed(2)),
      }));

      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  }
);

// GET /seniors/:seniorId/messages — message history
router.get(
  '/:seniorId/messages',
  authenticate,
  loadCareGroupContext,
  requireConsent('data_collection'),
  auditAccess('messages'),
  async (req, res, next) => {
    try {
      const { limit = 20, cursor } = req.query;
      const result = await query(
        `SELECT id, direction, channel, content_text, sent_at
           FROM messages
          WHERE senior_id = $1 AND deleted_at IS NULL
            AND ($2::timestamptz IS NULL OR sent_at < $2)
          ORDER BY sent_at DESC
          LIMIT $3`,
        [req.params.seniorId, cursor || null, Number(limit)]
      );
      const hasMore = result.rowCount === Number(limit);
      res.status(200).json({
        data: result.rows,
        next_cursor: hasMore ? result.rows[result.rows.length - 1].sent_at : null,
        has_more: hasMore,
      });
    } catch (err) {
      next(err);
    }
  }
);

// [internal] POST /seniors/:seniorId/messages — realtime-service ingests inbound/outbound text
router.post(
  '/:seniorId/messages',
  authenticate,
  requireService('realtime-service'),
  async (req, res, next) => {
    try {
      const { seniorId } = req.params;
      const { direction, channel, content_text, sent_at } = req.body;

      if (!direction || !channel || !content_text || !sent_at) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: direction, channel, content_text, sent_at' },
        });
      }

      const seniorCheck = await query('SELECT id FROM seniors WHERE id = $1', [seniorId]);
      if (seniorCheck.rowCount === 0) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Senior not found' } });
      }

      const result = await query(
        `INSERT INTO messages (senior_id, direction, channel, content_text, sent_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, senior_id, direction, channel, content_text, sent_at, created_at`,
        [seniorId, direction, channel, content_text, sent_at]
      );

      res.status(201).json({ data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// [internal] POST /seniors/:seniorId/voice-notes — realtime-service registers voice note after S3 upload
router.post(
  '/:seniorId/voice-notes',
  authenticate,
  requireService('realtime-service'),
  async (req, res, next) => {
    try {
      const { seniorId } = req.params;
      const { s3_key, s3_bucket, duration_seconds, recorded_at } = req.body;

      if (!s3_key || !s3_bucket || !duration_seconds || !recorded_at) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: s3_key, s3_bucket, duration_seconds, recorded_at' },
        });
      }

      const seniorCheck = await query('SELECT id FROM seniors WHERE id = $1', [seniorId]);
      if (seniorCheck.rowCount === 0) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Senior not found' } });
      }

      const result = await query(
        `INSERT INTO voice_notes (senior_id, s3_key, s3_bucket, duration_seconds, recorded_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, senior_id, s3_key, s3_bucket, duration_seconds, recorded_at, created_at`,
        [seniorId, s3_key, s3_bucket, duration_seconds, recorded_at]
      );

      res.status(201).json({ data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// Nested consent routes
router.use('/:seniorId/consents', consentsRouter);

module.exports = router;