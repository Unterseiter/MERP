const { RequestEvent, Event, User } = require('../models');
const Check_Privilege = require('../utils/privilege');

const requestService = {

  async createRequest(requestData) {
    const { user_tag, event_id } = requestData;

    const event = await Event.findByPk(event_id);
    if (!event) throw new Error('Мероприятие не найдено');

    if (event.creator_tag === user_tag) {
      throw new Error('Создатель мероприятия не может подавать заявки');
    }

    const existingRequest = await RequestEvent.findOne({
      where: { user_tag, event_id },
    });
    if (existingRequest) throw new Error('Заявка уже существует');

    const newRequest = await RequestEvent.create({
      ...requestData,
      status: 'expectation'
    });

    return RequestEvent.findByPk(newRequest.request_id, {
      include: [
        {
          model: User,
          as: 'Requester',
          attributes: ['tag_name', 'name', 'city']
        },
        {
          model: Event,
          attributes: ['name', 'creator_tag', 'start_date']
        }
      ]
    });
  },

  async getRequests(filters = {}) {
    const { eventId, userTag, status, isReported, page = 1, limit = 10 } = filters;

    const where = {};
    if (eventId) where.event_id = eventId;
    if (userTag) where.user_tag = userTag;
    if (status) where.status = status;
    if (isReported !== undefined) where.is_reported = isReported;

    return RequestEvent.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      include: [
        {
          model: User,
          as: 'Requester',
          attributes: ['tag_name', 'name', 'city']
        },
        {
          model: Event,
          attributes: ['name', 'creator_tag', 'start_date']
        }
      ]
    });
  },

  async updateRequestStatus(requestId, newStatus, currentUserTag) {
    const request = await RequestEvent.findByPk(requestId);
    if (!request) throw new Error('Заявка не найдена');

    console.log(`request ${request}`);
    const event = await Event.findByPk(request.event_id);
    if (!event) throw new Error('Мероприятие не найдено');

    if (event.creator_tag !== currentUserTag) {
      throw new Error('Только создатель мероприятия может изменять статус заявки');
    }

    if (newStatus === 'accept') {
      const approvedRequestsCount = await RequestEvent.count({
        where: {
          event_id: request.event_id,
          status: 'accept'
        }
      });
  
      if (approvedRequestsCount >= event.limited) {
        throw new Error('Достигнут лимит участников на мероприятие');
      }
    }

    request.status = newStatus;
    await request.save();
    return request;
  },

  async updateRepost(requestId, isReported) {
    const request = await RequestEvent.findByPk(requestId);
    if (!request) throw new Error("Заявка не найдена");

    if (request.is_reported === isReported) {
      return true;
    }

    request.is_reported = isReported;
    await request.save();
    return request;
  },

  async deleteRequest(requestId, currentUserTag) {
    const request = await RequestEvent.findByPk(requestId);
    if (!request) throw new Error('Заявка не найдена');

    const user = await User.findOne({ where: { tag_name: currentUserTag } });
    if (!user) throw new Error('Пользователь не найден');

    if (request.user_tag !== currentUserTag && !Check_Privilege(user.privilege, 'admin')) {
      throw new Error('Недостаточно прав для удаления');
    }

    await request.destroy();
    return true;
  },

  async getRequestDetails(requestId) {
    const request = await RequestEvent.findByPk(requestId, {
      include: [
        {
          model: Event,
          attributes: ['name', 'creator_tag', 'start_date'],
          include: {
            model: User,
            as: 'Creator',
            attributes: ['tag_name', 'name']
          }
        },
        {
          model: User,
          as: 'Requester',
          attributes: ['tag_name', 'name', 'email']
        }
      ]
    });

    if (!request) throw new Error('Заявка не найдена');

    return request;
  }
};

module.exports = requestService;
