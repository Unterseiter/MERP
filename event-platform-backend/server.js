const app = require('./app');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
const sequelize = require('./config/bd');

const PORT = process.env.PORT || 8080;

// Важное изменение для доступа извне
server.listen(PORT, '0.0.0.0', () => {  // Добавлен хост 0.0.0.0
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Доступ через: http://176.59.83.69:${PORT}`);
});

/*sequelize.sync({ force: true })
    .then(() => {
        console.log('База данных синхронизирована');
    })
    .catch((err) => {
        console.error('Ошибка синхронизации:', err);
    });*/