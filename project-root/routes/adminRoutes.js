const express = require('express');
const router = express.Router();
const ctrl    = require('../controllers/adminController');
const { requirePermission } = require('../middleware/roles');

router.get('/users',      requirePermission('task:assign'), ctrl.listUsers);
router.patch('/users/:id/role', requirePermission('role:change'), ctrl.changeRole);
router.delete('/users/:id',     requirePermission('user:manage'), ctrl.deleteUser);
router.get('/activity',         requirePermission('log:read'),   ctrl.activityLog);

module.exports = router;
