const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireService } = require('../middleware/auth');
const router = express.Router();

// [internal] POST /alerts — ML service creates a new alert
router.post(
  '/',
  authenticate,
  requireService('ml-service'),
  async (req, res, next) => {
    try {
      const {
        senior_id,
        alert_type,
        severity,
        description,
        source,
        detected_at,
      } = req.body;

      if (!senior_id || !alert_type || !severity || !description || !source || !detected_at) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' }
        });
      }

      // verify senior exists
      const seniorCheck = await query('SELECT id FROM seniors WHERE id = $1', [senior_id]);
      if (seniorCheck.rowCount === 0) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Senior not found' }
        });
      }

      const result = await query(
        `INSERT INTO alerts (senior_id, alert_type, severity, description, source, detected_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, senior_id, alert_type, severity, description, source, detected_at, status, created_at`,
        [senior_id, alert_type, severity, description, source, detected_at]
      );

      res.status(201).json({ data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// GET /alerts — caseworker dashboard retrieves all alerts
router.get(
  '/',
  authenticate,
  async (req, res, next) => {
    try {
      const { status, severity, limit = 20 } = req.query;

      let queryText = `
        SELECT a.id, a.senior_id, u.full_name as senior_name,
               a.alert_type, a.severity, a.description, a.source,
               a.detected_at, a.status, a.created_at
        FROM alerts a
        JOIN seniors s ON s.id = a.senior_id
        JOIN users u ON u.id = s.id
        WHERE 1=1
      `;

      const params = [];

      if (status) {
        params.push(status);
        queryText += ` AND a.status = $${params.length}`;
      }

      if (severity) {
        params.push(severity);
        queryText += ` AND a.severity = $${params.length}`;
      }

      queryText += ` ORDER BY a.detected_at DESC LIMIT $${params.length + 1}`;
      params.push(Number(limit));

      const result = await query(queryText, params);
      res.status(200).json({ data: result.rows });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;