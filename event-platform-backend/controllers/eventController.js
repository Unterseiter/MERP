const Joi = require('joi');
const { Event, RequestEvent } = require('../models');
const { ValidationError, ForbiddenError, NotFoundError } = require('../utils/errors');
const eventService = require('../services/eventService');

// Схемы валидации
const eventSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
  limited: Joi.number().min(0),
  creator_tag: Joi.string().forbidden(), // Запрещаем ручную установку
  views: Joi.number().forbidden() // Запрещаем ручную установку
});

const eventUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(1000),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  limited: Joi.number().min(0)
}).min(1);



const eventController = {
  // Создание мероприятия
  async createEvent(req, res, next) {
    try {
      console.log(req.body);

      const { error, value } = eventSchema.validate(req.body);
      if (error) throw new ValidationError(error.details);

      const eventData = {
        ...value,
        creator_tag: req.user.tag_name
      };

      const event = await eventService.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  },

  // Получение мероприятий с фильтрацией
  async getEvents(req, res, next) {
    try {
      // Схема валидации параметров запроса
      const { error, value } = Joi.object({
        page: Joi.number().min(1).default(1),
        limited: Joi.number().min(1).max(100).default(10),
        search: Joi.string().max(100), // Параметр для поиска по тексту
        startDate: Joi.date().iso(),   // Фильтр по дате начала
        endDate: Joi.date().iso(),     // Фильтр по дате окончания
        sortBy: Joi.string().valid('start_date', 'end_date', 'views').default('start_date'),
        sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC')
      }).validate(req.query);

      if (error) throw new ValidationError(error.details);

      // Передаем параметры в сервис
      const result = await eventService.getEvents({
        ...value,
        creatorTag: req.user.tag_name
      });

      // Формируем ответ
      res.json({
        data: result.rows,
        meta: {
          total: result.count,
          page: value.page,
          totalPages: Math.ceil(result.count / value.limited),
          limited: value.limited
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Получение мероприятия по ID
  async getEventById(req, res, next) {
    try {
      const event = await eventService.getEventById(req.params.id);
      if (!event) throw new NotFoundError('Мероприятие не найдено');
      
      eventService.updateEvent(event.event_id, {views:event.views+1});
      res.json(event);
    } catch (error) {
      next(error);
    }
  },

  // Обновление мероприятия
  async updateEvent(req, res, next) {
    try {
      // Проверка прав доступа
      const event = await Event.findByPk(req.params.id);
      if (!event) throw new NotFoundError('Мероприятие не найдено');
      
      if (event.creator_tag !== req.user.tag_name && !req.user.isAdmin) {
        throw new ForbiddenError('Недостаточно прав');
      }

      // Валидация
      const { error, value } = eventUpdateSchema.validate(req.body);
      if (error) throw new ValidationError(error.details);

      // Обновление
      const updatedEvent = await eventService.updateEvent(req.params.id, value);
      res.json(updatedEvent);
    } catch (error) {
      next(error);
    }
  },

  // Удаление мероприятия
  async deleteEvent(req, res, next) {
    try {
      // Проверка прав доступа
      const event = await Event.findByPk(req.params.id);
      if (!event) throw new NotFoundError('Мероприятие не найдено');
      
      if (event.creator_tag !== req.user.tag_name && !req.user.isAdmin) {
        throw new ForbiddenError('Недостаточно прав');
      }

      // Удаление
      await eventService.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = eventController;