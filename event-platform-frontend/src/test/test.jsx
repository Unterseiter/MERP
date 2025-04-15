import { useState, useEffect } from 'react';
import EventService from '../services/Event.service/event.service';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EventTester = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    limited: 1,
    start_date: new Date(),
    end_date: new Date(),
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limited: 10,
    search: '',
    start_date: null,
    end_date: null,
    sortBy: 'start_date',
    sortOrder: 'ASC',
    minViews: 0,
    maxViews: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Получение всех событий с фильтрами
  const handleGetAll = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        start_date: filters.start_date?.toISOString(),
        end_date: filters.end_date?.toISOString(),
      };
      const data = await EventService.getAllRecords(params);
      setEvents(data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки событий');
      setEvents([]);
    } finally {
      setLoading(false);
    }
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
      setEvents([...events, data]);
      setNewEvent({
        name: '',
        description: '',
        limited: 1,
        start_date: new Date(),
        end_date: new Date(),
      });
      setFile(null);
      setPreview(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка создания события');
    } finally {
      setLoading(false);
    }
  };

  // Обновление события
  const handleUpdate = async (id) => {
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

      const data = await EventService.updateRecord(id, eventData, file);
      setEvents(events.map((e) => (e.event_id === id ? data : e)));
      setSelectedEvent(null);
      setNewEvent({
        name: '',
        description: '',
        limited: 1,
        start_date: new Date(),
        end_date: new Date(),
      });
      setFile(null);
      setPreview(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка обновления события');
    } finally {
      setLoading(false);
    }
  };

  // Удаление события
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await EventService.removeRecord(id);
      setEvents(events.filter((e) => e.event_id !== id));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка удаления события');
    } finally {
      setLoading(false);
    }
  };

  // Выбор события для редактирования
  const handleEdit = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      name: event.name,
      description: event.description,
      limited: event.limited,
      start_date: new Date(event.start_date),
      end_date: new Date(event.end_date),
    });
    setFile(null);
    setPreview(event.photo_url); // Показываем текущее фото
  };

  // Загрузка событий при монтировании
  useEffect(() => {
    handleGetAll();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Event Service Tester</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="text-blue-500 mb-4">Loading...</div>}

      {/* Фильтры */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search"
            className="p-2 border rounded"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            disabled={loading}
          />
          <div className="flex gap-2">
            <DatePicker
              selected={filters.start_date}
              onChange={(date) => setFilters({ ...filters, start_date: date })}
              placeholderText="Start Date"
              className="p-2 border rounded w-full"
              disabled={loading}
            />
            <DatePicker
              selected={filters.end_date}
              onChange={(date) => setFilters({ ...filters, end_date: date })}
              placeholderText="End Date"
              className="p-2 border rounded w-full"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Views"
              className="p-2 border rounded w-full"
              value={filters.minViews}
              onChange={(e) => setFilters({ ...filters, minViews: e.target.value })}
              disabled={loading}
            />
            <input
              type="number"
              placeholder="Max Views"
              className="p-2 border rounded w-full"
              value={filters.maxViews}
              onChange={(e) => setFilters({ ...filters, maxViews: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="p-2 border rounded w-full"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              disabled={loading}
            >
              <option value="start_date">Start Date</option>
              <option value="end_date">End Date</option>
              <option value="views">Views</option>
            </select>
            <select
              className="p-2 border rounded w-full"
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
              disabled={loading}
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>
          <button
            onClick={handleGetAll}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Список событий */}
      <div className="mb-6">
        {events.length === 0 && !loading && <p className="text-gray-500">События не найдены</p>}
        {events.map((event) => (
          <div key={event.event_id} className="mb-4 p-4 border rounded">
            <h3 className="text-lg font-semibold">{event.name}</h3>
            <p className="text-gray-600">Описание: {event.description}</p>
            <p className="text-gray-600">Лимит: {event.limited || 'Без ограничений'}</p>
            <p className="text-gray-600">Просмотры: {event.views}</p>
            <p className="text-gray-600">
              Начало: {new Date(event.start_date).toLocaleString()}
            </p>
            <p className="text-gray-600">
              Окончание: {new Date(event.end_date).toLocaleString()}
            </p>
            {event.photo_url && (
              <div className="mt-2">
                <p className="text-gray-600">Фото:</p>
                <img
                  src={event.photo_url}
                  alt={event.name}
                  className="max-w-full h-auto max-h-48 object-contain rounded"
                />
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleDelete(event.event_id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                disabled={loading}
              >
                Delete
              </button>
              <button
                onClick={() => handleEdit(event)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                disabled={loading}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Форма создания/редактирования */}
      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">
          {selectedEvent ? 'Edit Event' : 'Create New Event'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Event Name"
            className="p-2 border rounded"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            disabled={loading}
          />
          <textarea
            placeholder="Description"
            className="p-2 border rounded"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            disabled={loading}
          />
          <DatePicker
            selected={newEvent.start_date}
            onChange={(date) => setNewEvent({ ...newEvent, start_date: date })}
            placeholderText="Start Date"
            className="p-2 border rounded"
            showTimeSelect
            dateFormat="Pp"
            disabled={loading}
          />
          <DatePicker
            selected={newEvent.end_date}
            onChange={(date) => setNewEvent({ ...newEvent, end_date: date })}
            placeholderText="End Date"
            className="p-2 border rounded"
            showTimeSelect
            dateFormat="Pp"
            disabled={loading}
          />
          <input
            type="number"
            placeholder="Limit"
            className="p-2 border rounded"
            value={newEvent.limited}
            onChange={(e) => setNewEvent({ ...newEvent, limited: e.target.value })}
            min="1"
            disabled={loading}
          />
          <div>
            <label className="block text-gray-700 mb-1">Фото</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="p-2 border rounded w-full"
              disabled={loading}
            />
          </div>
          {preview && (
            <div className="col-span-1 md:col-span-2">
              <p className="text-gray-600">Превью:</p>
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-auto max-h-48 object-contain rounded"
              />
            </div>
          )}
          <div className="col-span-1 md:col-span-2 flex gap-2">
            <button
              onClick={handleCreate}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex-1"
              disabled={loading}
            >
              Create
            </button>
            {selectedEvent && (
              <button
                onClick={() => handleUpdate(selectedEvent.event_id)}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex-1"
                disabled={loading}
              >
                Update
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTester;