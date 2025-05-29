import { useState, useRef } from 'react';
import styles from './style.module.css';
import EventService from '../../services/Event.service/event.service';
import DatePicker from 'react-datepicker';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../components/crop/getCroppedImg';
import 'react-datepicker/dist/react-datepicker.css';
import ROTER_PATH from '../../navigation/path';
import { useNavigate } from 'react-router-dom';

const ModalCreateEvent = () => {
  const navigate = useNavigate();
  const handleHomeClick = () => navigate('/home');
    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        limited: 1,
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 1)), // Дата окончания +1 день
    });
    
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        
        setError('');
        if (!selectedFile.type.startsWith('image/')) {
            setError('Выберите изображение');
            return;
        }
        
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('Файл слишком большой (макс. 5 МБ)');
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            setShowCropper(true);
        };
        reader.readAsDataURL(selectedFile);
    };

    const onCropCompleteHandler = (_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    };

    const applyCrop = async () => {
        try {
            const blob = await getCroppedImg(preview, croppedAreaPixels);
            const croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
            setFile(croppedFile);
            setPreview(URL.createObjectURL(blob));
            setShowCropper(false);
        } catch (err) {
            setError('Ошибка обрезки изображения');
        }
    };

    const handleCreate = async () => {
        try {
            setLoading(true);
            setError('');

            if (newEvent.start_date >= newEvent.end_date) {
                throw new Error('Дата окончания должна быть позже даты начала');
            }

            const eventData = {
                ...newEvent,
                start_date: newEvent.start_date.toISOString(),
                end_date: newEvent.end_date.toISOString(),
                limited: parseInt(newEvent.limited) || 1,
            };

            const data = await EventService.createRecord(eventData, file);

            setNewEvent({
                name: '',
                description: '',
                limited: 1,
                start_date: new Date(),
                end_date: new Date(new Date().setDate(new Date().getDate() + 1)),
            });
            setFile(null);
            setPreview(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка создания события');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.global_section}>
            <h1 className={styles.header_text}>СОЗДАТЬ НОВОЕ СОБЫТИЕ</h1>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <div className="grid grid-cols-1 gap-4">
                <input
                    type="text"
                    placeholder="Название события"
                    className="p-2 border rounded"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    disabled={loading}
                />

                <textarea
                    placeholder="Описание"
                    className="p-2 border rounded"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    disabled={loading}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Дата начала</label>
                        <DatePicker
                            selected={newEvent.start_date}
                            onChange={(date) => setNewEvent({ ...newEvent, start_date: date })}
                            className="p-2 border rounded w-full"
                            showTimeSelect
                            dateFormat="Pp"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Дата окончания</label>
                        <DatePicker
                            selected={newEvent.end_date}
                            onChange={(date) => setNewEvent({ ...newEvent, end_date: date })}
                            className="p-2 border rounded w-full"
                            showTimeSelect
                            dateFormat="Pp"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Лимит участников</label>
                    <input
                        type="number"
                        placeholder="Лимит участников"
                        className="p-2 border rounded"
                        value={newEvent.limited}
                        onChange={(e) => setNewEvent({ ...newEvent, limited: e.target.value })}
                        min="1"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Изображение события</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="p-2 border rounded w-full"
                        disabled={loading}
                    />
                </div>

                {showCropper && preview && (
                    <div className="relative w-full h-96 bg-gray-200 rounded overflow-hidden">
                        <Cropper
                            image={preview}
                            crop={crop}
                            zoom={zoom}
                            aspect={4 / 3}
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowCropper(false)}
                                    className="bg-gray-500 text-white px-3 py-1 rounded"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={applyCrop}
                                    className="bg-[#CAA07D] text-white px-3 py-1 rounded"
                                >
                                    Обрезать
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between gap-2 mt-4">
                    <button
                        onClick={handleHomeClick}
                        className="text-red-500 px-4 py-2 rounded"
                        disabled={loading}
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleCreate}
                        className="bg-[#CAA07D] hover:bg-[#caa689d7] text-white px-4 py-2 rounded flex items-center mb-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Создание...
                            </>
                        ) : 'Создать событие'}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ModalCreateEvent;