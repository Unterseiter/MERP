import React from 'react';
import { EventCard } from './EventCard';
import EventSearch from '../../components/search/EventSearch';

export const EventsList = ({
  eventList = [],
  loading = false,
  error = null,
  hasSearch = false,
  onSearch = () => {},
  onReset = () => {},
  handleMoreClick = () => {},
}) => {
  return (
    <section className="px-6 py-12 bg-[#fef6f1]">
      <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-6">Частные объявления</h2>
            <EventSearch 
              onSearch={onSearch}
              onReset={onReset}
              hasSearch={hasSearch}
            />
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventList.map((event) => (
            <EventCard
              key={event.event_id || event.id}
              title={event.name || event.title}
              description={event.description}
              imageUrl={event.photo_url || event.imageUrl || './images.png'}
              id={event.event_id || event.id}
            />
          ))}
        </div>

        {loading && (
          <div className="text-center my-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#CAA07D] border-t-transparent"></div>
          </div>
        )}

        {eventList.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={handleMoreClick}
              className="bg-[#CAA07D] text-white px-8 py-3 rounded-full hover:bg-[#B08F6E] transition w-80"
              disabled={loading}
            >
              {loading ? 'Загрузка...' : 'Больше'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsList;