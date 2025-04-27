import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiChevronLeft, FiChevronRight, FiInfo } from 'react-icons/fi';
import { AuthContext } from '../../components/authorization/AuthContext';
import EventService from '../../services/Event.service/event.service';
import RequestService from '../../services/requestEvent.service/requestEvent.service';
import ChatPanel from './chatPanel';

export function EventsList({ events, selectedEvent, onSelect }) {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className={`bg-white rounded-xl shadow-sm p-2 transition-all ${collapsed ? 'w-12' : 'w-64'}`}>
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="mb-2 p-1 hover:bg-gray-200 rounded"
            >
                {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
            {!collapsed && (
                <div className="space-y-2">
                    {events.map(evt => (
                        <motion.div
                            key={evt.event_id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => onSelect(evt)}
                            className={`p-2 rounded-lg cursor-pointer flex items-center transition ${selectedEvent?.event_id === evt.event_id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                        >
                            <div className="flex-1">
                                <h3 className="font-medium">{evt.name}</h3>
                                <p className="text-xs text-gray-500">{new Date(evt.start_date).toLocaleDateString()}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function EventAndRequestInfo({ selectedEvent, selectedRequest }) {
    const [expanded, setExpanded] = useState(false);
    const [currentRequest, setCurrentRequest] = useState(null);

    useEffect(() => {
        if (!selectedEvent) {
            setCurrentRequest(null);
            return;
        }

        // Если пользователь не является создателем события, создаём "виртуальную заявку"
        if (selectedEvent.isCreator === false) {
            setCurrentRequest({
                user_tag: selectedEvent.creator_tag,
                status: 'Организатор',
                createdAt: selectedEvent.start_date,
            });
        } else {
            // Иначе используем реальную выбранную заявку
            setCurrentRequest(selectedRequest);
        }
    }, [selectedEvent, selectedRequest]);

    if (!selectedEvent) return null;

    return (
        <div
            className="p-4 bg-gray-50 rounded-lg relative cursor-pointer"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-center space-x-2">
                <FiInfo />
                <div>
                    <div className="font-semibold">{selectedEvent.name}</div>
                    {currentRequest && (
                        <div className="text-sm text-gray-600">Партнёр: {currentRequest.user_tag}</div>
                    )}
                </div>
            </div>

            {expanded && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {/* Информация о событии */}
                    <div className="p-2 bg-white border rounded shadow">
                        <ul>
                            <li><strong>Начало:</strong> {new Date(selectedEvent.start_date).toLocaleString()}</li>
                            <li><strong>Окончание:</strong> {new Date(selectedEvent.end_date).toLocaleString()}</li>
                            <li><strong>Создатель:</strong> {selectedEvent.creator_tag}</li>
                        </ul>
                    </div>

                    {/* Информация о заявке */}
                    {currentRequest && (
                        <div className="p-2 bg-white border rounded shadow">
                            <ul>
                                <li><strong>Статус:</strong> {currentRequest.status}</li>
                                <li><strong>Дата подачи:</strong> {new Date(currentRequest.createdAt).toLocaleString()}</li>
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}


const EventDetailsPage = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventRequests, setEventRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [error, setError] = useState('');
    const [requestsCollapsed, setRequestsCollapsed] = useState(false);

    const filters = {
        event_id: '',
        user_tag: '',
        status: '',
        is_reported: ''
    };

    const userTag = user?.tag_name;


    useEffect(() => {
        if (!userTag) return;
        async function load() {
            setLoadingEvents(true);
            try {
                const res = await EventService.getUserRelatedEvents(userTag);
                console.log("res");
                console.log(res);
                setEvents(res.data);
                if (res.data.length) setSelectedEvent(res.data[0]);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoadingEvents(false);
            }
        }
        load();
    }, [userTag]);

    useEffect(() => {
        if (!selectedEvent) return;
        async function loadRequests() {
            setLoadingRequests(true);
            try {
                filters.event_id = selectedEvent.event_id;
                const res = await RequestService.getAllRecords(filters);
                const list = res.data || [];
                setEventRequests(list);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoadingRequests(false);
            }
        }
        loadRequests();
    }, [selectedEvent]);

    const handleAction = async (requestId, action) => {
        try {
            setLoadingRequests(true);
            const newStatus = action === 'accept' ? 'accept' : 'rejection';
            await RequestService.updateStatus(requestId, newStatus);
            filters.event_id = selectedEvent.event_id;
            const res = await RequestService.getAllRecords(filters);
            const list = res.data || [];
            setEventRequests(list);
            setSelectedRequest(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при обработке запроса');
        } finally {
            setLoadingRequests(false);
        }
    };

    const isCreator = selectedEvent && userTag && selectedEvent.creator_tag === userTag;

    if (!userTag) {
        return <div className="flex items-center justify-center min-h-screen">Загрузка пользователя...</div>;
    }


    const userVirtualRequest = !isCreator && selectedEvent ? {
        request_id: selectedEvent.Requests[0].request_id,
        event_id: selectedEvent.event_id,
        user_tag: userTag,
    } : null;

    return (
        <div className="flex min-h-screen">
            <EventsList
                events={events}
                selectedEvent={selectedEvent}
                onSelect={(evt) => {
                    setSelectedEvent(evt);
                    setSelectedRequest(null);
                    if (requestsCollapsed === false) {
                        setRequestsCollapsed(true); // автоматически скрыть заявки
                    }
                }}
            />
            <div className="flex-1 p-6 space-y-6">
                <EventAndRequestInfo selectedEvent={selectedEvent} selectedRequest={selectedRequest} />

                <div className={`grid grid-cols-1 ${isCreator ?'lg:grid-cols-[auto_1fr]':'lg:grid-cols-1'} gap-6`}>
                    {isCreator && (<motion.div
                        animate={{ width: requestsCollapsed ? '40px' : '300px' }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden bg-white rounded-lg shadow-sm p-2 flex flex-col"
                    >
                        {isCreator && (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <button
                                        onClick={() => setRequestsCollapsed(prev => !prev)}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        {requestsCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                                    </button>
                                </div>

                                {!requestsCollapsed && (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {eventRequests.map(req => (
                                            <motion.div
                                                key={req.request_id}
                                                onClick={() => setSelectedRequest(req)}
                                                whileHover={{ scale: 1.01 }}
                                                className={`p-2 w-auto border rounded cursor-pointer ${selectedRequest?.request_id === req.request_id
                                                    ? 'border-indigo-500'
                                                    : req.status === 'accept'
                                                        ? 'border-green-400'
                                                        : 'border-blue-300'
                                                    }`}
                                            >
                                                {req.user_tag} - {req.status}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>)}

                    <ChatPanel
                        selectedRequest={isCreator ? selectedRequest : userVirtualRequest}
                        isCreator={isCreator}
                        onAction={handleAction}
                    />
                </div>
            </div>

        </div>
    );
};

export default EventDetailsPage;
