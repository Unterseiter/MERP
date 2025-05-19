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
      const user = await User.scope('withoutPassword').findOne({ where: { tag_name: tag_user } });
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
  async getAllUser(page = 1, sortDirection = 'ASC') { // sortDirection: ASC/DESC
    try {
      // Фиксированный размер страницы
      const pageSize = 10;
      
      // Валидация параметров
      page = Math.max(1, parseInt(page));
      sortDirection = ['ASC', 'DESC'].includes(sortDirection.toUpperCase()) 
        ? sortDirection.toUpperCase() 
        : 'ASC';
  
      const offset = (page - 1) * pageSize;
  
      const { count, rows: users } = await User.scope('withoutPassword').findAndCountAll({
        limit: pageSize,
        offset: offset,
        order: [['tags', sortDirection]] // Сортировка по полю tags
      });
  
      return {
        users,
        meta: {
          total: count,
          totalPages: Math.ceil(count / pageSize),
          page: page,
          pageSize: pageSize, // Фиксированное значение 10
          sortBy: 'tags',     // Информация о сортировке
          sortDirection: sortDirection
        }
      };
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
 