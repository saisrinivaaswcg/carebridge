const { verifyAccessToken } = require('../utils/jwt');


const SERVICE_KEYS = {
  [process.env.SERVICE_KEY_ML]: 'ml-service',
  [process.env.SERVICE_KEY_REALTIME]: 'realtime-service',
};

/**
 * Authenticates either a human user (Bearer JWT) or a trusted internal
 * service (X-Service-Key header). Sets exactly one of req.user / req.service.
 * Route handlers and rbac() below branch on whichever is present.
 */
function authenticate(req, res, next) {
  const serviceKey = req.header('X-Service-Key');
  if (serviceKey) {
    const serviceName = SERVICE_KEYS[serviceKey];
    if (!serviceName) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid service key' } });
    }
    req.service = { name: serviceName };
    return next();
  }

  const authHeader = req.header('Authorization') || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing bearer token' } });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired token' } });
  }
}

/** Restricts a route to specific human roles. Services bypass this — gate
 *  services with `requireService(...)` instead, never mix the two on one route
 *  unless the route genuinely accepts both (rare; document it in API_CONTRACT.md
 *  if you do). */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Role not permitted' } });
    }
    next();
  };
}

function requireService(...names) {
  return (req, res, next) => {
    if (!req.service || !names.includes(req.service.name)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Service not permitted' } });
    }
    next();
  };
}

module.exports = { authenticate, requireRole, requireService };
