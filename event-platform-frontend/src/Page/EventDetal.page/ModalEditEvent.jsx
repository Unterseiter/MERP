import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../components/crop/getCroppedImg'; // Утилита для обрезки

import 'react-datepicker/dist/react-datepicker.css';

const ModalEditEvent = ({ onClose, onSuccess, selectedEvent }) => {
    const [newEvent, setNewEvent] = useState({ ...selectedEvent });
    const modalRef = useRef();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }

        // Добавляем обработчик при монтировании
        document.addEventListener('mousedown', handleClickOutside);
        
        // Удаляем обработчик при размонтировании
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('Файл слишком большой (макс. 5 МБ)');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setShowCropper(true); // Показываем cropper
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setError('Выберите изображение');
            setFile(null);
            setPreview(null);
            setShowCropper(false);
        }
    };

    const onCropCompleteHandler = (_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    };

    const applyCrop = async () => {
        try {
            const blob = await getCroppedImg(preview, croppedAreaPixels);
            setFile(new File([blob], 'cropped.jpg', { type: 'image/jpeg' }));
            setPreview(URL.createObjectURL(blob));
            setShowCropper(false);
        } catch (err) {
            setError('Ошибка обрезки изображения');
        }
    };

    const handleSave = () => {
        onSuccess(newEvent, file);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg ring-2 ring-[#CAA07D]">
                <h2 className="text-2xl font-semibold mb-4">Редактировать событие</h2>

                <input
                    type="text"
                    placeholder="Название"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                />

                <textarea
                    placeholder="Описание"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                />

                <DatePicker
                    selected={newEvent.end_date}
                    onChange={(date) => setNewEvent({ ...newEvent, end_date: date })}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                />

                {showCropper && preview && (
                    <div className="relative w-full h-96 bg-gray-200 rounded overflow-hidden">
                        <Cropper
                            image={preview}
                            crop={crop}
                            zoom={zoom}
                            aspect={4 / 3} // или 1 / 1
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropCompleteHandler}
                        />
                        <div className="absolute bottom-2 left-0 right-0 flex justify-between items-center bg-white p-2">
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                            />
                            <button
                                onClick={applyCrop}
                                className="bg-[#CAA07D] text-white px-4 py-1 rounded"
                            >
                                Обрезать
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="bg-[#8e8b78] text-white py-2 px-4 rounded-lg hover:bg-[#5a6268]">
                        Закрыть
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-[#CAA07D] text-white py-2 px-4 rounded-lg hover:bg-[#B08F6E]">
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditEvent;