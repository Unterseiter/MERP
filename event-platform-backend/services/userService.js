const { User } = require('../models');

const userService = {
  // Создание пользователя
  async createUser(userData) {
    try {

      const { tag_name, email } = userData;
      const emailCheck = await User.findOne({
        where: {
          email: email
        }
      });
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
      if (resulst.emailCheck == "Ok" || resulst.userCheck == "Ok") {
        console.log(resulst);
        return { error: 'Пользователь c такими данными уже существует' };
      };

      const user = await User.create(userData);

      return resulst;
    } catch (error) {
      throw error;
    }
  },

  // Получение пользователя по tag_user
  async getUserByTag(tag_user) {
    try {
      console.log(tag_user);
      const user = await User.scope('withoutPassword').findOne({ where: { tag_name: tag_user } });
      console.log(user);
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

  async getAllUser() {
    try {
      const user = await User.scope('withoutPassword').findAll();
      console.log(user);
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