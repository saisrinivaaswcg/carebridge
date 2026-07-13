const { query } = require('../config/db');

/**
 * Loads the requesting user's relationship to :seniorId (from care_group_members,
 * or the fact that they ARE the senior) and attaches it as req.careGroupMembership.
 * Use this before any route reading/writing a specific senior's data.
 *
 * Blocks with 403 if the user has no active relationship to this senior at all.
 * Does NOT check permission_level or consent — compose with requirePermission()
 * and the consent gate for that.
 */
async function loadCareGroupContext(req, res, next) {
  const { seniorId } = req.params;
  const user = req.user;
  if (!user) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing user' } });

  if (user.role === 'senior' && user.id === seniorId) {
    req.careGroupMembership = { role_in_group: 'self', permission_level: 'full' };
    return next();
  }

  const result = await query(
    `SELECT cgm.role_in_group, cgm.permission_level
       FROM care_group_members cgm
       JOIN care_groups cg ON cg.id = cgm.care_group_id
      WHERE cg.senior_id = $1 AND cgm.user_id = $2 AND cgm.status = 'active'`,
    [seniorId, user.id]
  );

  if (result.rowCount === 0) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'You are not an active member of this senior\'s care group' },
    });
  }

  req.careGroupMembership = result.rows[0];
  return next();
}

/** Compose after loadCareGroupContext(). */
function requirePermission(...levels) {
  return (req, res, next) => {
    const membership = req.careGroupMembership;
    if (!membership || !levels.includes(membership.permission_level)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permission level' } });
    }
    next();
  };
}

module.exports = { loadCareGroupContext, requirePermission };
