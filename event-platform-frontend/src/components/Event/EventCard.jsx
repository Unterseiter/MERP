import React, { useState } from 'react';
import { EventModal } from './EventModal';
import Modal from 'react-modal';
import styles from './style.module.css';

Modal.setAppElement('#root');

export const EventCard = ({ title, description, imageUrl, id }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    
    const event = {
        id,
        title,
        description,
        imageUrl
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <article className={styles['card']}>
            <div onClick={openModal} className={styles['image-container']}>
                <img
                    src={imageUrl}
                    alt={title}
                />
            </div>
            <div className={styles['text-container']}>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            
            <EventModal
                isOpen={modalIsOpen}
                onClose={closeModal}
                event={event}
            />
        </article>
    );
};