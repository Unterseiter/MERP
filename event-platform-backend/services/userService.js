// Сервис для работы с пользователями (User)
const { User } = require('../models');

const userService = {
  // Создание пользователя
  async createUser(userData) {
    try {
      const { tag_name, email } = userData;

      // Проверка существования пользователя с таким email
      const emailCheck = await User.findOne({
        where: {
          email: email
        }
      });

      // Проверка существования пользователя с таким tag_name
      const userCheck = await User.findOne({
        where: {
          tag_name: tag_name
        }
      });

      const resulst = {
        created_load: userData,
        emailCheck: emailCheck ? "Ok" : "No",
        userCheck: userCheck ? "Ok" : "No"
      };

      // Если пользователь с таким email или tag_name уже существует, возвращаем ошибку
      if (resulst.emailCheck == "Ok" || resulst.userCheck == "Ok") {
        // console.log(resulst); // Удален для чистоты кода
        return { error: 'Пользователь c такими данными уже существует' };
      };

      // Создаем нового пользователя
      const user = await User.create(userData);

      return resulst;
    } catch (error) {
      throw error;
    }
  },

  // Получение пользователя по tag_user
  async getUserByTag(tag_user) {
    try {
      // console.log(tag_user); // Удален для чистоты кода
      const user = await User.scope('withoutPassword').findOne({ where: { tag_name: tag_user } });
      // console.log(user); // Удален для чистоты кода
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Получение пользователя по email
  async getUserByEmail(email) {
    try {
      const user = await User.scope('withoutPassword').findOne({ where: { email } });
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Получение всех пользователей
  async getAllUser() {
    try {
      // console.log(user); // Удален для чистоты кода
      const user = await User.scope('withoutPassword').findAll();
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Обновление данных пользователя
  async updateUser(userData, requesterId) {
    try {
      const user = await User.scope('withoutPassword').findByPk(requesterId);
      if (!user) return null;
      await user.update(userData);
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Удаление пользователя
  async deleteUser(id) {
    try {
      const user = await User.scope('withoutPassword').findByPk(id);
      if (!user) return false;
      await user.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = userService;
 