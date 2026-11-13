const Database = require('better-sqlite3');
const path = require('path');

// Файл базы данных будет создан в корне проекта
const db = new Database(path.join(__dirname, '..', 'database.db'));

// Создаём таблицу пользователей, если её ещё нет
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);



console.log('✅ База данных SQLite подключена');

module.exports = db;