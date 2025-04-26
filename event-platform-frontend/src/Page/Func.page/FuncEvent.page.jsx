import React, { useState, useEffect } from 'react';
import { EventCard } from './../../components/Event/EventCard';
import EventService from '../../services/Event.service/event.service';
import styles from './style.module.css';
import EventSearch from '../../components/search/EventSearch';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearch, setHasSearch] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limited: 6,
    search: '',
    start_date: null,
    end_date: null,
    sortBy: 'start_date',
    sortOrder: 'ASC',
  });
  const [hasMore, setHasMore] = useState(true);

  // Первоначальная загрузка данных
  useEffect(() => {
    fetchEvents(true);
  }, []);

  const fetchEvents = async (reset = false) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: reset ? 1 : filters.page,
        start_date: hasSearch ? filters.start_date?.toISOString() : undefined,
        end_date: hasSearch ? filters.end_date?.toISOString() : undefined,
      };

      const data = await EventService.getAllRecords(params);
      console.log(data);
      const newEvents = data.data || [];
      
      setEvents(prev => reset ? newEvents : [...prev, ...newEvents]);
      setHasMore(newEvents.length >= filters.limited);

    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки событий');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters) => {
    setHasSearch(true);
    setFilters(prev => ({
      ...prev,
      ...searchFilters,
      page: 1
    }));
  };

  const handleReset = () => {
    setHasSearch(false);
    setFilters({
      page: 1,
      limited: 6,
      search: '',
      start_date: null,
      end_date: null,
      sortBy: 'start_date',
      sortOrder: 'ASC',
    });
  };

  useEffect(() => {
    fetchEvents(true);
  }, [filters.page, filters.search, filters.start_date, filters.end_date, filters.sortBy, filters.sortOrder]);

  return (
    <section className={styles.container}>
      <EventSearch 
        onSearch={handleSearch} 
        onReset={handleReset} 
        hasSearch={hasSearch}
      />
      
      {error && <div className={styles.error}>{error}</div>}

      <div className={`${styles.eventContainer} ${hasSearch ? styles.threeColumns : styles.twoColumns}`}>
        {events.map((event) => (
          <EventCard
            key={event.event_id}
            id={event.event_id}
            title={event.name}
            description={event.description}
            imageUrl={event.photo_url || './images.png'}
          />
        ))}
      </div>

      {hasMore && !loading && (
        <button 
          onClick={() => setFilters(prev => ({...prev, page: prev.page + 1}))}
          className={styles.loadMore}
        >
          Показать еще
        </button>
      )}

      {loading && <div className={styles.loading}>Загрузка...</div>}
    </section>
  );
};

export default EventList;