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
    <section className="px-6 py-2 sm:py-8 bg-[#fef6f1]">
      <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-center text-[#5A4A42] mb-2 xs:mb-3 sm:mb-5">
              Частные объявления
            </h2>
            <EventSearch 
              onSearch={onSearch}
              onReset={onReset}
              hasSearch={hasSearch}
            />
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventList.map((event) => (
            <EventCard
              Event={event}
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
              className="bg-[#CAA07D] text-white px-8 py-3 rounded-full hover:bg-[#B08F6E] transition min-w-10 w-[60%]"
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

// 