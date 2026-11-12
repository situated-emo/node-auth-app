const db = require('../config/database');

// Подготовленные выражения
const insertUser = db.prepare(`
  INSERT INTO users (username, password_hash)
  VALUES (?, ?)
`);

const findUserByUsername = db.prepare(`
  SELECT id, username, password_hash FROM users WHERE username = ?
`);

module.exports = {
  createUser(username, passwordHash) {
    return insertUser.run(username, passwordHash);
  },
  findByUsername(username) {
    return findUserByUsername.get(username);
  }
};