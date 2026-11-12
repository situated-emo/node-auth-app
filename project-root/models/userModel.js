const db = require('../config/database');

// Подготовленные выражения
const insertUser = db.prepare(`
  INSERT INTO users (username, password_hash, role)
  VALUES (?, ?, ?)
`);

const findUserByUsername = db.prepare(`
  SELECT id, username, password_hash, role FROM users WHERE username = ?
`);
const getAllUsersStmt = db.prepare(`
  SELECT id, username, role, created_at FROM users
`);
const updateUserStmt = db.prepare(`
  UPDATE users SET username = ?, role = ? WHERE id = ?
`);
const deleteUserStmt = db.prepare(`
  DELETE FROM users WHERE id = ?
`);

module.exports = {
  createUser(username, passwordHash, role = 'user') {
    return insertUser.run(username, passwordHash, role);
  },
  findByUsername(username) {
    return findUserByUsername.get(username);
  },
  getAllUsers() {
    return getAllUsersStmt.all();
  },
  updateUser(id, username, role) {
    return updateUserStmt.run(username, role, id);
  },
  deleteUser(id) {
    return deleteUserStmt.run(id);
  }
};