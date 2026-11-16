const express = require('express');
const session = require('express-session');
const path = require('path');
const { runMigrations } = require('./config/migrations');
runMigrations();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { isAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON и данных форм
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
  secret: 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // для локальной разработки
}));

app.get('/admin.html', isAdmin, (req, res, next) => {
  next();
});

// Подключаем статику (важно, чтобы защита /admin.html шла ДО express.static)
app.use(express.static(path.join(__dirname, 'public')));

const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Статические файлы (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));


// Главная страница — редирект на форму входа
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});