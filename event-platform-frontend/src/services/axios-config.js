import axios from "axios";

export const instanceAxios = axios.create({
    baseURL: `http://${process.env.JWT_SECRET}`,
});