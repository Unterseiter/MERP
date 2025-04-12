// EventsManagePage.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/authorization/AuthContext';
import AuthService from '../../services/Auth.service/auth.service';

const EventsManagePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await AuthService.getEvents(); // Предполагаемый запрос
        setEvents(response.data);
      } catch (err) {
        console.error('Ошибка загрузки мероприятий:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSelectEvent = async (eventId) => {
    setSelectedEvent(events.find((e) => e.id === eventId));
    try {
      const response = await AuthService.getEventRequests(eventId); // Запрос заявок
      setRequests(response.data);
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
    }
  };

  const handleAddEvent = () => {
    // Логика открытия формы создания мероприятия
    navigate('/events/new');
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await AuthService.deleteEvent(eventId);
      setEvents(events.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await AuthService.handleRequest(requestId, action); // accept, reject, ban
      setRequests(requests.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error('Ошибка обработки заявки:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <main className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-[#5A4A42] mb-6">Управление мероприятиями</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Мои мероприятия</h3>
            <button
              onClick={handleAddEvent}
              className="w-full bg-[#CAA07D] text-white py-2 rounded-md mb-4 hover:bg-[#B08F6E]"
            >
              Добавить мероприятие
            </button>
            {loading ? (
              <p>Загрузка...</p>
            ) : (
              <ul>
                {events.map((event) => (
                  <li key={event.id} className="flex justify-between items-center py-2">
                    <span
                      onClick={() => handleSelectEvent(event.id)}
                      className="cursor-pointer text-blue-600 hover:underline"
                    >
                      {event.title}
                    </span>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedEvent && (
            <div className="col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">{selectedEvent.title}</h3>
              <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
              <h4 className="text-lg font-medium mb-2">Заявки</h4>
              <ul>
                {requests.map((request) => (
                  <li key={request.id} className="flex justify-between items-center py-2">
                    <span>{request.user.tag_name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleRequestAction(request.id, 'accept')}
                        className="text-green-500 hover:text-green-700"
                      >
                        Принять
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, 'reject')}
                        className="text-red-500 hover:text-red-700"
                      >
                        Отклонить
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, 'ban')}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Забанить
                      </button>
                      <button
                        onClick={() => navigate(`/chat/${request.id}`)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Чат
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventsManagePage;