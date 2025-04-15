const { sequelize, Event, RequestEvent, history } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

//логер
const { Logger } = require('../../utils/LogFile');
const logger = new Logger().init();
const info1 = async (mess) => { (await logger).info(mess) };
const err = async (mess) => { (await logger).error(mess) };

const moveEventToHistoryById = async (eventId) => {
    try {
        // Находим событие по ID
        const event = await Event.findOne({
            where: { event_id: eventId },
            attributes: ['event_id', 'creator_tag', 'name', 'description', 'start_date', 'photo_url'],
        });

        if (!event) {
            throw err('Событие не найдено');
        }

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
                    is_complaint: false,
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
                        is_complaint: participant.is_reported || false,
                    },
                    { transaction: t }
                );
            }

            // Удаление файла изображения (если есть)
            if (photo_url) {
                try {
                    // Получаем абсолютный путь к файлу
                    const filePath = path.join(__dirname, '..', '..', photo_url.replace(/^\//, ''));
                    
                    // Проверяем существование файла перед удалением
                    await fs.access(filePath, fs.constants.F_OK);
                    await fs.unlink(filePath);
                    info1(`Файл ${filePath} успешно удалён`);
                } catch (err) {
                    if (err.code !== 'ENOENT') {
                        console.error('Ошибка при удалении файла:', err);
                    }
                }
            }


            // Удаляем событие и связанные запросы
            await Event.destroy({
                where: { event_id },
                transaction: t,
            });

            await RequestEvent.destroy({
                where: { event_id },
                transaction: t,
            });
        });

        info1(`Событие ${name} (ID: ${event_id}) перенесено в историю`);
        return { success: true, message: 'Событие перенесено в историю' };

    } catch (error) {
        console.error('Ошибка при переносе события:', error);
        err(`Ошибка при переносе события: ${error}`)
    }
};

module.exports = moveEventToHistoryById;