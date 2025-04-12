const userService = require('../services/userService');

const userController = {
  // Получение профиля пользователя
  async getProfile(req, res) {
    try {
      const ProfileData = {
        info:{},
        events:[],
        history:[]
      }
      const user = await userService.getUserByTag(req.user.tag_name);
      if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  //получение всех пользователей
  async getAllProfile(req, res) {
    try {
      const user = await userService.getAllUser();
      if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Обновление профиля
  async updateProfile(req, res) {
    try {
      const user = await userService.updateUser(
        req.body,
        req.user.tag_name
      );
      res.json(user);
    } catch (error) {
      const status = error.message.includes('прав') ? 403 : 500;
      res.status(status).json({ message: error.message });
    }
  },

  // Удаление профиля
  async deleteProfile(req, res) {
    try {
      const success = await userService.deleteUser(req.params.id);
      if (!success) return res.status(404).json({ message: 'Пользователь не найден' });
      res.status(204).send();
    } catch (error) {
      const status = error.message.includes('прав') ? 403 : 500;
      res.status(status).json({ message: error.message });
    }
  },
};

module.exports = userController;