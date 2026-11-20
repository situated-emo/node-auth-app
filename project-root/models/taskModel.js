const db = require('../config/database');

const SELECT_BASE = `
  SELECT t.*, 
         a.username AS author_name,
         s.username AS assignee_name,
         p.title    AS project_title
  FROM tasks t
  LEFT JOIN users a ON a.id = t.author_id
  LEFT JOIN users s ON s.id = t.assignee_id
  LEFT JOIN projects p ON p.id = t.project_id
`;

const stmts = {
  all:         db.prepare(`${SELECT_BASE} WHERE t.deleted_at IS NULL ORDER BY t.created_at DESC`),
  byAssignee:  db.prepare(`${SELECT_BASE} WHERE t.deleted_at IS NULL AND t.assignee_id = ? ORDER BY t.created_at DESC`),
  byProject:   db.prepare(`${SELECT_BASE} WHERE t.deleted_at IS NULL AND t.project_id = ? ORDER BY t.created_at DESC`),
  findById:    db.prepare(`${SELECT_BASE} WHERE t.deleted_at IS NULL AND t.id = ?`),
  listDeleted: db.prepare(`${SELECT_BASE} WHERE t.deleted_at IS NOT NULL ORDER BY t.deleted_at DESC`),
  insert: db.prepare(`
    INSERT INTO tasks (project_id, title, description, priority, author_id, assignee_id, due_date)
    VALUES (@project_id, @title, @description, @priority, @author_id, @assignee_id, @due_date)
  `),
  update: db.prepare(`
    UPDATE tasks
    SET title = @title, description = @description, status = @status,
        priority = @priority, assignee_id = @assignee_id, due_date = @due_date,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = @id AND deleted_at IS NULL
  `),
  remove:  db.prepare(`UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`),
  restore: db.prepare(`UPDATE tasks SET deleted_at = NULL WHERE id = ?`)
};

function filter({ q, status, priority, assigneeId, unassigned, restrictedUserId } = {}) {
  const conditions = ['t.deleted_at IS NULL'];
  const params = [];

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

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const sql = `${SELECT_BASE} ${whereClause} ORDER BY t.created_at DESC`;

  return db.prepare(sql).all(...params);
}

module.exports = {
  all:         () => stmts.all.all(),
  byAssignee:  (uid) => stmts.byAssignee.all(uid),
  byProject:   (pid) => stmts.byProject.all(pid),
  findById:    (id) => stmts.findById.get(id),
  listDeleted: () => stmts.listDeleted.all(),
  create:      (d) => stmts.insert.run(d),
  update:      (d) => stmts.update.run(d),
  remove:      (id) => stmts.remove.run(id),
  restore:     (id) => stmts.restore.run(id),
  filter
};
