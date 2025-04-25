const { RequestEvent, Event, User } = require('../models');
const Check_Privilege = require('../utils/privilege');

const requestService = {

  async createRequest(requestData) {
    const { user_tag, event_id } = requestData;

    // Проверка существования мероприятия
    const event = await Event.findByPk(event_id);
    if (!event) throw new Error('Мероприятие не найдено');

    // Проверка что пользователь не создатель
    if (event.creator_tag === user_tag) {
      throw new Error('Создатель мероприятия не может подавать заявки');
    }

    // Проверка существующей заявки
    const existingRequest = await RequestEvent.findOne({
      where: { user_tag, event_id },
    });
    if (existingRequest) throw new Error('Заявка уже существует');

    const newRequest = await RequestEvent.create({
      ...requestData,
      status: 'expectation'
  });
    console.log(newRequest);

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
    const { 
      eventId, 
      userTag, 
      status, 
      isReported, 
      page = 1, 
      limit = 10 
    } = filters;

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

    const event = await Event.findByPk(request.event_id);
    if (!event) throw new Error('Мероприятие не найдено');

    // Проверка что текущий пользователь не создатель
    if (event.creator_tag !== currentUserTag) {
      throw new Error('только cоздатель мероприятия может изменять статус заявки');
    }

    request.status = newStatus;
    await request.save();
    return request;
  },

  async updateRepost(requestId, repost){
    const request = RequestEvent.findByPk(requestId);
    if(!request) throw new Error("заявка не найдена");

    if(request.is_reported === repost){
      return true
    }
    request.is_reported = repost;
    await request.save();
    return request;
  },
  async deleteRequest(requestId, currentUserTag) {
    const request = await RequestEvent.findByPk(requestId);
    if (!request) throw new Error('Заявка не найдена');

    const user = await User.findOne({ where: { tag_name: currentUserTag } });
    
    // Разрешаем удаление только автору заявки или админу
    if (request.user_tag !== currentUserTag && !Check_Privilege(user.privilege, 'admin')) {
      throw new Error('Недостаточно прав для удаления');
    }

    await request.destroy();
    return true;
  },

  async getRequestDetails(requestId) {
    return RequestEvent.findByPk(requestId, {
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
  }
};

module.exports = requestService;