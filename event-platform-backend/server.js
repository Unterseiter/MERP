const app = require('./app');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const sequelize = require('./config/bd');

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
})

//Синхронизация с базой данных
/*sequelize.sync({ force: true })
    .then(() => {
        console.log('База данных синхронизирована');
    })
    .catch((err) => {
        console.error('Ошибка синхронизации:', err);
    });*/