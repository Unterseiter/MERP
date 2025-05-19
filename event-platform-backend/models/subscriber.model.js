const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Subscriber = sequelize.define('Subscriber', {
      subscriber_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      subscriber_tag: {
        type: DataTypes.STRING,
        references: {
          model: 'User',
          key: 'tag_name'
        }
      },
      subscribed_tag: {
        type: DataTypes.STRING,
        references: {
          model: 'User',
          key: 'tag_name'
        }
      }
    }, {
      tableName: 'subscriber',
      timestamps: true
    });
  
    Subscriber.associate = function(models) {
      Subscriber.belongsTo(models.User, {
        foreignKey: 'subscriber_tag',
        targetKey: 'tag_name',
        as: 'SubscriberUser'
      });
      
      Subscriber.belongsTo(models.User, {
        foreignKey: 'subscribed_tag',
        targetKey: 'tag_name',
        as: 'SubscribedUser'
      });
    };
  
    return Subscriber;
  };