const messageService = require('../services/messageService');
const { Event, RequestEvent } = require('../models');  // Импортируем необходимые модели

const chatController = {
  // Отправка сообщения
  async sendMessage(req, res) {
    try {
      const message = await messageService.createMessage({
        ...req.body,
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Получение сообщений мероприятия
  async getMessages(req, res) {
    try {
      const RequestId = req.params.RequestId;
      //console.log("RequestId:", RequestId);
      //console.log("User tag_name:", req.user.tag_name);
      
      // Проверка, является ли пользователь создателем заявки
      const request = await RequestEvent.findByPk(RequestId,{
        where: {user_tag: req.user.tag_name},
      });
      //console.log("Request check result:", request);
  
      const event = await Event.findByPk(request.event_id,{
        where: {creator_tag: req.user.tag_name },
      });
      //console.log("Event check result:", event);
  
      if (!request && !event) {
        // Если пользователь не создатель заявки и не создатель мероприятия, запрещаем доступ
        return res.status(403).json({ message: 'Нет прав на доступ к сообщениям этого события' });
      }
  
      // Если проверка пройдена, получаем сообщения
      const messages = await messageService.getMessagesByRequest(RequestId);
      //console.log("Messages:", messages);
      res.json(messages);
    } catch (error) {
      console.error('Error occurred:', error);
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