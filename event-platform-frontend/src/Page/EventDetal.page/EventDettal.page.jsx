import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiChevronLeft, FiChevronRight, FiInfo } from 'react-icons/fi';
import { AuthContext } from '../../components/authorization/AuthContext';
import EventService from '../../services/Event.service/event.service';
import RequestService from '../../services/requestEvent.service/requestEvent.service';
import { EventAndRequestInfo } from './EventAndRequestInfo';
import ModalEditEvent from './ModalEditEvent';
import ChatPanel from './chatPanel';

export function EventsList({ events, selectedEvent, onSelect, collapsed, setCollapsed }) {
    console.log(events);
    return (
        <motion.div
            animate={{ width: collapsed ? 48 : 256 }}
            transition={{ duration: 0.1 }}
            className="bg-white rounded-xl h-[77vh] shadow-sm p-2 overflow-hidden transition-all duration-90"
        >
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="mb-2 p-1 hover:bg-gray-200 rounded"
            >
                {collapsed ? <FiChevronRight /> : <div className='flex items-baseline'><FiChevronLeft /> <h1 className="font-semibold">Заявки и мероприятия</h1></div>}
            </button>

            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        {events.map((evt) => (
                            <motion.div
                                key={evt.event_id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => onSelect(evt)}
                                className={`p-2 rounded-lg cursor-pointer flex items-center border transition ${selectedEvent?.event_id === evt.event_id ? 'bg-indigo-100' : 'hover:bg-gray-100'
                                    }
                                    ${evt.isCreator ? 'border-green-500' : 'border-blue-500'}`}
                            >
                                <div className="flex-1">
                                    <h3 className="font-medium">{evt.name}</h3>
                                    <p className="text-xs text-gray-500">
                                        {new Date(evt.start_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
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
    const [showModal, setShowModal] = useState(false);

    const [collapsedEvent, setCollapsedEvent] = useState(false);

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
                setRequestsCollapsed(false);
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

    const handleEdit = (event) => {
        console.log("Редактирование события:", event);
        setShowModal(true);
    };

    const HandleEditNewData = async (updatedEvent, file = null) => {
        try {
            // Отправляем данные на сервер с использованием updateRecord
            const updatedData = await EventService.updateRecord(updatedEvent.event_id, updatedEvent, file);
            
            // После успешного обновления события обновляем состояние
            setSelectedEvent(updatedData);
    
            // Закрытие модального окна
            setShowModal(false);
            console.log("Событие успешно обновлено:", updatedData);
        } catch (error) {
            console.error("Ошибка при обновлении события:", error.message);
            setError("Не удалось обновить событие. Попробуйте снова.");
        }
    };

    const handleDelete = async (event) => {
        try {
            await EventService.removeRecord(event.event_id);
            setEvents((prevEvents) => prevEvents.filter((evt) => evt.event_id !== event.event_id));
            setSelectedEvent(null);
            console.log("Событие удалено");
        } catch (error) {
            setError('Ошибка при удалении события');
        }
    };

    return (
        <div className="flex min-h-screen">
            <EventsList
                events={events}
                selectedEvent={selectedEvent}
                onSelect={(evt) => {
                    setSelectedEvent(evt);
                    setSelectedRequest(null);
                }}
                collapsed={collapsedEvent}
                setCollapsed={setCollapsedEvent}
            />
            <div className="flex-1 p-6 space-y-6">
                <EventAndRequestInfo selectedEvent={selectedEvent} selectedRequest={selectedRequest} isCreator={isCreator} onDelete={handleDelete} onEdit={handleEdit} />

                <div className={`grid grid-cols-1 ${isCreator ? 'lg:grid-cols-[auto_1fr]' : 'lg:grid-cols-1'} gap-6`}
                >
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
                                        {requestsCollapsed ? <FiChevronRight /> : <div className='flex items-baseline'><FiChevronLeft /> <h1 className="font-semibold">Заявки</h1></div>}

                                    </button>
                                </div>

                                {!requestsCollapsed && (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {eventRequests.map(req => (
                                            <motion.div
                                                key={req.request_id}
                                                onClick={() => {
                                                    setSelectedRequest(req);
                                                    setRequestsCollapsed(true);
                                                    setCollapsedEvent(true);
                                                }}
                                                whileHover={{ scale: 1.01 }}
                                                className={`p-2 w-auto border mx-4 rounded cursor-pointer ${selectedRequest?.request_id === req.request_id
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
                {showModal && (
                    <ModalEditEvent onClose={()=>setShowModal(false)} onSuccess={HandleEditNewData} selectedEvent={selectedEvent} />
                )}
            </div>
        </div>
    );
};

export default EventDetailsPage;
