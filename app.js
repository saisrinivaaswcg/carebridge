const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const seniorsRoutes = require('./routes/seniors.routes');

const app = express();

app.use(helmet());
app.use(cors()); // TODO: lock down to mobile/dashboard origins before prod
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 })); // generous global default; tighter limits on auth routes

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/seniors', seniorsRoutes);
// app.use('/api/v1/alerts', alertsRoutes);   // TODO
// app.use('/api/v1/users', usersRoutes);     // TODO

// 404
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No such route' } });
});

// Central error handler — keep every route's catch block calling next(err)
// rather than formatting errors inline, so this is the one place that changes.
app.use((err, req, res, next) => {
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: err.errors } });
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
});

module.exports = app;
