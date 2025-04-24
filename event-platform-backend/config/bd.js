const { Sequelize } = require('sequelize');

/*const sequelize = new Sequelize(
    'web_applications',
    'root',
    '130_Sql_82!',
    {
        host: 'localhost',
        dialect: 'mysql',
    }
);*/
const sequelize = new Sequelize({
    dialect: 'mysql', // Меняем на вашу СУБД
    host: 'localhost',
    username: 'root',
    password: '1234567890',
    database: 'web_applications',
    define: {
      timestamps: true, // Включаем автоматические временные метки
    }
  });

module.exports = sequelize;