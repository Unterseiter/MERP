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
    Message.belongsTo(models.User, { as: 'Sender', foreignKey: 'sender' });
    Message.belongsTo(models.User, { as: 'Recipient', foreignKey: 'recipient' });
  };

  return Message;
};
