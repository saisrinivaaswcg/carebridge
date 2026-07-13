const express = require('express');
const { z } = require('zod');
const { query, pool } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { loadCareGroupContext } = require('../middleware/rbac');
const { auditAccess } = require('../middleware/consentGate');


const router = express.Router({ mergeParams: true }); // mounted at /seniors/:seniorId/consents

// GET /seniors/:seniorId/consents
router.get('/', authenticate, loadCareGroupContext, auditAccess('consent_records'), async (req, res, next) => {
  try {
    const { seniorId } = req.params;
    const result = await query(
      `SELECT id, consent_type, status, consent_version, granted_at, withdrawn_at, expires_at
         FROM consent_records
        WHERE senior_id = $1
        ORDER BY consent_type`,
      [seniorId]
    );
    res.status(200).json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /seniors/:seniorId/consents  — grant a new consent
const grantSchema = z.object({
  consent_type: z.enum([
    'data_collection', 'voice_recording', 'ml_pattern_analysis',
    'family_sharing', 'caseworker_sharing', 'emergency_override',
  ]),
  consent_version: z.string(),
  proof_method: z.enum(['in_app_digital', 'verbal_witnessed', 'paper_form', 'guardian_signed']),
  witness_user_id: z.string().uuid().optional(),
  expires_at: z.string().datetime().optional(),
});

router.post('/', authenticate, requireRole('senior', 'caseworker', 'admin'), loadCareGroupContext, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { seniorId } = req.params;
    const body = grantSchema.parse(req.body);

    await client.query('BEGIN');

    const inserted = await client.query(
      `INSERT INTO consent_records
         (senior_id, consent_type, status, consent_version, granted_by_user_id, proof_method, witness_user_id, granted_at, expires_at)
       VALUES ($1, $2, 'granted', $3, $4, $5, $6, now(), $7)
       ON CONFLICT (senior_id, consent_type) WHERE status = 'granted'
       DO NOTHING
       RETURNING *`,
      [seniorId, body.consent_type, body.consent_version, req.user.id, body.proof_method, body.witness_user_id || null, body.expires_at || null]
    );

    if (inserted.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'An active consent of this type already exists — withdraw it first.' } });
    }

    await client.query(
      `INSERT INTO consent_audit_log (consent_record_id, action, performed_by_user_id, ip_address)
       VALUES ($1, 'granted', $2, $3)`,
      [inserted.rows[0].id, req.user.id, req.ip]
    );

    await client.query('COMMIT');
    res.status(201).json({ data: inserted.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PATCH /seniors/:seniorId/consents/:consentId  — withdraw or renew
const patchSchema = z.object({ action: z.enum(['withdraw', 'renew']) });

router.patch('/:consentId', authenticate, requireRole('senior', 'caseworker'), loadCareGroupContext, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { consentId } = req.params;
    const { action } = patchSchema.parse(req.body);

    await client.query('BEGIN');
    const updated = action === 'withdraw'
      ? await client.query(
          `UPDATE consent_records SET status = 'withdrawn', withdrawn_at = now()
             WHERE id = $1 AND status = 'granted' RETURNING *`,
          [consentId]
        )
      : await client.query(
          `UPDATE consent_records SET status = 'granted', granted_at = now(), withdrawn_at = NULL
             WHERE id = $1 AND status IN ('withdrawn', 'expired') RETURNING *`,
          [consentId]
        );

    if (updated.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: { code: 'CONFLICT', message: `Cannot ${action} this consent from its current state` } });
    }

    await client.query(
      `INSERT INTO consent_audit_log (consent_record_id, action, performed_by_user_id, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [consentId, action === 'withdraw' ? 'withdrawn' : 'renewed', req.user.id, req.ip]
    );
    await client.query('COMMIT');
    res.status(200).json({ data: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// GET /seniors/:seniorId/consents/:consentId/audit
router.get('/:consentId/audit', authenticate, requireRole('caseworker', 'admin'), loadCareGroupContext, async (req, res, next) => {
  try {
    const { consentId } = req.params;
    const result = await query(
      `SELECT * FROM consent_audit_log WHERE consent_record_id = $1 ORDER BY performed_at DESC`,
      [consentId]
    );
    res.status(200).json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
