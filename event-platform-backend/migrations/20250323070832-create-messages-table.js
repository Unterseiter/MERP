'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Message', {
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
      event_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Event', // Таблица Event (с большой буквы)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sender: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'user', // Таблица user (с маленькой буквы)
          key: 'tag_name'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      recipient: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'user',
          key: 'tag_name'
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
    await queryInterface.dropTable('Message');
  }
};
