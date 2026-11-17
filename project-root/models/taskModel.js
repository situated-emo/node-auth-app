const db = require('../config/database');

const SELECT_BASE = `
  SELECT t.*, 
         a.username AS author_name,
         s.username AS assignee_name,
         p.title    AS project_title
  FROM tasks t
  JOIN users a ON a.id = t.author_id
  LEFT JOIN users s ON s.id = t.assignee_id
  JOIN projects p ON p.id = t.project_id
`;

const stmts = {
  all:            db.prepare(`${SELECT_BASE} ORDER BY t.created_at DESC`),
  byAssignee:     db.prepare(`${SELECT_BASE} WHERE t.assignee_id = ? ORDER BY t.created_at DESC`),
  byProject:      db.prepare(`${SELECT_BASE} WHERE t.project_id = ? ORDER BY t.created_at DESC`),
  findById:       db.prepare(`${SELECT_BASE} WHERE t.id = ?`),
  insert: db.prepare(`
    INSERT INTO tasks (project_id, title, description, priority, author_id, assignee_id, due_date)
    VALUES (@project_id, @title, @description, @priority, @author_id, @assignee_id, @due_date)
  `),
  update: db.prepare(`
    UPDATE tasks
    SET title = @title, description = @description, status = @status,
        priority = @priority, assignee_id = @assignee_id, due_date = @due_date,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `),
  remove: db.prepare(`DELETE FROM tasks WHERE id = ?`)
};

function filter({ q, status, priority, assigneeId, unassigned, restrictedUserId } = {}) {
  const conditions = [];
  const params = [];

  // Если у пользователя нет права task:read-all — жёстко ограничиваем его своими задачами
  if (restrictedUserId) {
    conditions.push('(t.assignee_id = ? OR t.author_id = ?)');
    params.push(restrictedUserId, restrictedUserId);
  } else if (unassigned) {
    conditions.push('t.assignee_id IS NULL');
  } else if (assigneeId) {
    conditions.push('t.assignee_id = ?');
    params.push(assigneeId);
  }

  if (q) {
    conditions.push('LOWER(t.title) LIKE LOWER(?)');
    params.push(`%${q}%`);
  }

  if (status) {
    conditions.push('t.status = ?');
    params.push(status);
  }

  if (priority) {
    conditions.push('t.priority = ?');
    params.push(priority);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `${SELECT_BASE} ${whereClause} ORDER BY t.created_at DESC`;

  return db.prepare(sql).all(...params);
}

module.exports = {
  all:         () => stmts.all.all(),
  byAssignee:  (uid) => stmts.byAssignee.all(uid),
  byProject:   (pid) => stmts.byProject.all(pid),
  findById:    (id) => stmts.findById.get(id),
  create:      (d) => stmts.insert.run(d),
  update:      (d) => stmts.update.run(d),
  remove:      (id) => stmts.remove.run(id),
  filter
};