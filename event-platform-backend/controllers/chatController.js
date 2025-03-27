const messageService = require('../services/messageService');

const chatController = {
  // Отправка сообщения
  async sendMessage(req, res) {
    try {
      const message = await messageService.createMessage({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Получение сообщений мероприятия
  async getMessages(req, res) {
    try {
      const messages = await messageService.getMessagesByEvent(req.params.eventId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Удаление сообщения
  async deleteMessage(req, res) {
    try {
      const success = await messageService.deleteMessage(req.params.id, req.user.id);
      if (!success) return res.status(404).json({ message: 'Сообщение не найдено' });
      res.status(204).send();
    } catch (error) {
      const status = error.message.includes('прав') ? 403 : 500;
      res.status(status).json({ message: error.message });
    }
  },
};

module.exports = chatController;