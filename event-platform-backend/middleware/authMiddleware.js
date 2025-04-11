const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.cookie.jwt;
  console.log(`token: ${token}`);
  console.log(`process.env.JWT_SECRET: ${process.env.JWT_SECRET}`);
  if (!token) {
    return res.status(401).json({ message: 'Токен отсутствует, авторизация требуется' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; // Добавляем данные пользователя в запрос
    next(); // Переходим к следующему обработчику
  } catch (error) {
    res.status(401).json({ message: 'Неверный токен' });
  }
};

module.exports = authMiddleware;