import { io } from 'socket.io-client';

const URL = `http://${process.env.REACT_APP_BACKEND_URL}`;
const socket = io(URL, {
  autoConnect: false, // Можно сначала НЕ подключаться, а подключать вручную
});

export default socket;