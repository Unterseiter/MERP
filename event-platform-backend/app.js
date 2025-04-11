const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

//Middleware(Промежуточные обработчики)
const corsOptions = {
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'bypass-tunnel-reminder'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get('/api/test', (req, res) => {
    res.json({ message: 'API работает!' });
});

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