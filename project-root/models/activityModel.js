const db = require('../config/database');

const insert = db.prepare(`
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
  VALUES (@user_id, @action, @entity_type, @entity_id, @details)
`);

const recent = db.prepare(`
  SELECT l.*, u.username
  FROM activity_log l LEFT JOIN users u ON u.id = l.user_id
  ORDER BY l.created_at DESC LIMIT ?
`);

module.exports = {
  log: (data) => insert.run({
    user_id: data.user_id,
    action: data.action,
    entity_type: data.entity_type || null,
    entity_id: data.entity_id || null,
    details: data.details || null
  }),
  recent: (limit = 100) => recent.all(limit)
};