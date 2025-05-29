import { instanceAxios } from "../axios-config";

export default class AuthService {

    static apiUrl = '/api/auth';

    static async login(body) {
        try {
            console.log(body);
            const res = await instanceAxios.post(this.apiUrl + "/login", body);
            return res.data;
        } catch (error) {
            throw new Error("Ошибка авторизации: " + error.message);
        }
    }

    static async register(body) {
        try {
            const res = await instanceAxios.post(`${this.apiUrl}/register`, body);
            return res.data;
        } catch (error) {
            throw new Error("Ошибка регистрации: " + error.response?.data?.message || error.message);
        }
    }

    static async logout() {
        try {
            // Отправляем запрос на выход, чтобы сервер очистил куки
            await instanceAxios.post(`${this.apiUrl}/logout`);

            // Ничего дополнительно очищать на клиенте не нужно, так как куки HTTP-only
            return { message: 'Успешный выход' };
        } catch (error) {
            throw new Error("Ошибка выхода: " + error.response?.data?.message || error.message);
        }
    }

    static async checkAuth() {
        try {
            // Проверяем авторизацию через защищенный маршрут
            const res = await instanceAxios.get(`${this.apiUrl}/profile`);
            console.log(res.data);
            // Если запрос успешен, пользователь авторизован
            return res.data; // Возвращаем данные пользователя
        } catch (error) {
            // Если ошибка 401, пользователь не авторизован
            if (error.response?.status === 401) {
                return null;
            }
            throw new Error("Ошибка проверки авторизации: " + error.response?.data?.message || error.message);
        }
    }
}