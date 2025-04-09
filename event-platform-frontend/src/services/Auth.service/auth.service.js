import { instanceAxios } from "../axios-config";

export default class AuthService {

    static apiUrl = '/api/auth';

    static async login(body) {
        try {
            const res = await instanceAxios.post(this.apiUrl + "/login", body);
            const token = res.data.token;
      
            // Сохраняем токен
            localStorage.setItem("authToken", token);
      
            // Обновляем заголовки Axios
            instanceAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
            return res.data;
          } catch (error) {
            throw new Error("Ошибка авторизации: " + error.message);
          }
    }
    static async register(body) {
        const res = await instanceAxios.post(this.apiUrl + "/register", body);
        return res.data;
    }
    static logout() {
        localStorage.removeItem("authToken");
        delete instanceAxios.defaults.headers.common["Authorization"];
    }
}