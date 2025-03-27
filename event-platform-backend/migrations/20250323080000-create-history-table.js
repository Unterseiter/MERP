'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('history', {
      history_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      history_user_tag: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      history_event_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Event', // Name of the referenced model
          key: 'event_id', // Key in the referenced model
        },
      },
      history_status: {
        type: Sequelize.ENUM('create', 'participant'),
        defaultValue: 'participant',
      },
      history_score: {
        type: Sequelize.ENUM('block', 'good'),
        defaultValue: 'good',
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('history');
  }
};
