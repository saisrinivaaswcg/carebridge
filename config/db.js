const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  // Idle client errors shouldn't crash the process, but must be visible.
  console.error('Unexpected error on idle PG client', err);
});

// Small helper so callers don't have to think about client checkout for
// simple one-off queries. Use pool.connect() directly for multi-statement
// transactions (see controllers/consents.controller.js for an example).
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (process.env.NODE_ENV === 'development') {
    console.log('query', { text, duration: Date.now() - start, rows: result.rowCount });
  }
  return result;
}

module.exports = { pool, query };
