const express = require('express');
const router = express.Router();
const ctrl    = require('../controllers/projectController');
const { requirePermission } = require('../middleware/roles');

router.get('/',     requirePermission('project:read'),   ctrl.list);
router.get('/:id',  requirePermission('project:read'),   ctrl.get);
router.post('/',    requirePermission('project:create'), ctrl.create);
router.put('/:id',  requirePermission('project:edit'),   ctrl.update);

module.exports = router;