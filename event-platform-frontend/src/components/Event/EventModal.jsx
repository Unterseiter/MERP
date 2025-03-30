import React from 'react';
import Modal from 'react-modal';
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
        top: 'auto',
        left: 'auto',
        right: 'auto',
        bottom: 'auto',
        border: '0',
        borderRadius: '5px',
        padding: '20px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        margin: '0 auto'
    }
};
export const EventModal = ({ isOpen, event, onClose }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Event Modal"
            className="modal"
            style={customStyles}
            overlayClassName="modal-overlay"
        >
            {event && (
                <>
                    {event.imageUrl && (
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-48 object-cover mb-4"
                        />
                    )}
                    <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#D4A373] text-white rounded hover:bg-[#aa8560] transition"
                    >
                        Закрыть
                    </button>
                </>
            )}
        </Modal>
    );
};