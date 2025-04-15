const { sequelize, Event, RequestEvent, history } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;

const moveExpiredEventsToHistory = async () => {
    try {
        const currentDate = new Date().toISOString().split('T')[0]; // Текущая дата YYYY-MM-DD

        // Находим просроченные события
        const expiredEvents = await Event.findAll({
            where: {
                end_date: {
                    [Op.lt]: currentDate, // Используем Op.lt для сравнения
                },
            },
            attributes: ['event_id', 'creator_tag', 'name', 'description', 'start_date'],
        });

        for (const event of expiredEvents) {
            const { event_id, creator_tag, name, description, start_date, photo_url } = event;

            // Находим принятых участников
            const participants = await RequestEvent.findAll({
                where: {
                    event_id,
                    status: 'accept',
                },
                attributes: ['user_tag', 'is_reported'],
            });

            // Начинаем транзакцию
            await sequelize.transaction(async (t) => {
                // Добавляем создателя в историю
                await history.upsert(
                    {
                        user_tag: creator_tag,
                        event_name: name,
                        event_description: description,
                        event_date_start: start_date,
                        history_status: 'create',
                        is_complaint: false, // Для создателя жалобы нет
                    },
                    { transaction: t }
                );

                // Добавляем участников в историю
                for (const participant of participants) {
                    await history.upsert(
                        {
                            user_tag: participant.user_tag,
                            event_name: name,
                            event_description: description,
                            event_date_start: start_date,
                            history_status: 'participant',
                            is_complaint: participant.is_reported || false, // Переносим флаг жалобы
                        },
                        { transaction: t }
                    );
                }

                // Опционально: удаляем событие b фото
                try {
                    fs.unlink(photo_url);
                    console.log('Файл успешно удален с сервера');
                  } catch (err) {
                    console.error('Ошибка при удалении файла:', err);
                  }
                
                await Event.destroy({
                    where: { event_id },
                    transaction: t,
                });
                // Опционально: удаляем связанные запросы
                await RequestEvent.destroy({
                    where: { event_id },
                    transaction: t,
                });
            });

            console.log(`Событие ${name} перенесено в историю`);
        }
    } catch (error) {
        console.error('Ошибка при переносе событий в историю:', error);
    }
};

module.exports = moveExpiredEventsToHistory;