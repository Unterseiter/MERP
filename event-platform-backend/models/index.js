const sequelize = require('../config/bd');

const models = {
  User: require('./user.model')(sequelize),
  Event: require('./event.model')(sequelize),
  RequestEvent: require('./requestEvent.model')(sequelize),
  Message: require('./message.model')(sequelize),
  history: require('./history.model')(sequelize),
  Subscriber: require('./subscriber.model')(sequelize)
};

// Установка связей
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};