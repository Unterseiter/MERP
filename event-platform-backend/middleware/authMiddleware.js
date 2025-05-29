// Middleware для проверки JWT токена и авторизации пользователя
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // Получаем токен из cookies
  const token = req.cookies.jwt;

  // Удаляем отладочные логи для чистоты кода
  // console.log(`token: ${token}`);
  // console.log(`process.env.JWT_SECRET: ${process.env.JWT_SECRET}`);

  // Если токен отсутствует, возвращаем ошибку авторизации
  if (!token) {
    return res.status(401).json({ message: 'Токен отсутствует, авторизация требуется' });
  }
  try {
    // Проверяем валидность токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Добавляем данные пользователя в объект запроса для дальнейшего использования
    req.user = decoded;
    // Передаем управление следующему middleware или обработчику
    next();
  } catch (error) {
    // Если токен невалиден, возвращаем ошибку авторизации
    res.status(401).json({ message: 'Неверный токен' });
  }
};

module.exports = authMiddleware;
