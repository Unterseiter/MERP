import { instanceAxios } from "../axios-config";

export default class RequestService {
  static apiUrl = '/api/requests';

  // Получение заявок с фильтрами
  static async getAllRecords(filters = {}) {
    const params = {
      ...filters,
      limit: filters.limit || 10,
      page: filters.page || 1
    };

    const res = await instanceAxios.get(this.apiUrl, { params });
    return res.data;
  }

  // Получение заявок текущего пользователя
  static async getUserRequests() {
    const res = await instanceAxios.get(`${this.apiUrl}/my`);
    return res.data;
  }

  // Получение деталей конкретной заявки
  static async getOneRecord(id) {
    const res = await instanceAxios.get(`${this.apiUrl}/${id}`);
    return res.data;
  }

  // Создание новой заявки
  static async createRecord(eventId) {
    const res = await instanceAxios.post(this.apiUrl, { event_id: eventId });
    return res.data;
  }

  // Обновление статуса заявки
  static async updateStatus(id, status) {
    const res = await instanceAxios.patch(`${this.apiUrl}/${id}/status`, { status });
    return res.data;
  }

  // Обновление флага жалобы
  static async updateReportStatus(id, isReported) {
    const res = await instanceAxios.patch(`${this.apiUrl}/${id}/report`, { is_reported: isReported });
    return res.data;
  }

  // Удаление заявки
  static async deleteRecord(id) {
    const res = await instanceAxios.delete(`${this.apiUrl}/${id}`);
    return res.data;
  }

  // Получение заявок для конкретного мероприятия
  static async getEventRequests(eventId, filters = {}) {
    const res = await instanceAxios.get(`${this.apiUrl}/event/${eventId}`, { params: filters });
    return res.data;
  }
}