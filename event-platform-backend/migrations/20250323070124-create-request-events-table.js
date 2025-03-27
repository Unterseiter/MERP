'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('request_event', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      status: {
        type: Sequelize.ENUM('expectation', 'accept', 'rejection'),
        defaultValue: 'expectation'
      },
      user_tag: { // Внешний ключ для связи с User
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'user', // Имя таблицы user (из вашей модели)
          key: 'tag_name' // Поле, на которое ссылаемся
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event_id: { // Внешний ключ для связи с Event
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Event', // Имя таблицы Event (с большой буквы, как в модели)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('request_event');

  }
};
