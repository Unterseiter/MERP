const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },
    tag_name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    privilege: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['admin', 'user']] // Здесь указываются допустимые значения
        }
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'User',

    scopes: {
      withoutPassword: {
        attributes: { exclude: ['password'] }
      }
    }
  });

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
