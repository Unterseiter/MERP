const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();

const moveExpiredEventsToHistory = require('./services/cron/History');

//Middleware(Промежуточные обработчики)
const corsOptions = {
    origin: 'http://localhost:3000',
    allowedHeaders: ['Content-Type', 'Authorization', 'bypass-tunnel-reminder'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// Настройка статических файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/test', (req, res) => {
    res.json({ message: 'API работает!' });
});

//cron события
//каждые 00:00
cron.schedule('0 0 * * *', () => {
    console.log('Запуск проверки просроченных событий...');
    moveExpiredEventsToHistory();
});
//каждые 60сек
//cron.schedule('*/20 * * * * *', () => {
//    console.log('Запуск проверки просроченных событий...');
//    moveExpiredEventsToHistory();
//});
    
//Подключение маршрутов
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/user');
const requestRoutes = require('./routes/requestEvent');
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/user', userRoutes);
app.use('/api/requests', requestRoutes);

//Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Что-то пошло не так!' });
});

module.exports = app;