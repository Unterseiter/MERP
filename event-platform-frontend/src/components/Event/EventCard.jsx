import React, { useState } from 'react';
import { EventModal } from './EventModal';
import Modal from 'react-modal';
import styles from './style.module.css';

Modal.setAppElement('#root');

export const EventCard = (Event) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const event = Event.Event;
    
    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = (e) => {
        e?.stopPropagation();
        setModalIsOpen(false);
    };

    return (
        <article onClick={openModal}  className={styles['card']}>
            <div className={styles['image-container']}>
                <img
                    src={event.photo_url}
                    alt={event.name}
                />
            </div>
            <div className={styles['text-container']}>
                <h3>{event.name}</h3>
                <p>{event.description}</p>
            </div>
            
            <EventModal
                isOpen={modalIsOpen}
                onClose={closeModal}
                event={event}
            />
        </article>
    );
};