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

const getEventsSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limited: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow('').max(100),
  sortBy: Joi.string().valid('start_date', 'end_date', 'views').default('start_date'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC'),
  minViews: Joi.number().min(0).default(0),
  maxViews: Joi.number().min(0).default(0),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional()
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
        creator_tag: req.user.tag_name,
        views: 0
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

      // Преобразование параметров
      const processedQuery = {
        ...req.query,
        page: Number(req.query.page) || 1,
        limited: Number(req.query.limited) || 10,
        minViews: Number(req.query.minViews) || 0,
        maxViews: Number(req.query.maxViews) || 0
      };

      // Валидация
      const { error, value } = getEventsSchema.validate(processedQuery, {
        abortEarly: false
      });

      if (error) {
        const details = error.details.map(d => ({
          field: d.path[0],
          message: d.message
        }));
        throw new ValidationError(details);
      }
      // Преобразование дат в объекты Date
      const processedParams = {
        ...value,
        startDate: value.startDate ? new Date(value.startDate) : null,
        endDate: value.endDate ? new Date(value.endDate) : null
      };

      // Проверка корректности дат
      if (processedParams.startDate && isNaN(processedParams.startDate.getTime())) {
        throw new ValidationError([{
          message: 'Invalid startDate format',
          path: ['startDate']
        }]);
      }

      if (processedParams.endDate && isNaN(processedParams.endDate.getTime())) {
        throw new ValidationError([{
          message: 'Invalid endDate format',
          path: ['endDate']
        }]);
      }

      const result = await eventService.getEvents({
        ...processedParams,
        creatorTag: req.user.tag_name
      });

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

      eventService.updateEvent(event.event_id, { views: event.views + 1 });
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
      await eventService.deleteEvent(req.params.id, req.user.tag_name);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = eventController;