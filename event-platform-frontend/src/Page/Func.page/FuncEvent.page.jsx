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
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    start_date: null,
    end_date: null,
    sortBy: 'start_date',
    sortOrder: 'ASC',
  });
  const [hasMore, setHasMore] = useState(true);
  const limited = 6; // Фиксированный лимит элементов на странице

  useEffect(() => {
    // Сбрасываем на первую страницу при изменении фильтров
    setPage(1);
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [page, filters]);

  const fetchEvents = async () => {
    let errorTimer;
    
    try {
      setLoading(true);
      // Очищаем предыдущий таймер, если он есть
      if (errorTimer) clearTimeout(errorTimer);
      
      const params = {
        ...filters,
        page,
        limited,
        start_date: hasSearch ? filters.start_date?.toISOString() : undefined,
        end_date: hasSearch ? filters.end_date?.toISOString() : undefined,
      };

      const data = await EventService.getAllRecords(params);
      const newEvents = data.data || [];
      
      setEvents(prev => 
        page === 1 ? newEvents : [...prev, ...newEvents]
      );
      setHasMore(newEvents.length >= limited);

    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки событий');
      
      // Устанавливаем новый таймер
      errorTimer = setTimeout(() => {
        setError(null);
      }, 5000);
      
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters) => {
    setHasSearch(true);
    setFilters(prev => ({
      ...prev,
      ...searchFilters,
    }));
  };

  const handleReset = () => {
    setHasSearch(false);
    setFilters({
      search: '',
      start_date: null,
      end_date: null,
      sortBy: 'start_date',
      sortOrder: 'ASC',
    });
  };

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
          onClick={() => setPage(prev => prev + 1)}
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