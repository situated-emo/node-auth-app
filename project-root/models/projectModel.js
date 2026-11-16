const db = require('../config/database');

const stmts = {
  all: db.prepare(`
    SELECT p.*, u.username AS owner_name
    FROM projects p JOIN users u ON u.id = p.owner_id
    WHERE p.archived = 0
    ORDER BY p.created_at DESC
  `),
  findById: db.prepare(`SELECT * FROM projects WHERE id = ?`),
  insert: db.prepare(`
    INSERT INTO projects (title, description, owner_id)
    VALUES (@title, @description, @owner_id)
  `),
  update: db.prepare(`
    UPDATE projects SET title = @title, description = @description, archived = @archived
    WHERE id = @id
  `)
};

module.exports = {
  all:      () => stmts.all.all(),
  findById: (id) => stmts.findById.get(id),
  create:   (d) => stmts.insert.run(d),
  update:   (d) => stmts.update.run(d)
};