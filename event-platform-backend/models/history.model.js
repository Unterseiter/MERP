const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const History = sequelize.define('history', {
    history_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_tag: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'User',
        key: 'tag_name',
      },
    },
    event_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_description: {
      type: DataTypes.TEXT,
      allowNull: true, // TEXT может быть необязательным
    },
    event_date_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    history_status: {
      type: DataTypes.ENUM('create', 'participant'),
      defaultValue: 'participant',
      allowNull: false,
    },
    is_complaint: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    tableName: 'history',
    timestamps: false, // Отключаем createdAt/updatedAt
    indexes: [
      {
        unique: true,
        fields: ['user_tag', 'event_name', 'event_date_start'],
      },
    ],
  });

  return History;
};
