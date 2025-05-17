
// Контроллер для аутентификации пользователей
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Модель User
const userService = require('../services/userService');
require('dotenv').config();

const authController = {
  // Регистрация нового пользователя
  async signup(req, res) {
    try {
      const { tag_name, name, email, password, city } = req.body;

      // Проверяем, существует ли пользователь с таким email
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      }
      // Проверяем, существует ли пользователь с таким tag_name
      const existingTags = await User.findOne({ where: { tag_name } });
      if (existingTags) {
        return res.status(400).json({ message: 'Пользователь с таким tag_name уже существует' });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создаем нового пользователя через сервис
      const Created = userService.createUser({ tag_name: tag_name, name: name, email: email, password: hashedPassword, privilege: "user", city: city });

      res.status(201).json({ message: 'Пользователь успешно зарегистрирован', created: Created });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Вход пользователя
  async login(req, res) {
    try {
      const { tag_name, password } = req.body;
      // Ищем пользователя по tag_name
      const user = await User.findOne({ where: { tag_name } });
      if (!user) {
        return res.status(401).json({ message: 'Неверный tag_name или пароль' });
      }
      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Неверный пароль' });
      }

      // Генерируем JWT-токен
      const token = jwt.sign({ tag_name: user.tag_name, id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Устанавливаем токен в httpOnly cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 1 * 24 * 60 * 60 * 1000
      });

      res.json({ message: 'Успешный вход', user: { tag_name: user.tag_name, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // Выход пользователя
  async logout(req, res) {
    try {
      // Очищаем куки
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
      });

      res.json({ message: 'Успешный выход' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = authController;
