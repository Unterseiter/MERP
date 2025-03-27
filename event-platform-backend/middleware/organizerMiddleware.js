const eventService = require('../services/eventService');

const organizerMiddleware = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }
    if (event.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет прав для этого действия' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = organizerMiddleware;