'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('event', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      limited: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      views: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      creator_tag: { // Добавляем недостающее поле
        type: Sequelize.STRING,
        allowNull: false,
        references: { // Опционально: ограничение можно добавить через миграцию
          model: 'user',
          key: 'tag_name'
        }
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      // Явно объявляем createdAt и updatedAt
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
    await queryInterface.dropTable('event');
  }
};
