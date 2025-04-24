const requestService = require('../services/requestEventService');
const { logger } = require('../utils/LogFile');

const requestController = {

  // Создание новой заявки
  async createRequest(req, res) {
    try {
      const requestData = {
        ...req.body,
        user_tag: req.user.tag_name // Предполагаем, что пользователь авторизован
      };

      const newRequest = await requestService.createRequest(requestData);
      logger.info(`Заявка создана: ${newRequest.request_id}`);
      
      res.status(201).json({
        success: true,
        data: newRequest
      });
    } catch (error) {
      logger.error(`Ошибка создания заявки: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Получение списка заявок
  async getRequests(req, res) {
    try {
      const filters = {
        eventId: req.query.event_id,
        userTag: req.user.user_tag,
        status: req.query.status,
        isReported: req.query.is_reported,
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await requestService.getRequests(filters);
      logger.info(`Получено заявок: ${result.count}`);

      res.json({
        success: true,
        data: result.rows,
        total: result.count,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      });
    } catch (error) {
      logger.error(`Ошибка получения заявок: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Обновление статуса заявки
  async updateRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const currentUser = req.user.tag_name;

      const updatedRequest = await requestService.updateRequestStatus(
        id,
        status,
        currentUser
      );

      logger.info(`Статус заявки ${id} обновлен на: ${status}`);
      res.json({
        success: true,
        data: updatedRequest
      });
    } catch (error) {
      logger.error(`Ошибка обновления статуса: ${error.message}`);
      res.status(error.message.includes('не найдена') ? 404 : 403).json({
        success: false,
        error: error.message
      });
    }
  },

  // Обновление флага жалобы
  async updateReport(req, res) {
    try {
      const { id } = req.params;
      const { is_reported } = req.body;

      const updatedRequest = await requestService.updateRepost(id, is_reported);
      logger.info(`Жалоба на заявку ${id} обновлена: ${is_reported}`);

      res.json({
        success: true,
        data: updatedRequest
      });
    } catch (error) {
      logger.error(`Ошибка обновления жалобы: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Удаление заявки
  async deleteRequest(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user.tag_name;

      await requestService.deleteRequest(id, currentUser);
      logger.info(`Заявка удалена: ${id}`);

      res.json({
        success: true,
        message: 'Заявка успешно удалена'
      });
    } catch (error) {
      logger.error(`Ошибка удаления заявки: ${error.message}`);
      res.status(error.message.includes('Недостаточно прав') ? 403 : 404).json({
        success: false,
        error: error.message
      });
    }
  },

  // Получение детальной информации о заявке
  async getRequestDetails(req, res) {
    try {
      const { id } = req.params;
      const request = await requestService.getRequestDetails(id);

      if (!request) {
        throw new Error('Заявка не найдена');
      }

      logger.info(`Получены детали заявки: ${id}`);
      res.json({
        success: true,
        data: request
      });
    } catch (error) {
      logger.error(`Ошибка получения деталей заявки: ${error.message}`);
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = requestController;