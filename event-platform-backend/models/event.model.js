const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Event = sequelize.define('Event', {
        event_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        limited: {

            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },{
        tableName: 'Event',
        validate: {
            dateValidation() {
              if (this.start_date > this.end_date) {
                throw new Error('Дата окончания должна быть после даты начала');
              }
            }
          }
    });

    Event.associate = (models) => {
        Event.belongsTo(models.User, { foreignKey: 'creator_tag' });
        Event.belongsToMany(models.User, { through: models.RequestEvent, foreignKey: 'event_id' });
        Event.hasMany(models.Message, {
            foreignKey: 'event_id',
            as: 'Messages'
        });
        Event.hasMany(models.RequestEvent, {
            foreignKey: 'event_id',
            as: 'Requests'
        });
    };

    return Event;
};
