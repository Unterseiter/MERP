const Joi = require('joi');
const { Event, RequestEvent } = require('../models');
const { ValidationError, ForbiddenError, NotFoundError } = require('../utils/errors');
const eventService = require('../services/eventService');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

// Схемы валидации
const eventSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
  limited: Joi.number().min(0),
  creator_tag: Joi.string().forbidden(), // Запрещаем ручную установку
  views: Joi.number().forbidden(), // Запрещаем ручную установку
  photo_url: Joi.string()/*.uri().optional()*/
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
  photo_url: Joi.string()/*.uri().optional()*/
}).min(1);



const eventController = {
  async createEvent(req, res, next) {
    try {
      //console.log(req);
      const { error, value } = eventSchema.validate(req.body);
      if (error) throw new ValidationError(error.details);

      const eventData = {
        ...value,
        creator_tag: req.user.tag_name,
        views: 0,
      };

      let photoUrl = null;
      if (req.file) {
        const compressedImage = await sharp(req.file.path)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        await fs.writeFile(req.file.path, compressedImage);

        photoUrl = `/uploads/events/${req.file.filename}`;
        eventData.photo_url = photoUrl;
      }

      const event = await eventService.createEvent(eventData);
      res.status(201).json({
        ...event.toJSON(),
        photo_url: event.photo_url ?  `${process.env.CORS_ORIGIN_DEV}:${process.env.PORT}${event.photo_url}`  : null,
      });
    } catch (error) {
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      console.error('Create Event Error:', error);
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

      const { error, value } = getEventsSchema.validate(processedQuery, {
        abortEarly: false,
      });

      if (error) {
        const details = error.details.map((d) => ({
          field: d.path[0],
          message: d.message,
        }));
        throw new ValidationError(details);
      }

      const processedParams = {
        ...value,
        startDate: value.startDate ? new Date(value.startDate) : null,
        endDate: value.endDate ? new Date(value.endDate) : null,
      };

      if (processedParams.startDate && isNaN(processedParams.startDate.getTime())) {
        throw new ValidationError([{ message: 'Invalid startDate format', path: ['startDate'] }]);
      }

      if (processedParams.endDate && isNaN(processedParams.endDate.getTime())) {
        throw new ValidationError([{ message: 'Invalid endDate format', path: ['endDate'] }]);
      }

      const result = await eventService.getEvents({
        ...processedParams
      });

      const data = result.rows.map((event) => ({
        ...event.toJSON(),
        photo_url: event.photo_url ? `${process.env.CORS_ORIGIN_DEV}:${process.env.PORT}${event.photo_url}` : null,
      }));

      res.json({
        data,
        meta: {
          total: result.count,
          page: value.page,
          totalPages: Math.ceil(result.count / value.limited),
          limited: value.limited,
        },
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

      res.json({
        ...event.toJSON(),
        photo_url: event.photo_url ?  `${process.env.CORS_ORIGIN_DEV}:${process.env.PORT}${event.photo_url}`  : null,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateEvent(req, res, next) {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) throw new NotFoundError('Мероприятие не найдено');

      if (event.creator_tag !== req.user.tag_name && !req.user.isAdmin) {
        throw new ForbiddenError('Недостаточно прав');
      }

      const { error, value } = eventUpdateSchema.validate(req.body);
      if (error) throw new ValidationError(error.details);

      let photoUrl = event.photo_url;
      if (req.file) {
        const compressedImage = await sharp(req.file.path)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        await fs.writeFile(req.file.path, compressedImage);

        photoUrl = `/uploads/events/${req.file.filename}`;

        if (event.photo_url) {
          const oldPath = path.join(__dirname, '..', event.photo_url);
          await fs.unlink(oldPath).catch((err) => {
            console.warn('Failed to delete old file:', err.message);
          });
        }
      }

      const updatedEvent = await eventService.updateEvent(req.params.id, {
        ...value,
        photo_url: photoUrl,
      });

      res.json({
        ...updatedEvent.toJSON(),
        photo_url: updatedEvent.photo_url ?  `${process.env.CORS_ORIGIN_DEV}:${process.env.PORT}${event.photo_url}`  : null,
      });
    } catch (error) {
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      next(error);
    }
  },

  async deleteEvent(req, res, next) {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) throw new NotFoundError('Мероприятие не найдено');

      if (event.creator_tag !== req.user.tag_name && !req.user.isAdmin) {
        throw new ForbiddenError('Недостаточно прав');
      }

      if (event.photo_url) {
        const filePath = path.join(__dirname, '..', event.photo_url);
        await fs.unlink(filePath).catch((err) => {
          console.warn('Failed to delete file:', err.message);
        });
      }

      await eventService.deleteEvent(req.params.id, req.user.tag_name);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async uploadEventPhoto(req, res, next) {
    try {
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        throw new ValidationError('Некорректный ID события');
      }

      const event = await Event.findByPk(eventId);
      if (!event) {
        throw new NotFoundError('Мероприятие не найдено');
      }

      if (event.creator_tag !== req.user.tag_name && !req.user.isAdmin) {
        throw new ForbiddenError('Недостаточно прав');
      }

      if (!req.file) {
        throw new ValidationError('Файл не предоставлен');
      }

      // Сжимаем изображение
      const compressedImage = await sharp(req.file.path)
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Перезаписываем файл сжатым изображением
      await fs.writeFile(req.file.path, compressedImage);

      const photoUrl = `/uploads/events/${req.file.filename}`;
      console.log('Saved file:', req.file.path);

      // Удаляем старое изображение
      if (event.photo_url) {
        const oldPath = path.join(__dirname, '..', event.photo_url);
        await fs.unlink(oldPath).catch((err) => {
          console.warn('Failed to delete old file:', err.message);
        });
      }

      // Обновляем событие
      await eventService.updateEvent(eventId, { photo_url: photoUrl });

      res.json({ photo_url: photoUrl });
    } catch (error) {
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path).catch(() => { });
      }
      console.error('Upload Error:', error);
      next(error);
    }
  },
};

module.exports = eventController;