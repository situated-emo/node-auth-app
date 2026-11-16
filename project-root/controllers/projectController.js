const Project  = require('../models/projectModel');
const Task     = require('../models/taskModel');
const Activity = require('../models/activityModel');

exports.list = (req, res) => res.json(Project.all());

exports.get = (req, res) => {
  const p = Project.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Проект не найден' });
  res.json({ ...p, tasks: Task.byProject(p.id) });
};

exports.create = (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'title обязателен' });
  const r = Project.create({ title, description: description || null,
                              owner_id: req.session.userId });
  Activity.log({ user_id: req.session.userId, action: 'project.create',
                 entity_type: 'project', entity_id: r.lastInsertRowid, details: title });
  res.status(201).json({ id: r.lastInsertRowid });
};

exports.update = (req, res) => {
  const p = Project.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  Project.update({
    id: p.id,
    title:       req.body.title       ?? p.title,
    description: req.body.description ?? p.description,
    archived:    req.body.archived !== undefined ? Number(req.body.archived) : p.archived
  });
  res.json({ ok: true });
};