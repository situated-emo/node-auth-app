const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);


const { requireAuth } = require('../middleware/roles');
router.get('/me', requireAuth, authController.me);

const User = require('../models/userModel');
const { isAuthenticated } = require('../middleware/auth');

router.get('/users', isAuthenticated, (req, res) => {
  const users = User.listAll().map(u => ({ id: u.id, username: u.username, role: u.role }));
  res.json(users);
});
module.exports = router;