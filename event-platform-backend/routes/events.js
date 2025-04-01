const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const organizerMiddleware = require('../middleware/organizerMiddleware');

router.get('/', authMiddleware, eventController.getEvents);
router.get('/:id', /*authMiddleware,*/ eventController.getEventById);
router.post('/', authMiddleware, eventController.createEvent);
router.put('/:id', authMiddleware, organizerMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, organizerMiddleware, eventController.deleteEvent);

module.exports = router;