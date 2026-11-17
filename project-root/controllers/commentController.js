const Comment = require('../models/commentModel');
const Task    = require('../models/taskModel');
const { can } = require('../middleware/roles');

exports.listByTask = (req, res) => {
  const task = Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });
  const isParticipant = task.assignee_id === req.session.userId
                     || task.author_id   === req.session.userId;
  if (!can(req.session.role, 'task:read-all') && !isParticipant) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  res.json(Comment.byTask(task.id));
};

exports.create = (req, res) => {
  const task = Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });

  const isParticipant = task.assignee_id === req.session.userId
                     || task.author_id   === req.session.userId;
  if (!can(req.session.role, 'task:read-all') && !isParticipant) {
    return res.status(403).json({ error: 'Нет доступа к задаче' });
  }

  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'Пустой комментарий' });
  Comment.create(task.id, req.session.userId, body.trim());
  res.status(201).json({ ok: true });
};