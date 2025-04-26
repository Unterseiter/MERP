import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiCheck, FiX } from 'react-icons/fi';
import { AuthContext } from '../../components/authorization/AuthContext';
import EventService from '../../services/Event.service/event.service';
import RequestService from '../../services/requestEvent.service/requestEvent.service';

const EventDetailsPage = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventRequests, setEventRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [loadingEvents, setLoadingEvents] = useState(false);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [error, setError] = useState('');

    const filters =
    {
        event_id: '',
        user_tag: '',
        status: '',
        is_reported: ''
    };


    const fetchEvents = async () => {
        try {
            setLoadingEvents(true);
            const eventsData = await EventService.getAllRecords({});
            setEvents(eventsData.data);
            if (eventsData.data.length > 0) {
                setSelectedEvent(eventsData.data[0]);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading events');
        } finally {
            setLoadingEvents(false);
        }
    };

    const fetchRequests = async (eventId) => {
        try {
            setLoadingRequests(true);
            filters.event_id = eventId;
            console.log(`event ${eventId}`)
            const requestsData = await RequestService.getAllRecords(filters);
            console.log(requestsData);
            setEventRequests(requestsData.data ? requestsData.data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading requests');
        } finally {
            setLoadingRequests(false);
        }
    };
    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            // console.log(selectedEvent);
            setEventRequests([]);
            fetchRequests(selectedEvent.event_id);
            console.log(eventRequests);
            setSelectedRequest(null);
        }
    }, [selectedEvent]);

    const handleRequestAction = async (requestId, action) => {
        try {
            if (action === 'accept') {
                await RequestService.updateStatus(requestId, 'accept');
            } else if (action === 'reject') {
                await RequestService.updateStatus(requestId, 'rejection');
            }
            fetchRequests(selectedEvent.event_id);
        } catch (err) {
            setError(err.response?.data?.message || 'Error processing request');
        }
    };

    const getRequestStats = () => ({
        pending: eventRequests.filter(r => r.status === 'expectation').length,
        accepted: eventRequests.filter(r => r.status === 'accept').length,
        rejected: eventRequests.filter(r => r.status === 'rejection').length,
    });
    // 'expectation', 'accept', 'rejection'
    const isCreator = selectedEvent && selectedEvent.creator_tag === user.tag_name;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Event Dashboard</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Events List */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Events</h2>
                        {loadingEvents ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : events.length > 0 ? (
                            <div className="space-y-4">
                                {events.map(event => (
                                    <motion.div
                                        key={event.event_id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`p-4 rounded-lg cursor-pointer transition ${selectedEvent?.event_id === event.event_id
                                            ? 'bg-indigo-100'
                                            : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        <h3 className="font-semibold">{event.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(event.start_date).toLocaleDateString()}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No events found</p>
                        )}
                    </div>

                    {/* Main Panel */}
                    <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
                        {selectedEvent ? (
                            <>
                                {/* Event Info */}
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold">{selectedEvent.name}</h2>
                                    <p className="text-gray-600 mt-2">{selectedEvent.description}</p>
                                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <FiCalendar className="mr-2" />
                                            {new Date(selectedEvent.start_date).toLocaleDateString()} - {new Date(selectedEvent.end_date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center">
                                            <FiUsers className="mr-2" />
                                            {selectedEvent.limited} participants
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                        <h3 className="font-semibold">Request Statistics</h3>
                                        <div className="grid grid-cols-3 gap-4 mt-2">
                                            <div>
                                                <p className="text-sm text-gray-600">Pending</p>
                                                <p className="font-semibold">{getRequestStats().pending}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Accepted</p>
                                                <p className="font-semibold">{getRequestStats().accepted}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Rejected</p>
                                                <p className="font-semibold">{getRequestStats().rejected}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Panel */}
                                {isCreator ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Requests */}
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4">Requests</h3>
                                            {loadingRequests ? (
                                                <div className="space-y-4">
                                                    {[...Array(4)].map((_, i) => (
                                                        <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="font-semibold">Pending</h4>
                                                        {eventRequests.filter(r => r.status === 'expectation').length ? (
                                                            eventRequests
                                                                .filter(r => r.status === 'expectation')
                                                                .map(request => (
                                                                    <motion.div
                                                                        key={request.request_id}
                                                                        whileHover={{ scale: 1.02 }}
                                                                        onClick={() => setSelectedRequest(request)}
                                                                        className={`p-4 border rounded-lg cursor-pointer ${selectedRequest?.request_id === request.request_id ? 'border-indigo-500' : 'border-gray-200'}`}
                                                                    >
                                                                        <p className="font-medium">{request.user_tag}</p>
                                                                        <p className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</p>
                                                                    </motion.div>
                                                                ))
                                                        ) : (
                                                            <p className="text-gray-400 text-sm">No pending requests</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">Accepted</h4>
                                                        {eventRequests.filter(r => r.status === 'accept').length ? (
                                                            eventRequests
                                                                .filter(r => r.status === 'accept')
                                                                .map(request => (
                                                                    <div key={request.request_id} className="p-4 border border-gray-200 rounded-lg">
                                                                        <p className="font-medium">{request.user_tag}</p>
                                                                        <p className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                ))
                                                        ) : (
                                                            <p className="text-gray-400 text-sm">No accepted requests</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Chat */}
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4">Chat</h3>
                                            {selectedRequest ? (
                                                <div className="border rounded-lg p-4">
                                                    <p className="font-medium mb-2">Chat with {selectedRequest.user_tag}</p>
                                                    <div className="h-64 bg-gray-100 rounded-lg p-4 mb-4">
                                                        <p className="text-gray-500">Chat functionality coming soon...</p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleRequestAction(selectedRequest.request_id, 'accept')}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                                        >
                                                            <FiCheck className="mr-2" /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestAction(selectedRequest.request_id, 'reject')}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                                                        >
                                                            <FiX className="mr-2" /> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="border rounded-lg p-4 text-gray-500">
                                                    Select a request to chat
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Event Chat</h3>
                                        <div className="border rounded-lg p-4">
                                            <p className="font-medium mb-2">Chat with {selectedEvent.creator_tag}</p>
                                            <div className="h-64 bg-gray-100 rounded-lg p-4">
                                                <p className="text-gray-500">Chat functionality coming soon...</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex justify-center items-center h-full text-gray-400">
                                Select an event to view details
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Toast */}
                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 p-4 rounded-lg shadow-lg">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetailsPage;
