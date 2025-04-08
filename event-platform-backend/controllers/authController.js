
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Подразумевается, что у вас есть модель User
const userService = require('../services/userService');
require('dotenv').config();

const authController = {
  // Регистрация нового пользователя
  async signup(req, res) {
    try {
      const { tag_name, name, email, password, privilege, city} = req.body;

      // Проверяем, существует ли пользователь с таким email
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      }
      // Проверяем, существует ли пользователь с таким email
      const existingTags = await User.findOne({ where: { tag_name } });
      if (existingTags) {
        return res.status(400).json({ message: 'Пользователь с таким tag_name уже существует' });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log(req.body);

      // Создаем нового пользователя
      const Created = userService.createUser({ tag_name: tag_name, name: name, email: email, password: hashedPassword, privilege:privilege, city:city });

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
      const isPasswordValid2 = password === user.password;

      if (!isPasswordValid && !isPasswordValid2) {
        return res.status(401).json({ message: 'Неверный email или пароль' });
      }

      // Генерируем JWT-токен
      const token = jwt.sign({ tag_name: user.tag_name }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log(token);

      res.json({ token: token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = authController;
