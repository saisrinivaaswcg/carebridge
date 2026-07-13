const { query } = require('../config/db');


/**
 * Blocks the request with 403 CONSENT_REQUIRED unless an active, non-expired
 * consent of `consentType` exists for :seniorId. This is the enforcement point
 * described in API_CONTRACT.md §6 rule 1 — every route serving message/voice/
 * alert content must use this, not just the ingestion side.
 */
function requireConsent(consentType) {
  return async (req, res, next) => {
    const { seniorId } = req.params;
    const result = await query(
      `SELECT 1 FROM consent_records
        WHERE senior_id = $1
          AND consent_type = $2
          AND status = 'granted'
          AND (expires_at IS NULL OR expires_at > now())`,
      [seniorId, consentType]
    );
    if (result.rowCount === 0) {
      return res.status(403).json({
        error: {
          code: 'CONSENT_REQUIRED',
          message: `Active '${consentType}' consent is required for this senior.`,
        },
      });
    }
    next();
  };
}

/**
 * Fire-and-forget audit log write for human reads of health-adjacent content.
 * Mount AFTER the route responds (res.on('finish', ...)) so logging never
 * delays the response or fails the request if the write itself errors.
 */
function auditAccess(resourceType) {
  return (req, res, next) => {
    res.on('finish', () => {
      if (!req.user || res.statusCode >= 400) return; // only log successful human reads
      query(
        `INSERT INTO access_audit_log (user_id, action, resource_type, resource_id, senior_id, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user.id, req.method === 'GET' ? 'read' : req.method.toLowerCase(),
         resourceType, req.params.id || null, req.params.seniorId || null, req.ip]
      ).catch((err) => console.error('access_audit_log write failed', err));
    });
    next();
  };
}

module.exports = { requireConsent, auditAccess };
