import React, { useState } from 'react';
import { EventModal } from './EventModal';
import Modal from 'react-modal';

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
        <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
            <div onClick={openModal} className="aspect-[16/9]">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-6">
                <h3 className="text-xl font-semibold text-[#5A4A42] mb-2">{title}</h3>
                <p className="text-gray-600 line-clamp-2">{description}</p>
            </div>
            
            <EventModal
                isOpen={modalIsOpen}
                onClose={closeModal}
                event={event}
            />
        </article>
    );
};