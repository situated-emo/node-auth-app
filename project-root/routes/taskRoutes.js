const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/taskController');
const commentCtrl = require('../controllers/commentController');
const { requirePermission } = require('../middleware/roles');

router.get('/',
  requirePermission('task:read-own'),
  ctrl.list);

router.get('/:id',
  requirePermission('task:read-own'),
  ctrl.get);

router.post('/',
  requirePermission('task:create'),
  ctrl.create);

router.put('/:id',
  requirePermission('task:edit-own'),
  ctrl.update);

router.delete('/:id',
  requirePermission('task:delete'),
  ctrl.remove);

router.get('/:taskId/comments',
  requirePermission('task:read-own'),
  commentCtrl.listByTask);

router.post('/:taskId/comments',
  requirePermission('comment:create'),
  commentCtrl.create);

module.exports = router;