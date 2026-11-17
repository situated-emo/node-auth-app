const Task     = require('../models/taskModel');
const Project  = require('../models/projectModel');
const Activity = require('../models/activityModel');
const { can }  = require('../middleware/roles');

const VALID_STATUSES   = ['todo', 'in_progress', 'review', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

// GET /api/tasks — менеджер/админ видят все, остальные — свои
exports.list = (req, res) => {
  const canReadAll = can(req.session.role, 'task:read-all');

  const q        = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const status   = VALID_STATUSES.includes(req.query.status) ? req.query.status : null;
  const priority = VALID_PRIORITIES.includes(req.query.priority) ? req.query.priority : null;

  let assigneeId = null;
  let unassigned = false;

  // Фильтр по исполнителю доступен только тем, кто видит все задачи
  if (canReadAll && req.query.assignee_id) {
    if (req.query.assignee_id === 'unassigned') {
      unassigned = true;
    } else if (!Number.isNaN(Number(req.query.assignee_id))) {
      assigneeId = Number(req.query.assignee_id);
    }
  }

  const tasks = Task.filter({
    q: q || null,
    status,
    priority,
    assigneeId,
    unassigned,
    restrictedUserId: canReadAll ? null : req.session.userId
  });

  res.json(tasks);
};

// GET /api/tasks/:id
exports.get = (req, res) => {
  const task = Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });

  const isParticipant = task.assignee_id === req.session.userId
                     || task.author_id   === req.session.userId;
  if (!can(req.session.role, 'task:read-all') && !isParticipant) {
    return res.status(403).json({ error: 'Нет доступа к задаче' });
  }
  res.json(task);
};

// POST /api/tasks
exports.create = (req, res) => {
  const { project_id, title, description, priority, assignee_id, due_date } = req.body;
  if (!title || !project_id) {
    return res.status(400).json({ error: 'title и project_id обязательны' });
  }
  if (!Project.findById(project_id)) {
    return res.status(400).json({ error: 'Проект не найден' });
  }

  // Назначать исполнителя может только менеджер/админ
  const finalAssignee = can(req.session.role, 'task:assign') && assignee_id
    ? assignee_id
    : req.session.userId; // иначе назначаем на себя

  const result = Task.create({
    project_id,
    title,
    description: description || null,
    priority:    VALID_PRIORITIES.includes(priority) ? priority : 'medium',
    author_id:   req.session.userId,
    assignee_id: finalAssignee,
    due_date:    due_date || null
  });

  Activity.log({
    user_id: req.session.userId,
    action: 'task.create',
    entity_type: 'task',
    entity_id: result.lastInsertRowid,
    details: title
  });

  res.status(201).json({ id: result.lastInsertRowid });
};

// PUT /api/tasks/:id
exports.update = (req, res) => {
  const task = Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Не найдено' });

  const isAuthor   = task.author_id === req.session.userId;
  const isAssignee = task.assignee_id === req.session.userId;
  const canEditAny = can(req.session.role, 'task:edit-any');
  if (!canEditAny && !isAuthor && !isAssignee) {
    return res.status(403).json({ error: 'Нет прав на редактирование' });
  }

  Task.update({
    id:          task.id,
    title:       req.body.title       ?? task.title,
    description: req.body.description ?? task.description,
    status:      VALID_STATUSES.includes(req.body.status)     ? req.body.status   : task.status,
    priority:    VALID_PRIORITIES.includes(req.body.priority) ? req.body.priority : task.priority,
    assignee_id: canEditAny ? (req.body.assignee_id ?? task.assignee_id) : task.assignee_id,
    due_date:    req.body.due_date ?? task.due_date
  });

  Activity.log({ user_id: req.session.userId, action: 'task.update',
                 entity_type: 'task', entity_id: task.id });
  res.json({ ok: true });
};

// DELETE /api/tasks/:id — только manager/admin (проверено middleware)
exports.remove = (req, res) => {
  const task = Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Не найдено' });

  Task.remove(task.id);
  Activity.log({ user_id: req.session.userId, action: 'task.delete',
                 entity_type: 'task', entity_id: task.id, details: task.title });
  res.json({ ok: true });
};