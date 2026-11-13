const User = require('../models/userModel');


// Получить всех пользователей
exports.getUsers = (req, res) => {
  try {
    const users = User.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
};

// Изменить имя или роль пользователя
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { username, role } = req.body;

  if (!username || !role) {
    return res.status(400).json({ error: 'Имя и роль обязательны' });
  }

  try {
    User.updateUser(id, username, role);
    res.json({ message: 'Данные пользователя обновлены' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при обновлении (возможно, имя занято)' });
  }
};

// Удалить пользователя
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  try {
    User.deleteUser(id);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении' });
  }
};
