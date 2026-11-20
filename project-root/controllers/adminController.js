const User = require('../models/userModel');
const Task = require('../models/taskModel');
const Activity = require('../models/activityModel');
const { ROLES } = require('../middleware/roles');

const VALID_ROLES = Object.values(ROLES);

exports.listUsers = (req, res) => res.json(User.listAll());

exports.changeRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Неизвестная роль' });
  }
  if (Number(id) === req.session.userId) {
    return res.status(400).json({ error: 'Нельзя менять роль самому себе' });
  }
  User.updateRole(Number(id), role);
  Activity.log({ user_id: req.session.userId, action: 'user.changeRole',
                 entity_type: 'user', entity_id: Number(id), details: role });
  res.json({ ok: true });
};

exports.deleteUser = (req, res) => {
  const id = Number(req.params.id);
  if (id === req.session.userId) {
    return res.status(400).json({ error: 'Нельзя удалить себя' });
  }
  User.remove(id);
  Activity.log({ user_id: req.session.userId, action: 'user.delete',
                 entity_type: 'user', entity_id: id });
  res.json({ ok: true });
};

exports.getTrash = (req, res) => {
  res.json({
    users: User.listDeleted(),
    tasks: Task.listDeleted()
  });
};

exports.restoreUser = (req, res) => {
  const id = Number(req.params.id);
  User.restore(id);
  Activity.log({ user_id: req.session.userId, action: 'user.restore',
                 entity_type: 'user', entity_id: id });
  res.json({ ok: true, message: 'Пользователь восстановлен' });
};

exports.restoreTask = (req, res) => {
  const id = Number(req.params.id);
  Task.restore(id);
  Activity.log({ user_id: req.session.userId, action: 'task.restore',
                 entity_type: 'task', entity_id: id });
  res.json({ ok: true, message: 'Задача восстановлена' });
};

exports.activityLog = (req, res) => res.json(Activity.recent(200));
