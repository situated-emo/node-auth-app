const ROLES = Object.freeze({
  VIEWER:  'viewer',
  USER:    'user',
  MANAGER: 'manager',
  ADMIN:   'admin'
});

// Каждое разрешение — массив ролей, которым оно доступно
const PERMISSIONS = Object.freeze({
  'project:read':   [ROLES.VIEWER, ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
  'project:create': [ROLES.MANAGER, ROLES.ADMIN],
  'project:edit':   [ROLES.MANAGER, ROLES.ADMIN],

  'task:read-all':  [ROLES.MANAGER, ROLES.ADMIN],
  'task:read-own':  [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
  'task:create':    [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
  'task:edit-own':  [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
  'task:edit-any':  [ROLES.MANAGER, ROLES.ADMIN],
  'task:delete':    [ROLES.MANAGER, ROLES.ADMIN],
  'task:assign':    [ROLES.MANAGER, ROLES.ADMIN],

  'comment:create': [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],

  'user:manage':    [ROLES.ADMIN],
  'role:change':    [ROLES.ADMIN],
  'log:read':       [ROLES.ADMIN]
});

function can(role, permission) {
  return (PERMISSIONS[permission] || []).includes(role);
}

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  next();
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    if (!can(req.session.role, permission)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
  };
}

module.exports = { ROLES, PERMISSIONS, can, requireAuth, requirePermission };