import { useState } from 'react';
import EventService from '../services/Event.service/event.service';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EventTester = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ 
    name: '', 
    description: '',
    limited:0,
    start_date: new Date(),
    end_date: new Date()
  });
  const [filters, setFilters] = useState({
    page: 1,
    limited: 10,
    search: '',
    startDate: null,
    endDate: null,
    sortBy: 'start_date',
    sortOrder: 'ASC',
    creatorTag: '',
    minViews: '',
    maxViews: ''
  });
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Получение всех событий с фильтрами
  const handleGetAll = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString()
      };
      
      const data = await EventService.getAllRecords(params);
      setEvents(data.rows || []);
      setError('');
    } catch (err) {
      setError(err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Создание события
  const handleCreate = async () => {
    try {
      setLoading(true);
      const eventData = {
        ...newEvent,
        start_date: newEvent.start_date.toISOString(),
        end_date: newEvent.end_date.toISOString()
      };
      const data = await EventService.createRecord(eventData);
      setEvents([...events, data]);
      setNewEvent({ ...newEvent, name: '', description: '' });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Обновление события
  const handleUpdate = async (id) => {
    try {
      setLoading(true);
      const data = await EventService.updateRecord(id, newEvent, currentUser);
      setEvents(events.map(e => e.event_id === id ? data : e));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Удаление события
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await EventService.removeRecord(id, currentUser);
      setEvents(events.filter(e => e.event_id !== id));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
          <input
            type="text"
            placeholder="Creator Tag"
            className="p-2 border rounded"
            value={filters.creatorTag}
            onChange={e => setFilters({ ...filters, creatorTag: e.target.value })}
          />
          <div className="flex gap-2">
            <DatePicker
              selected={filters.startDate}
              onChange={date => setFilters({ ...filters, startDate: date })}
              placeholderText="Start Date"
              className="p-2 border rounded w-full"
            />
            <DatePicker
              selected={filters.endDate}
              onChange={date => setFilters({ ...filters, endDate: date })}
              placeholderText="End Date"
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Views"
              className="p-2 border rounded w-full"
              value={filters.minViews}
              onChange={e => setFilters({ ...filters, minViews: e.target.value })}
            />
            <input
              type="number"
              placeholder="Max Views"
              className="p-2 border rounded w-full"
              value={filters.maxViews}
              onChange={e => setFilters({ ...filters, maxViews: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="p-2 border rounded w-full"
              value={filters.sortBy}
              onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="start_date">Start Date</option>
              <option value="end_date">End Date</option>
              <option value="views">Views</option>
            </select>
            <select
              className="p-2 border rounded w-full"
              value={filters.sortOrder}
              onChange={e => setFilters({ ...filters, sortOrder: e.target.value })}
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>
          <button 
            onClick={handleGetAll}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Список событий */}
      <div className="mb-6">
        {events.map(event => (
          <div key={event.event_id} className="mb-4 p-4 border rounded">
            <h3 className="text-lg font-semibold">{event.name}</h3>
            <p className="text-gray-600">{event.description}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleDelete(event.event_id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedEvent(event)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
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
            onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="p-2 border rounded"
            value={newEvent.description}
            onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
          />
          <DatePicker
            selected={newEvent.start_date}
            onChange={date => setNewEvent({ ...newEvent, start_date: date })}
            placeholderText="Start Date"
            className="p-2 border rounded"
            showTimeSelect
            dateFormat="Pp"
          />
          <DatePicker
            selected={newEvent.end_date}
            onChange={date => setNewEvent({ ...newEvent, end_date: date })}
            placeholderText="End Date"
            className="p-2 border rounded"
            showTimeSelect
            dateFormat="Pp"
          />
          <input
            type="number"
            placeholder="Views"
            className="p-2 border rounded"
            value={newEvent.views}
            onChange={e => setNewEvent({ ...newEvent, views: e.target.value })}
          />
          <input
            type="text"
            placeholder="Creator Tag"
            className="p-2 border rounded"
            value={newEvent.creator_tag}
            onChange={e => setNewEvent({ ...newEvent, creator_tag: e.target.value })}
          />
          <input
            type="text"
            placeholder="Your User Tag"
            className="p-2 border rounded"
            value={currentUser}
            onChange={e => setCurrentUser(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex-1"
            >
              Create
            </button>
            {selectedEvent && (
              <button
                onClick={() => handleUpdate(selectedEvent.event_id)}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex-1"
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