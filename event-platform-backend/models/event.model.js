// Модель события (Event) для базы данных с использованием Sequelize ORM
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Определение модели Event с полями и их типами
    const Event = sequelize.define('Event', {
        event_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true // Автоматическое увеличение ID
        },
        photo_url: {
            type: DataTypes.STRING,
            allowNull: false // URL фотографии обязателен
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false // Название события обязательно
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false // Описание события обязательно
        },
        limited: {
            type: DataTypes.INTEGER,
            defaultValue: 0 // Ограничение по количеству участников, по умолчанию 0 (без ограничений)
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0 // Количество просмотров события, по умолчанию 0
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false, // Дата начала события обязательна
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false, // Дата окончания события обязательна
        },
        city:{
            type: DataTypes.STRING,
            allowNull: true // город обязательна
        },
        creator_tag: {
            type: DataTypes.STRING,
            allowNull: false, // Тег создателя события обязателен
            references: {
                model: 'User', // Ссылка на модель User
                key: 'tag_name', // Ключ в модели User
            },
        },
    }, {
        tableName: 'event', // Имя таблицы в базе данных
        validate: {
            // Валидация: дата окончания должна быть позже даты начала
            dateValidation() {
                if (this.start_date > this.end_date) {
                    throw new Error('Дата окончания должна быть после даты начала');
                }
            }
        }
    });

    // Определение связей модели Event с другими моделями
    Event.associate = (models) => {
        Event.belongsTo(models.User, { foreignKey: 'creator_tag', targetKey: 'tag_name', as: 'Creator' }); // Связь с создателем
        Event.hasMany(models.RequestEvent, {as: 'Requests', foreignKey: 'event_id' }); // Связь с запросами на участие
      };
    return Event;
};
