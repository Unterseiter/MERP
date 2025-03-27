const sequelize = require('../config/bd');

const models = {
  User: require('./user.model')(sequelize),
  Event: require('./event.model')(sequelize),
  RequestEvent: require('./requestEvent.model')(sequelize),
  Admin: require('./admin.model')(sequelize),
  Message: require('./message.model')(sequelize),
  history: require('./history.model')(sequelize)
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