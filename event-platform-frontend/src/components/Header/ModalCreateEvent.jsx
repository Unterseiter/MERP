import { useState, useRef, useEffect } from 'react';
import EventService from '../../services/Event.service/event.service';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ModalCreateEvent = ({ onClose, onSuccess }) => {
    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        limited: 1,
        start_date: new Date(),
        end_date: new Date(),
    });
    const modalRef = useRef();
    const [isClosing, setIsClosing] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            closeModal();
        }
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Должно совпадать с duration анимации
    };
    // Обработка выбора файла
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('Файл слишком большой (макс. 5 МБ)');
                return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setError('Выберите изображение');
            setFile(null);
            setPreview(null);
        }
    };

    // Создание события
    const handleCreate = async () => {
        try {
            setLoading(true);
            setError('');

            // Валидация дат
            if (newEvent.start_date >= newEvent.end_date) {
                throw new Error('Дата окончания должна быть позже даты начала');
            }

            const eventData = {
                name: newEvent.name,
                description: newEvent.description,
                start_date: newEvent.start_date.toISOString(),
                end_date: newEvent.end_date.toISOString(),
                limited: parseInt(newEvent.limited) || 1,
            };

            const data = await EventService.createRecord(eventData, file);

            // Сброс формы после успешного создания
            setNewEvent({
                name: '',
                description: '',
                limited: 1,
                start_date: new Date(),
                end_date: new Date(),
            });
            setFile(null);
            setPreview(null);

            // Вызов callback для успешного создания
            onSuccess(data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка создания события');
        } finally {
            setLoading(false);
        }
    };

    return (
        
        <div
            className={`fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] transition-opacity duration-300  ${isClosing ? 'opacity-0' : 'opacity-100'
                }`}
            onClick={handleClickOutside}
        >
            <div
                ref={modalRef}
                className={`bg-white ring-[#CAA07D] ring-2  rounded-lg p-6 w-full max-w-2xl relative z-[10000] transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                    }`}
            >
               <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Создать новое событие</h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        &times;
                    </button>
                </div>
                {error && <div className="text-red-500 mb-4">{error}</div>}

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

                    {preview && (
                        <div>
                            <p className="text-gray-600 mb-1">Превью:</p>
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-w-full h-auto max-h-48 object-contain rounded"
                            />
                        </div>
                    )}

                    <div className="flex justify-between gap-2 mt-4">
                        <button
                            onClick={onClose}
                            className="text-red-500 px-4 py-2 rounded"
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleCreate}
                            className="bg-[#CAA07D] hover:bg-[#caa689d7] text-white px-4 py-2 rounded  flex items-center"
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
            </div>
        </div>
    );
};

export default ModalCreateEvent;