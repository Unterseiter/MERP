import React, { useState, useEffect } from 'react';
import { EventCard } from './../../components/Event/EventCard';
import EventService from '../../services/Event.service/event.service';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limited: 6, // Number of events to load per page
    search: '',
    sortBy: 'start_date',
    sortOrder: 'ASC',
  });
  const [hasMore, setHasMore] = useState(true);

  // Fetch events
  const fetchEvents = async (reset = false) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: reset ? 1 : filters.page,
      };
      const data = await EventService.getAllRecords(params);
      console.log(data);
      if (reset) {
        setEvents(data.data || []);
      } else {
        setEvents((prev) => [...prev, ...(data.data || [])]);
      }
      
      // Check if there are more events to load
      setHasMore(data.data?.length === filters.limited);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading events');
    } finally {
      setLoading(false);
    }
  };

  // Load more events
  const handleLoadMore = () => {
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  // Initial fetch and fetch on page change
  useEffect(() => {
    fetchEvents();
  }, [filters.page]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-[#5A4A42]">Events</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && events.length === 0 && (
        <div className="text-blue-500 mb-4">Loading...</div>
      )}

      {/* Event Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event.event_id}
            id={event.event_id}
            title={event.name}
            description={event.description}
            imageUrl={event.photo_url || 'https://via.placeholder.com/400x225'}
          />
        ))}
      </div>

      {/* No Events Message */}
      {events.length === 0 && !loading && (
        <p className="text-gray-500 text-center mt-6">No events found</p>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className={`px-6 py-2 rounded-full font-semibold text-white ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#5A4A42] hover:bg-[#4A3A32] transition'
            }`}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventList;