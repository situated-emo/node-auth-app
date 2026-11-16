const db = require('../config/database');

const stmts = {
  byTask: db.prepare(`
    SELECT c.*, u.username
    FROM comments c JOIN users u ON u.id = c.user_id
    WHERE c.task_id = ?
    ORDER BY c.created_at ASC
  `),
  insert: db.prepare(`
    INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)
  `)
};

module.exports = {
  byTask: (taskId) => stmts.byTask.all(taskId),
  create: (taskId, userId, body) => stmts.insert.run(taskId, userId, body)
};