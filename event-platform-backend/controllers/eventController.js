const Joi = require('joi');
const { Event } = require('../models');
const { ValidationError, ForbiddenError, NotFoundError } = require('../utils/errors');
const eventService = require('../services/eventService');
const { logger } = require('../utils/LogFile');
const { eventMainUploader, eventGalleryUploader } = require('../config/fileUploaders');
const path = require('path');
const fs = require('fs').promises;

// Схемы валидации
const eventSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
  limited: Joi.number().min(0),
  creator_tag: Joi.string().forbidden(),
  views: Joi.number().forbidden(),
  photo_url: Joi.string()
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
  endDate: Joi.date().iso().optional(),
});

const eventUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(1000),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  limited: Joi.number().min(0),
  photo_url: Joi.string()
});

const eventController = {
  // Вспомогательные методы
  _formatPhotoUrl(photoUrl) {
    if (!photoUrl) return null;
    return `${process.env.CORS_ORIGIN_DEV}:${process.env.PORT}${photoUrl}`;
  },

  async _handleFileUpload(req, existingEvent = null) {
    if (!req.file) return {};

    const event = await Event.findByPk(req.params.id);
    console.log("переделка");
    console.log(event.photo_url);
    console.log(req.body.photo_url);
    if (event.photo_url !== req.body.photo_url) {
      return {
        photo_url: req.body.photo_url
      };
    }
    try {
      logger.info(`Processing file: ${req.file.originalname}`);

      // Удаление старого файла
      if (existingEvent?.photo_url) {
        const oldFileName = existingEvent.photo_url.split('/').pop();
        const oldPath = path.join(eventMainUploader.finalDir, oldFileName);

        await fs.unlink(oldPath).catch(err =>
          logger.warn(`Failed to delete old file: ${err.message}`)
        );
      }

      return {
        photo_url: `/uploads/events/main/${req.file.filename}`
      };
    } catch (error) {
      logger.error(`File processing failed: ${error.message}`);
      throw error;
    }
  },

  async _handleFileError(req, error) {
    if (req.file?.path) {
      try {
        await eventMainUploader.cleanupTempFile(req.file.path);
      } catch (cleanupError) {
        logger.error(`Cleanup failed: ${cleanupError.message}`);
      }
    }
  },

  _checkPermissions(event, user) {
    if (event.creator_tag !== user.tag_name && !user.isAdmin) {
      logger.warn(`Permission denied for user ${user.tag_name} on event ${event.event_id}`);
      throw new ForbiddenError('Недостаточно прав');
    }
  },

  async createEvent(req, res, next) {
    try {
      const { error, value } = eventSchema.validate(req.body);
      console.log(req.body);
      if (error) throw new ValidationError(error.details);

      const eventData = {
        ...value,
        creator_tag: req.user.tag_name,
        views: 0,
        photo_url: req.file ? eventController._formatPhotoUrl(`/uploads/events/main/${req.file.filename}`) : null
      };6

      const event = await eventService.createEvent(eventData);
      logger.info(`Event created: ID ${event.event_id}`);

      res.status(201).json({
        ...event.toJSON(),
        photo_url: event.photo_url
      });

    } catch (error) {
      await eventController._handleFileError(req, error);
      next(error);
    }
  },

  async getEvents(req, res, next) {
    try {
      const processedQuery = {
        ...req.query,
        page: Number(req.query.page) || 1,
        limited: Number(req.query.limited) || 10,
        minViews: Number(req.query.minViews) || 0,
        maxViews: Number(req.query.maxViews) || 0,
      };

      const { error, value } = getEventsSchema.validate(processedQuery, { abortEarly: false });
      if (error) throw new ValidationError(error.details.map(d => ({
        field: d.path[0],
        message: d.message
      })));

      const result = await eventService.getEvents(value);
      const data = result.rows.map(event => ({
        ...event.toJSON(),
        photo_url: event.photo_url
      }));

      logger.info(`Fetched ${result.count} events`);
      res.json({
        data,
        meta: {
          total: result.count,
          page: value.page,
          totalPages: Math.ceil(result.count / value.limited),
          limited: value.limited,
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getEventById(req, res, next) {
    try {
      const event = await eventService.getEventById(req.params.id);
      if (!event) throw new NotFoundError('Мероприятие не найдено');

      await eventService.updateEvent(event.event_id, { views: event.views + 1 });
      logger.info(`Event viewed: ID ${event.event_id}`);

      res.json({
        ...event.toJSON(),
        photo_url: event.photo_url
      });
    } catch (error) {
      next(error);
    }
  },

  async updateEvent(req, res, next) {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) throw new NotFoundError('Мероприятие не найдено');
      eventController._checkPermissions(event, req.user);

      const validobj = {
        name: req.body.name,
        description: req.body.description,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        limited: req.body.limited,
        photo_url: req.body.photo_url
      }
      const { error, value } = eventUpdateSchema.validate(validobj);
      console.log("пришло");
      console.log(req.body);
      if (error) throw new ValidationError(error.details);

      const fileData = await eventController._handleFileUpload(req, event);
      value.photo_url = eventController._formatPhotoUrl(fileData.photo_url);
      console.log("cтало");
      console.log(fileData);

      const updatedEvent = await eventService.updateEvent(req.params.id, {
        ...value,
      });
      const validphoto = req.body.photo_url !== event.photo_url;

      logger.info(`Event updated: ID ${updatedEvent.event_id}`);
      res.json({
        ...updatedEvent.toJSON(),
        photo_url: validphoto ? updatedEvent.photo_url : eventController._formatPhotoUrl(updatedEvent.photo_url)
      });

    } catch (error) {
      await eventController._handleFileError(req, error);
      next(error);
    }
  },

  async deleteEvent(req, res, next) {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) throw new NotFoundError('Мероприятие не найдено');
      eventController._checkPermissions(event, req.user);

      if (event.photo_url) {
        const filePath = path.join(eventMainUploader.finalDir, event.photo_url.split('/').pop());
        await fs.unlink(filePath).catch(err =>
          logger.warn(`Failed to delete file: ${err.message}`)
        );
      }

      await eventService.deleteEvent(req.params.id);
      logger.info(`Event deleted: ID ${event.event_id}`);
      res.status(204).send();

    } catch (error) {
      next(error);
    }
  },
  async getUserRelatedEvents(req, res, next) {
    try {
      const userTag = req.user.tag_name;

      const events = await eventService.getUserRelatedEvents(userTag);

      res.json({
        data: events
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadEventPhoto(req, res, next) {
    try {
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) throw new ValidationError('Некорректный ID события');

      const event = await Event.findByPk(eventId);
      if (!event) throw new NotFoundError('Мероприятие не найдено');
      eventController._checkPermissions(event, req.user);

      const fileData = await eventController._handleFileUpload(req, event);
      const updatedEvent = await eventService.updateEvent(eventId, fileData);

      logger.info(`Photo uploaded for event: ID ${eventId}`);
      res.json({
        photo_url: eventController._formatPhotoUrl(updatedEvent.photo_url)
      });

    } catch (error) {
      await eventController._handleFileError(req, error);
      next(error);
    }
  },

};

module.exports = eventController;