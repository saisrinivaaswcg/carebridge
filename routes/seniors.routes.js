const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireRole, requireService } = require('../middleware/auth');
const { loadCareGroupContext } = require('../middleware/rbac');
const { requireConsent, auditAccess } = require('../middleware/consentGate');
const consentsRouter = require('./consents.routes');


const router = express.Router();

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

// Example of the consent-gated read pattern every other content route should follow:
// authenticate -> loadCareGroupContext -> requireConsent(<type>) -> auditAccess(<resource>) -> handler
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

      // Basic validation
      if (!direction || !channel || !content_text || !sent_at) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: direction, channel, content_text, sent_at' },
        });
      }

      // Verify the senior exists
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

// Nested consent routes: mounted here so :seniorId is shared.
router.use('/:seniorId/consents', consentsRouter);

// TODO (pattern for teammates finishing the rest of the resource):
//   /:seniorId/voice-notes    -> requireConsent('voice_recording' or 'ml_pattern_analysis')
//   /:seniorId/check-ins      -> no consent gate needed (scheduling metadata only)
//   /:seniorId/alerts         -> requireConsent('family_sharing' | 'caseworker_sharing')
//   /:seniorId/care-group/*   -> requireRole('senior','caseworker','admin') for writes

module.exports = router;
