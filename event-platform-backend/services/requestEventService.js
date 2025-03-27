const { Participation, Event } = require('../models');
const Check_Privilege = require('../utils/privilege');

const participationService = {
  // Создание заявки на участие
  async createParticipation(participationData) {
    try {
      const participation = await Participation.create(participationData);
      return participation;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Вы уже подавали заявку на это мероприятие');
      }
      throw error;
    }
  },

  // Получение заявки по request_id
  async getParticipationById(request_id) {
    try {
      const participation = await Participation.findByPk(request_id, {
        include: [User, Event],
      });
      return participation;
    } catch (error) {
      throw error;
    }
  },

  // Обновление статуса заявки (только для организатора)
  async updateParticipationStatus(request_id, newStatus, organizerId) {
    try {
      const participation = await Participation.findByPk(request_id, {
        include: Event,
      });
      
      if (!participation) throw new Error('Заявка не найдена');
      if (Check_Privilege(participation.Event.creatorId, organizerId)) {
        throw new Error('Только организатор может изменить статус');
      }

      // Проверка лимита участников
      if (newStatus === 'accept' && participation.Event.limit > 0) {
        const approvedCount = await Participation.count({
          where: { event_id: participation.eventId, status: 'accept' },
        });
        if (approvedCount >= participation.Event.limit) {
          throw new Error('Достигнут лимит участников');
        }
      }

      participation.status = newStatus;
      await participation.save();
      return participation;
    } catch (error) {
      throw error;
    }
  },

  // Получение всех заявок на мероприятие
  async getParticipationsByEvent(eventId) {
    try {
      const participations = await Participation.findAll({
        where: { eventId },
        include: User,
      });
      return participations;
    } catch (error) {
      throw error;
    }
  },

  // Удаление заявки (пользователь или организатор)
  async deleteParticipation(request_id, user_tag) {
    try {
      const participation = await Participation.findByPk(request_id, {
        include: Event,
      });
      if (!participation) return false;
      
      if (
        Check_Privilege(participation.user_tag , user_tag) &&
        Check_Privilege(participation.Event.creator_tag, user_tag)
      ) {
        throw new Error('У вас нет прав для удаления этой заявки');
      }
      
      await participation.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = participationService;