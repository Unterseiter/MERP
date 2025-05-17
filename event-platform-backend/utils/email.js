// Утилита для отправки email с использованием nodemailer
const nodemailer = require('nodemailer');

// Настройка транспортера для отправки почты через Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Замените на ваш email
    pass: 'your-password', // Замените на ваш пароль или используйте OAuth2
  },
});

// Функция отправки email
const sendEmail = (to, subject, text) => {
  const mailOptions = { from: 'your-email@gmail.com', to, subject, text };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error(err); // Логируем ошибку при отправке
    else console.log('Email отправлен:', info.response); // Логируем успешную отправку
  });
};

module.exports = sendEmail;
