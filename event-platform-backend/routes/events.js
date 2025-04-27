const express = require('express');
const router = express.Router();
const { 
  eventMainUploader,
  eventGalleryUploader
} = require('../config/fileUploaders');

const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const organizerMiddleware = require('../middleware/organizerMiddleware');

// Middleware для основной загрузки
const uploadMainPhoto = [
  authMiddleware,
  eventMainUploader.getMulterUpload().single('photo'),
  eventMainUploader.convertToWebp.bind(eventMainUploader)
];

// Middleware для дополнительных фото
const uploadGalleryPhoto = [
  authMiddleware,
  eventGalleryUploader.getMulterUpload().single('photo'),
  eventGalleryUploader.convertToWebp.bind(eventGalleryUploader)
];

router.get('/', authMiddleware, eventController.getEvents);
router.get('/user', authMiddleware, eventController.getUserRelatedEvents);
router.get('/:id', eventController.getEventById);
router.post('/', ...uploadMainPhoto, eventController.createEvent);
router.put('/:id', authMiddleware, organizerMiddleware, ...uploadMainPhoto, eventController.updateEvent);
router.delete('/:id', authMiddleware, organizerMiddleware, eventController.deleteEvent);

router.post('/:id/photo', ...uploadGalleryPhoto, eventController.uploadEventPhoto);

module.exports = router;