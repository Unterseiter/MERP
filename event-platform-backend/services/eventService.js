const { Event, Message, RequestEvent, User } = require('../models');
const Sequelize = require('../config/bd');
const { Op } = require('sequelize');
const Check_Privilege = require('../utils/privilege');

const eventService = {

  async getEvents(filters = {}) {
    const {
      page = 1,
      limited = 10,
      search,
      startDate,
      endDate,
      sortBy = 'start_date',
      sortOrder = 'ASC',
      creatorTag,
      minViews,
      maxViews,
    } = filters;

    const where = {};

    // Фильтр по создателю
    if (creatorTag) where.creator_tag = creatorTag;

    // Фильтр по текстовому поиску
    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;

      where[Op.or] = [
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('name')),
          { [Op.like]: searchTerm }
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('description')),
          { [Op.like]: searchTerm }
        )
      ]
    }

    // Фильтр по датам
    if (startDate && endDate) {
      where.start_date = { [Op.between]: [startDate, endDate] };
    } else {
      if (startDate) where.start_date = { [Op.gte]: startDate };
      if (endDate) where.end_date = { [Op.lte]: endDate };
    }

    // Исключение просроченных мероприятий
    where.end_date = { [Op.gte]: new Date() };

    // Фильтр по просмотрам
    if (minViews) where.views = { [Op.gte]: minViews };
    if (maxViews) where.views = { ...where.views, [Op.lte]: maxViews };

    return Event.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limited: parseInt(limited),
      offset: (page - 1) * limited,
      distinct: true,
    });
  },

  // Создание нового мероприятия
  async createEvent(eventData) {
    try {
      // 1. Валидация и преобразование дат
      if (!eventData.start_date || !eventData.end_date) {
        throw new Error('Missing required date fields');
      }
  
      // 2. Преобразуем даты в объекты Date
      const startDate = new Date(eventData.start_date);
      const endDate = new Date(eventData.end_date); // Исправлено с end_date на eventData.end_date
  
      // 3. Валидация корректности дат
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start_date format');
      }
      
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end_date format');
      }
  
      // 4. Проверка логики дат
      if (startDate >= endDate) {
        throw new Error('end_date must be greater than start_date');
      }

      // 6. Создаем событие с преобразованными датами
      const event = await Event.create({ 
        ...eventData,
        start_date: startDate,
        end_date: endDate
      });
  
      return event;
    } catch (error) {
      // 7. Улучшенная обработка ошибок
      console.error('Error creating event:', {
        error: error.message,
        inputData: eventData
      });
      throw new Error(`Event creation failed: ${error.message}`);
    }
  },

  // Получение всех мероприятий
  async getAllEvents() {
    try {
      const events = await Event.findAll();
      return events;
    } catch (error) {
      throw error;
    }
  },

  // Получение всех активных мероприятий
  async getAllActiveEvents() {
    try {
      const events = await Event.findAll({
        where: {
          start_date: { [Op.lte]: new Date() },
          end_date: { [Op.gte]: new Date() }
        }
      });
      return events;
    } catch (error) {
      throw error;
    }
  },

  // Получение мероприятия по ID
  async getEventById(id) {
    try {
      const event = await Event.findByPk(id);
      return event;
    } catch (error) {
      throw error;
    }
  },

  // Получение мероприятия по tag_user
  async getEventBytag_name(tag_user) {
    try {
      const event = await Event.findAll({
        where: {
          creator_tag: tag_user
        },
      });
      return event;
    } catch (error) {
      throw error;
    }
  },

  // Обновление мероприятия
  async updateEvent(id, eventData, creator = null) {
    try {
      const event = await Event.findByPk(id);
      if (!event) return null;
      if (creator != null && Check_Privilege(event.creator_tag, creator)) {
        throw new Error('У вас нет прав для обновления этого мероприятия');
      }
      await event.update(eventData);
      return event;
    } catch (error) {
      throw error;
    }
  },

  // Удаление мероприятия
  async deleteEvent(id, creator) {
    try {
      /*Покамесь сделаю так в будущем нужно сделать чтобы удалять нельзя было, можно было-бы поставить метку удалён */
      const event = await Event.findByPk(id);
      if (!event) return false;
      if (!Check_Privilege(event.creator_tag, creator)) {
        throw new Error('У вас нет прав для удаления этого мероприятия');
      }
      await event.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  },
  //получение мероприятий в которых есть сообщения 
  async getEventsWithMessages(userTag) {
    try {
      return await Event.findAll({
        where: { creator_tag: userTag },
        include: [{
          model: Message,
          as: 'Messages',
          required: true,
          attributes: ['message_id', 'context', 'created_at'], // Соответствует таблице Message
          where: {
            event_id: Sequelize.col('Event.event_id') // Явное указание связи
          }
        }],
        attributes: ['event_id', 'name', 'description', 'views']
      });
    } catch (error) {
      throw new Error(`Ошибка получения мероприятий: ${error.message}`);
    }
  },

  // Мероприятия с непринятыми заявками (status = 'expectation')
  async getEventsWithPendingRequests(userTag) {
    try {
      return await Event.findAll({
        where: { creator_tag: userTag },
        include: [{
          model: RequestEvent,
          as: 'Requests',
          where: {
            status: 'expectation',
            event_id: Sequelize.col('Event.event_id') // Корректная связь
          },
          required: true,
          attributes: ['request_id', 'status', 'created_at'],
          include: [{
            model: User,
            as: 'Requester',
            foreignKey: 'user_tag', // Правильное имя поля
            attributes: ['tag_name', 'name']
          }]
        }],
        attributes: ['event_id', 'name', 'limited', 'views']
      });
    } catch (error) {
      throw new Error(`Ошибка получения заявок: ${error.message}`);
    }
  }
};

module.exports = eventService;