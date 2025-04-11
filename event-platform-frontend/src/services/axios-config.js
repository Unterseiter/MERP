import axios from "axios";

export const instanceAxios = axios.create({
    //baseURL: `http://${process.env.REACT_APP_BACKEND_URL}`,
    baseURL: `http://localhost:8080`,
    withCredentials: true,
});