const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    user_tag: { // Внешний ключ для связи с User
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      references: {
        model: 'user', // Имя таблицы user (из вашей модели User)
        key: 'tag_name'
      }
    }
  }, {
    tableName: 'Admins' // Название таблицы в БД
    // Добавление комментария о том, что это таблица администраторов

  });

  Admin.associate = (models) => {
    Admin.belongsTo(models.User, { 
      foreignKey: 'user_tag',
      as: 'User' // Опциональный псевдоним
    });
  };

  return Admin;
};
