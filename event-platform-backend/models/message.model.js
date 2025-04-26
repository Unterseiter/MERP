const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    message_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    event_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Event',
            key: 'event_id' // Исправлено на правильный ключ
        }
    },

    sender: { // Явно объявляем поле
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'user',
        key: 'tag_name'
      }
    },
    recipient: { // Явно объявляем поле
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'user',
        key: 'tag_name'
      }
    }

  }, {
    tableName: 'Message'
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Event, { 
      foreignKey: 'event_id',
      targetKey: 'event_id',
      as: 'Event'
    });
  
    Message.belongsTo(models.User, { 
      foreignKey: 'sender', 
      targetKey: 'tag_name',
      as: 'Sender'
    });
  
    Message.belongsTo(models.User, { 
      foreignKey: 'recipient', 
      targetKey: 'tag_name',
      as: 'Recipient'
    });
  };

  return Message;
};
