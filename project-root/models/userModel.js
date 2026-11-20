const db = require('../config/database');

const insertUser = db.prepare(`
  INSERT INTO users (username, password_hash, role)
  VALUES (?, ?, ?)
`);

const findUserByUsername = db.prepare(`
  SELECT id, username, password_hash, role 
  FROM users 
  WHERE username = ? AND deleted_at IS NULL
`);

const listAll = db.prepare(`
  SELECT id, username, role, created_at 
  FROM users 
  WHERE deleted_at IS NULL 
  ORDER BY id
`);

const listDeleted = db.prepare(`
  SELECT id, username, role, created_at, deleted_at 
  FROM users 
  WHERE deleted_at IS NOT NULL 
  ORDER BY deleted_at DESC
`);

const updateUserStmt = db.prepare(`
  UPDATE users SET username = ?, role = ? WHERE id = ? AND deleted_at IS NULL
`);

const updateRole = db.prepare(`
  UPDATE users SET role = ? WHERE id = ? AND deleted_at IS NULL
`);

const softDelete = db.prepare(`
  UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
`);

const restore = db.prepare(`
  UPDATE users SET deleted_at = NULL WHERE id = ?
`);

module.exports = {
  createUser:     (username, passwordHash, role = 'user') => insertUser.run(username, passwordHash, role),
  findByUsername: (username) => findUserByUsername.get(username),
  getAllUsers:    () => listAll.all(),
  listAll:        () => listAll.all(),
  listDeleted:    () => listDeleted.all(),
  updateUser:     (id, username, role) => updateUserStmt.run(username, role, id),
  updateRole:     (id, role) => updateRole.run(role, id),
  deleteUser:     (id) => softDelete.run(id),
  remove:         (id) => softDelete.run(id),
  restore:        (id) => restore.run(id)
};
