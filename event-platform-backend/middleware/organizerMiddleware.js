// Middleware для проверки прав организатора на мероприятие
const eventService = require('../services/eventService');

const organizerMiddleware = async (req, res, next) => {
  try {
    // Получаем мероприятие по ID из параметров запроса
    const event = await eventService.getEventById(req.params.id);

    // Если мероприятие не найдено, возвращаем ошибку 404
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }
    // Проверяем, является ли текущий пользователь создателем мероприятия
    if (event.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет прав для этого действия' });
    }
    // Если проверки пройдены, передаем управление дальше
    next();
  } catch (error) {
    // Обработка ошибок сервера
    res.status(500).json({ message: error.message });
  }
};

module.exports = organizerMiddleware;
