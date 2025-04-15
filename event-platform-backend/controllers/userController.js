const userService = require('../services/userService');
const { sequelize, Event, RequestEvent, history, User } = require('../models');
const { Op } = require('sequelize');
const moveExpiredEventsToHistoryUser = require('../services/cron/HistoryUser');


const userController = {
  // Получение профиля пользователя
  async getProfile(req, res) {
    try {
      const ProfileData = {
        info: {},
        events: [],
        history: [],
      };

      // Получаем данные пользователя
      const user = await User.findOne({
        where: { tag_name: req.user.tag_name },
        attributes: { exclude: ['password', 'privilege'] }, // Исключаем пароль
      });

      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      //заносим в историю просроченные мероприятия
      moveExpiredEventsToHistoryUser(user.tag_name);

      // Заполняем info
      ProfileData.info = {
        id: user.id,
        tag_name: user.tag_name,
        city: user.city,
        name: user.name,
        email: user.email,
      };

      // Получаем активные события (создатель или участник)
      const currentDate = new Date().toISOString().split('T')[0];
      const events = await Event.findAll({
        where: {
          [Op.or]: [
            { creator_tag: req.user.tag_name }, // Пользователь — создатель
            {
              event_id: {
                [Op.in]: await RequestEvent.findAll({
                  where: {
                    user_tag: req.user.tag_name,
                    status: 'accept',
                  },
                  attributes: ['event_id'],
                  raw: true,
                }).then((results) => results.map((r) => r.event_id)),
              },
            },
          ],
          end_date: {
            [Op.gte]: currentDate,
          },
        },
        attributes: ['event_id', 'name', 'limited', 'start_date', 'end_date', 'description', 'creator_tag', 'views'],
      });

      // Заполняем events
      ProfileData.events = events.map((event) => ({
        event_id: event.event_id,
        name: event.name,
        limited: event.limited,
        start_date: event.start_date,
        end_date: event.end_date,
        description: event.description,
        creator_tag: event.creator_tag,
        views: event.views,
      }));

      // Получаем историю только
      const historyRecords = await history.findAll({
        where: { user_tag: req.user.tag_name },
        attributes: [
          'history_id',
          'user_tag',
          'event_name',
          'event_description',
          'event_date_start',
          'history_status',
          'is_complaint',
        ],
        order: [['history_id', 'DESC']], 
        limit: 20
      });

      // Заполняем history
      ProfileData.history = historyRecords.map((record) => ({
        history_id: record.history_id,
        event_name: record.event_name,
        event_description: record.event_description,
        event_date_start: record.event_date_start,
        history_status: record.history_status,
        is_complaint: record.is_complaint,
      }));

      // Возвращаем полный профиль
      res.json(ProfileData);
    } catch (error) {
      console.error('Ошибка при получении профиля:', error);
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