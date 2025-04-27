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
    request_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'request_event',
            key: 'request_id' // Исправлено на правильный ключ
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
    timestamps: true,
    tableName: 'Message'
  });

  Message.associate = (models) => {
    Message.belongsTo(models.RequestEvent, { 
      foreignKey: 'request_id',
      targetKey: 'request_id',
      as: 'Request'
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
