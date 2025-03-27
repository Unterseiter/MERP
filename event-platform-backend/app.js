const express = require('express');
const cors = require('cors');
const app = express();

//Middleware(Промежуточные обработчики)
app.use(cors());
app.use(express.json());

//Подключение маршрутов
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/user');
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/user', userRoutes);

//Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Что-то пошло не так!' });
});

module.exports = app;