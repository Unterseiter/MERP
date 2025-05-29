const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RequestEvent = sequelize.define('RequestEvent', {
    request_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.ENUM('expectation', 'accept', 'rejection'),
      defaultValue: 'expectation'
    },
    user_tag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_reported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'request_event'
  });

  RequestEvent.associate = (models) => {
    RequestEvent.belongsTo(models.User, { foreignKey: 'user_tag', targetKey: 'tag_name', as: 'Requester' });
    RequestEvent.belongsTo(models.Event, { foreignKey: 'event_id' });
  };

  return RequestEvent;
};
