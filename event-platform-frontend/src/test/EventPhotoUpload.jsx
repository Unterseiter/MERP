import React, { useState } from 'react';
import axios from 'axios';

const EventPhotoUpload = () => {
    const [eventId, setEventId] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setMessage('Выберите изображение');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!eventId || !file) {
            setMessage('Укажите ID события и выберите файл');
            return;
        }

        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('photo', file);

        try {

            const response = await axios.post(
                `http://localhost:8080/api/events/${eventId}/photo`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                }
            );

            setMessage('Фотография загружена!');
            setPreview(response.data.photo_url);
            setFile(null);
            setEventId('');
        } catch (error) {
            console.error('Upload Error:', error);
            setMessage(error.response?.data?.message || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Загрузка фото для события</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>
                        ID события:
                        <input
                            type="text"
                            value={eventId}
                            onChange={(e) => setEventId(e.target.value)}
                            placeholder="Введите ID события"
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            disabled={loading}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>
                        Выберите фото:
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ marginTop: '5px' }}
                            disabled={loading}
                        />
                    </label>
                </div>
                {preview && (
                    <div style={{ marginBottom: '15px' }}>
                        <p>Превью:</p>
                        <img
                            src={preview}
                            alt="Превью"
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                        />
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        background: loading ? '#ccc' : '#28a745',
                        color: '#fff',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? 'Загрузка...' : 'Загрузить фото'}
                </button>
            </form>
            {message && (
                <p style={{ marginTop: '15px', color: message.includes('успешно') ? 'green' : 'red' }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default EventPhotoUpload;