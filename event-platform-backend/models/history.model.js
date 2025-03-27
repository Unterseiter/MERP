const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const History = sequelize.define('History', {
        history_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_tag: {

            type: DataTypes.STRING,
            allowNull: true,
        },
        event_id: {

            type: DataTypes.INTEGER,
            references: {
                model: 'Event', // Name of the referenced model
                key: 'event_id', // Key in the referenced model
            },
        },
        history_status: {
            type: DataTypes.ENUM('create', 'participant'),
            defaultValue: 'participant',
        },
        is_complaint: {

            type: DataTypes.ENUM('block', 'good'),
            defaultValue: 'good',
        },
    });

    return History;
};
