// Модель пользователя (User) для базы данных с использованием Sequelize ORM
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  // Определение модели User с полями и их типами
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true // Автоматическое увеличение ID
  },
    tag_name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false // Уникальный тег пользователя обязателен
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false // Имя пользователя обязательно
    },
    privilege: {
        type: DataTypes.STRING,
        allowNull: false, // Привилегия пользователя обязательна
        validate: {
          isIn: [['admin', 'user']] // Допустимые значения привилегий
        }
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false // Город пользователя обязателен
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false // Уникальный email обязателен
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false // Пароль обязателен
    }
  }, {
    tableName: 'User', // Имя таблицы в базе данных

    scopes: {
      withoutPassword: {
        attributes: { exclude: ['password'] } // Исключаем пароль из выборки по умолчанию
      }
    }
  });

  // Определение связей модели User с другими моделями
  User.associate = (models) => {
    // Создатель события ссылается на пользователя
    User.hasMany(models.Event, { foreignKey: 'creator_tag', sourceKey: 'tag_name' });
    
    // Пользователь может подавать заявки на мероприятия
    User.belongsToMany(models.Event, { 
      through: models.RequestEvent, 
      foreignKey: 'user_tag', 
      otherKey: 'event_id'
    });
  
    // Сообщения, отправляемые пользователем
    User.hasMany(models.Message, { foreignKey: 'sender', sourceKey: 'tag_name' });
    User.hasMany(models.Message, { foreignKey: 'recipient', sourceKey: 'tag_name' });
  };
  return User;
};
