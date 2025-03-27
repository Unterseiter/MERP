const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    tag_name: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
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
    User.hasMany(models.Event, { foreignKey: 'creator_tag' });
    User.belongsToMany(models.Event, { through: models.RequestEvent, foreignKey: 'user_tag' });
    User.hasOne(models.Admin, { foreignKey: 'user_tag' });
    User.hasMany(models.Message, { foreignKey: 'sender' });
    User.hasMany(models.Message, { foreignKey: 'recipient' });
  };

  return User;
};
