import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './style.module.css';

const EventSearch = ({ onSearch, onReset, hasSearch }) => {
  const [filters, setFilters] = useState({
    search: '',
    start_date: null,
    end_date: null,
    sortBy: 'start_date',
    sortOrder: 'ASC',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      start_date: null,
      end_date: null,
      sortBy: 'start_date',
      sortOrder: 'ASC',
    });
    onReset();
  };

  return (
    <div className={styles.searchWrapper}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        {hasSearch && (
          <>
            <div className={styles.dateGroup}>
              <DatePicker
                selected={filters.start_date}
                onChange={(date) => setFilters({ ...filters, start_date: date })}
                placeholderText="От"
                className={styles.datePicker}
                dateFormat="dd.MM.yyyy"
              />
              <DatePicker
                selected={filters.end_date}
                onChange={(date) => setFilters({ ...filters, end_date: date })}
                placeholderText="До"
                className={styles.datePicker}
                dateFormat="dd.MM.yyyy"
              />
            </div>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className={styles.sortSelect}
            >
              <option value="start_date">По дате</option>
              <option value="end_date">По окончанию</option>
            </select>
          </>
        )}

        <input
          type="text"
          placeholder="Поиск мероприятий..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className={styles.searchInput}
        />

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.searchButton}>
            {hasSearch ? 'Обновить' : 'Поиск'}
          </button>
          {hasSearch && (
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
            >
              Сброс
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EventSearch;