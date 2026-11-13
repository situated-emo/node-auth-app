const bcrypt = require('bcrypt');
const User = require('../models/userModel');

exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Введите имя и пароль' });
  }

  try {
    const existing = User.findByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hash = await bcrypt.hash(password, 10);
    User.createUser(username, hash);
    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Введите имя и пароль' });
  }

  const user = User.findByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Неверное имя или пароль' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Неверное имя или пароль' });
  }

  // Сохраняем пользователя в сессии
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;
  const redirectUrl = user.role === 'admin' ? '/admin.html' : '/dashboard.html';
  res.json({ message: 'Вход выполнен', redirect: '/dashboard.html' });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Выход выполнен' });
  });
};

