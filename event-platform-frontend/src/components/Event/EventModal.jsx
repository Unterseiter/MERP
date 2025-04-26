import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import styles from './style.module.css';

export const EventModal = ({ isOpen, event, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            setIsExpanded(false); // Сбрасываем состояние при закрытии
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsExpanded(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            contentLabel="Event Modal"
            className={{
                base: styles['modal-content'],
                afterOpen: isExpanded ? styles['expanded'] : '',
                beforeClose: ''
            }}
            overlayClassName={styles['modal-overlay']}
            ariaHideApp={false}
            style={{
                overlay: {
                    zIndex: 1000,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                },
                content: {
                    position: 'relative',
                    inset: 'auto',
                    margin: 'auto',
                    overflow: 'visible',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' // Добавляем transition для плавного изменения ширины
                }
            }}
        >
            {event && (
                <div className={styles['event-modal-container']}>
                    {/* Основная секция */}
                    <div className={`${styles['main-section']} ${isExpanded ? styles['expanded'] : ''}`}>
                        {event.imageUrl && (
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className={styles['event-image']}
                            />
                        )}
                        <h1 className={styles['event-title']}>{event.title}</h1>
                        <p className={styles['event-description']}>{event.description}</p>
                        
                        <div className={styles['button-group']}>
                            <button
                                onClick={handleClose}
                                className={`${styles.button} ${styles['button-gray']}`}
                            >
                                Закрыть
                            </button>
                            {!isExpanded && (
                                <button
                                    onClick={() => setIsExpanded(true)}
                                    className={`${styles.button} ${styles['button-green']}`}
                                >
                                    Присоединиться
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Расширенная секция - изначально скрыта */}
                    {isExpanded && (
                        <div className={styles['details-section']}>
                            <h2 className={styles['details-title']}>Детали участия</h2>
                            <div>
                                <div className={styles['detail-item']}>
                                    <p className={styles['detail-label']}>Дата и время:</p>
                                    <p>{event.date}</p>
                                </div>
                                <div className={styles['detail-item']}>
                                    <p className={styles['detail-label']}>Место проведения:</p>
                                    <p>{event.location}</p>
                                </div>
                                <div className={styles['detail-item']}>
                                    <p className={styles['detail-label']}>Контакты:</p>
                                    <p>{event.contacts}</p>
                                </div>
                                <div className={styles['detail-item']}>
                                    <p className={styles['detail-label']}>Требования:</p>
                                    <p>{event.requirements || 'Отсутствуют'}</p>
                                </div>
                            </div>
                            
                            <div className={styles['button-group']}>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className={`${styles.button} ${styles['button-gray']}`}
                                >
                                    Назад
                                </button>
                                <button
                                    onClick={() => alert('Успешная регистрация!')}
                                    className={`${styles.button} ${styles['button-green']}`}
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