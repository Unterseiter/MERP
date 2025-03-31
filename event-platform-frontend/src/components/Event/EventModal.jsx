import React from 'react';
import Modal from 'react-modal';
import { useState } from 'react';

const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1000,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        backgroundColor: 'rgb(255, 255, 255)',
        position: 'relative',
        border: '0',
        borderRadius: '5px',
        padding: '20px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        margin: '0 auto',
        transition: 'all 0.3s ease-out'
    }
};

export const EventModal = ({ isOpen, event, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClose = () => {
        setIsExpanded(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            contentLabel="Event Modal"
            style={{
                ...customStyles,
                content: {
                    ...customStyles.content,
                    maxWidth: isExpanded ? '900px' : '600px',
                    width: isExpanded ? '95%' : '90%'
                }
            }}
            overlayClassName="modal-overlay"
        >
            {event && (
                <div className={`flex ${isExpanded ? 'flex-row gap-6' : 'flex-col'}`}>
                    {/* Основная секция */}
                    <div className="flex-1">
                        {event.imageUrl && (
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-auto object-cover mb-4 rounded-lg"
                            />
                        )}
                        <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
                        <p className="text-gray-700 mb-4">{event.description}</p>
                        
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                            >
                                Закрыть
                            </button>
                            {!isExpanded && (
                                <button
                                    onClick={() => setIsExpanded(true)}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                >
                                    Присоединиться
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Расширенная секция */}
                    {isExpanded && (
                        <div className="flex-1 pl-6 border-l-2 border-gray-200">
                            <h2 className="text-xl font-bold mb-4">Детали участия</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="font-semibold">Дата и время:</p>
                                    <p>{event.date}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Место проведения:</p>
                                    <p>{event.location}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Контакты:</p>
                                    <p>{event.contacts}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Требования:</p>
                                    <p>{event.requirements || 'Отсутствуют'}</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-between items-center">
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                >
                                    Назад
                                </button>
                                <button
                                    onClick={() => alert('Успешная регистрация!')}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                >
                                    Подтвердить участие
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};