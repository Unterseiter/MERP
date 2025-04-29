import React, { useState, useEffect } from 'react';
import { FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DropdownMenu from './DropdownMenu';

export function EventAndRequestInfo({ selectedEvent, selectedRequest, onEdit, onDelete, isCreator }) {
    const [expanded, setExpanded] = useState(false);
    const [currentRequest, setCurrentRequest] = useState(null);

    useEffect(() => {
        if (!selectedEvent) {
            setCurrentRequest(null);
            return;
        }

        if (selectedEvent.isCreator === false) {
            setCurrentRequest({
                user_tag: selectedEvent.creator_tag,
                status: 'Организатор',
                createdAt: selectedEvent.start_date,
            });
        } else {
            setCurrentRequest(selectedRequest);
        }
    }, [selectedEvent, selectedRequest]);

    if (!selectedEvent) return null;

    const actions = [
        {
            label: 'Редактировать',
            onClick: () => onEdit(selectedEvent), // Действие для редактирования
        },
        {
            label: 'Удалить',
            onClick: () => onDelete(selectedEvent), // Действие для удаления
        },
    ];

    // Функция для обработки клика по информации
    const handleInfoClick = () => {
        setExpanded(!expanded);
    };

    return (
        <div
            className="p-4 rounded-2xl shadow transition hover:shadow-md cursor-pointer"
            style={{ backgroundColor: '#dec3ae' }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3" onClick={handleInfoClick}>
                    <FiInfo size={20} style={{ color: '#5A4A42' }} />
                    <div>
                        <div className="font-semibold text-[#5A4A42] text-lg">{selectedEvent.name}</div>
                        {currentRequest && (
                            <div className="text-sm text-[#6d5847]">
                                Партнёр: {currentRequest.user_tag}
                            </div>
                        )}
                    </div>
                </div>

                {/* Кнопка с выпадающим меню (три точки) */}
                {isCreator && (
                    <DropdownMenu
                        actions={actions}
                        onClick={(e) => e.stopPropagation()} // Останавливаем всплытие события
                    />
                )}
            </div>

            {expanded && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {/* Событие */}
                    <div
                        className="rounded-xl shadow-sm p-4"
                        style={{
                            backgroundColor: '#fef6f1',
                            border: '1px solid #dec3ae',
                        }}
                    >
                        <ul className="text-sm text-[#4b3621] space-y-1">
                            <li><strong>Начало:</strong> {new Date(selectedEvent.start_date).toLocaleString()}</li>
                            <li><strong>Окончание:</strong> {new Date(selectedEvent.end_date).toLocaleString()}</li>
                            <li><strong>Создатель:</strong> {selectedEvent.creator_tag}</li>
                        </ul>
                    </div>

                    {/* Заявка */}
                    {currentRequest && (
                        <div
                            className="rounded-xl shadow-sm p-4"
                            style={{
                                backgroundColor: '#fef6f1',
                                border: '1px solid #dec3ae',
                            }}
                        >
                            <ul className="text-sm text-[#4b3621] space-y-1">
                                <li><strong>Статус:</strong> {currentRequest.status}</li>
                                <li><strong>Дата подачи:</strong> {new Date(currentRequest.createdAt).toLocaleString()}</li>
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
