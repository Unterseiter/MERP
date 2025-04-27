const { where } = require('sequelize');
const { Message, Event, User } = require('../models');
const Check_Privilege = require('../utils/privilege');
const e = require('express');

const messageService = {
  // Создание сообщения
  async createMessage(messageData) {
    try {
      const message = await Message.create(messageData);
      return message;
    } catch (error) {
      throw error;
    }
  },

  // Получение сообщений мероприятия
  async getMessagesByRequest(request_id) {
    try {
      const messages = await Message.findAll({
        where: { request_id },
        include: [
          { model: User, as: 'Sender' },
          { model: User, as: 'Recipient' } 
        ],
        order: [['createdAt', 'ASC']],
      });
      return messages;
    } catch (error) {
      throw error;
    }
  },

  // Удаление сообщения (только автор или организатор)
  async deleteMessage(id, userId) {
    try {
      const message = await Message.findByPk(id);
      if (!message) return false;

      if (Check_Privilege(message.userId, userId) && Check_Privilege(message.Event.creatorId, userId)) {
        throw new Error('У вас нет прав для удаления этого сообщения');
      }

      await message.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  },

  //получения сообщений по event_id
  async getMessagesByEventId(eventId) {
    try {
      const messages = await Message.findAll({ where: { event_id: eventId } });
      return messages;
    }
    catch(err){
      throw err;
    }
  }
};

module.exports = messageService;