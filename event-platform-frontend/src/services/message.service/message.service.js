import { instanceAxios } from "../axios-config";

export default class MessageService {
    static apiUrl = '/api/chat';
  
    static async getRequestRecords(RequestId) {
  
      const res = await instanceAxios.get(`${this.apiUrl}/${RequestId}`);
      return res.data;
    }
  }