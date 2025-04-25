import { useState, useEffect, useContext, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiPlus, FiEdit, FiTrash, FiCheck, FiX, FiCalendar, FiUsers } from 'react-icons/fi';
import EventService from '../services/Event.service/event.service';
import RequestService from '../services/requestEvent.service/requestEvent.service';
import { AuthContext } from '../components/authorization/AuthContext';

const EventManager = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [requests, setRequests] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        limited: 1,
        start_date: new Date(),
        end_date: new Date(),
    });
    const [filters, setFilters] = useState({
        search: '',
        start_date: null,
        end_date: null,
        sortBy: 'start_date',
        sortOrder: 'ASC',
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const eventsData = await EventService.getAllRecords(filters);
                const requestsData = await RequestService.getAllRecords();
                console.log(requestsData);
                setEvents(eventsData.data);
                setRequests(requestsData.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filters]);

    const handleGetAll = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                start_date: filters.start_date?.toISOString(),
                end_date: filters.end_date?.toISOString(),
            };
            const eventsData = await EventService.getAllRecords(params);
            setEvents(eventsData.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    }, [filters]); // Добавляем зависимости

    // Добавляем недостающую функцию handleRequest
    const handleRequest = async (eventId, action, requestId) => {
        try {
            setLoading(true);
            switch (action) {
                case 'create':
                    const newRequest = await RequestService.createRecord(eventId);
                    setRequests(prev => [...prev, newRequest.data]);
                    break;
                case 'delete':
                    await RequestService.deleteRecord(requestId);
                    setRequests(prev => prev.filter(r => r.request_id !== requestId));
                    break;
                default:
                    throw new Error('Неизвестное действие');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка операции');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await handleGetAll();
            // Загрузка запросов
            try {
                const requestsData = await RequestService.getAllRecords();
                setRequests(requestsData.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки запросов');
            }
        };
        fetchData();
    }, [handleGetAll]); // Добавляем handleGetAll в зависимости

    const validateForm = () => {
        const errors = {};
        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);

        if (!formData.name.trim()) {
            errors.name = 'Название обязательно';
        } else if (formData.name.length > 100) {
            errors.name = 'Максимум 100 символов';
        }

        if (!formData.description.trim()) {
            errors.description = 'Описание обязательно';
        } else if (formData.description.length > 1000) {
            errors.description = 'Максимум 1000 символов';
        }

        if (isNaN(startDate.getTime())) {
            errors.start_date = 'Неверная дата начала';
        }

        if (isNaN(endDate.getTime())) {
            errors.end_date = 'Неверная дата окончания';
        } else if (startDate >= endDate) {
            errors.end_date = 'Дата окончания должна быть позже начала';
        }

        if (formData.limited < 0) {
            errors.limited = 'Лимит не может быть отрицательным';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Максимальный размер файла 5MB');
                return;
            }
            setFile(file);
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            const eventData = {
                ...formData,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: new Date(formData.end_date).toISOString(),
                limited: parseInt(formData.limited)
            };

            const data = selectedEvent
                ? await EventService.updateRecord(selectedEvent.event_id, eventData, file)
                : await EventService.createRecord(eventData, file);

            setEvents(prev => selectedEvent
                ? prev.map(e => e.event_id === data.event_id ? data : e)
                : [...prev, data]);

            resetForm();
        } catch (err) {
            let errorMessage = 'Ошибка операции';
            if (err.response?.data?.details) {
                const serverErrors = err.response.data.details.reduce((acc, curr) => {
                    acc[curr.path[0]] = curr.message;
                    return acc;
                }, {});
                setValidationErrors(serverErrors);
            } else {
                setError(err.response?.data?.message || errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        try {
            setLoading(true);
            await EventService.removeRecord(eventId);
            setEvents(prev => prev.filter(event => event.event_id !== eventId));
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка удаления');
        } finally {
            setLoading(false);
        }
    };

    // Добавьте этот метод в компонент
    const handleEdit = (event) => {
        setSelectedEvent(event);
        setFormData({
            ...event,
            start_date: new Date(event.start_date),
            end_date: new Date(event.end_date)
        });
        setPreview(event.photo_url); // Показываем текущее фото
        setShowModal(true);
    };

    const resetForm = () => {
        setValidationErrors({});
        setSelectedEvent(null);
        setFormData({
            name: '',
            description: '',
            limited: 1,
            start_date: new Date(),
            end_date: new Date(),
        });
        setFile(null);
        setPreview(null);
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Manager</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                        <FiPlus className="mr-2" /> New Event
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto bg-white rounded-xl p-6 shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="p-2 border rounded-lg"
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                    />
                    <DatePicker
                        selected={filters.start_date}
                        onChange={date => setFilters({ ...filters, start_date: date })}
                        placeholderText="Start Date"
                        className="p-2 border rounded-lg w-full"
                    />
                    <DatePicker
                        selected={filters.end_date}
                        onChange={date => setFilters({ ...filters, end_date: date })}
                        placeholderText="End Date"
                        className="p-2 border rounded-lg w-full"
                    />
                    <select
                        className="p-2 border rounded-lg"
                        value={filters.sortBy}
                        onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                    >
                        <option value="start_date">Start Date</option>
                        <option value="end_date">End Date</option>
                        <option value="views">Views</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Events List */}
                <div className="lg:col-span-2 space-y-6">
                    {events.map(event => (
                        <div key={event.event_id} className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                                    <p className="text-gray-600 mt-1">{event.description}</p>
                                </div>
                                {event.photo_url && (
                                    <img
                                        src={event.photo_url}
                                        alt={event.name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center">
                                    <FiCalendar className="mr-2" />
                                    {new Date(event.start_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                    <FiUsers className="mr-2" />
                                    {event.limited} participants
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex space-x-2">
                                    {event.creator_tag !== user.tag_name ? (
                                        <button
                                            onClick={() => handleRequest(event.event_id, 'create')}
                                            className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center hover:bg-green-200"
                                        >
                                            <FiCheck className="mr-2" /> Join
                                        </button>
                                    ) : (
                                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                                            Your Event
                                        </div>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedEvent(event);
                                            setFormData({
                                                ...event,
                                                start_date: new Date(event.start_date),
                                                end_date: new Date(event.end_date)
                                            });
                                            setPreview(event.photo_url); 
                                            setShowModal(true);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <FiEdit className="text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.event_id)}
                                        className="p-2 hover:bg-red-100 rounded-lg"
                                    >
                                        <FiTrash className="text-red-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Requests Panel */}
                <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
                    <h2 className="text-xl font-semibold mb-4">My Requests</h2>
                    <div className="space-y-4">
                        {requests.map(request => (
                            <div key={request.request_id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{request.Event?.name}</span>
                                    <span className={`px-2 py-1 rounded-full text-sm ${request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        request.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {request.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                    <div className="flex space-x-2">
                                        {request.status === 'expectation' && (
                                            <button
                                                onClick={() => handleRequest(null, 'delete', request.request_id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FiX />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-8 w-full max-w-2xl">
                        <h2 className="text-2xl font-bold mb-6">
                            {selectedEvent ? 'Edit Event' : 'Create New Event'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Name
                                        {validationErrors.name && (
                                            <span className="text-red-500 text-sm ml-2">{validationErrors.name}</span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full p-2 border rounded-lg ${validationErrors.name ? 'border-red-500' : ''}`}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                {/* Limit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Participants Limit
                                        {validationErrors.limited && (
                                            <span className="text-red-500 text-sm ml-2">{validationErrors.limited}</span>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className={`w-full p-2 border rounded-lg ${validationErrors.limited ? 'border-red-500' : ''}`}
                                        value={formData.limited}
                                        onChange={e => setFormData({ ...formData, limited: e.target.value })}
                                    />
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                        {validationErrors.start_date && (
                                            <span className="text-red-500 text-sm ml-2">{validationErrors.start_date}</span>
                                        )}
                                    </label>
                                    <DatePicker
                                        selected={formData.start_date}
                                        onChange={date => setFormData({ ...formData, start_date: date })}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className={`w-full p-2 border rounded-lg ${validationErrors.start_date ? 'border-red-500' : ''}`}
                                    />
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                        {validationErrors.end_date && (
                                            <span className="text-red-500 text-sm ml-2">{validationErrors.end_date}</span>
                                        )}
                                    </label>
                                    <DatePicker
                                        selected={formData.end_date}
                                        onChange={date => setFormData({ ...formData, end_date: date })}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className={`w-full p-2 border rounded-lg ${validationErrors.end_date ? 'border-red-500' : ''}`}
                                        minDate={formData.start_date}
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                        {validationErrors.description && (
                                            <span className="text-red-500 text-sm ml-2">{validationErrors.description}</span>
                                        )}
                                    </label>
                                    <textarea
                                        className={`w-full p-2 border rounded-lg ${validationErrors.description ? 'border-red-500' : ''}`}
                                        rows="4"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {/* Image Upload */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                    {/* Показываем существующее фото или превью нового */}
                                    {(preview || selectedEvent?.photo_url) && (
                                        <img
                                            src={preview || selectedEvent?.photo_url}
                                            alt="Preview"
                                            className="mt-2 w-32 h-32 object-cover rounded-lg"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Form Buttons */}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    {selectedEvent ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-xl animate-pulse">
                        Loading...
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventManager;