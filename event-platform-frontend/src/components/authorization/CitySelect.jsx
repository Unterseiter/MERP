import React, { useState, useEffect, useRef } from 'react';
import { CityParser } from './cityParser';
import './CitySelect.css';

export const CitySelect = ({ value, onChange }) => {
  const [search, setSearch] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const parserRef = useRef(new CityParser());
  const wrapperRef = useRef(null);

  // Загружаем данные при монтировании
  useEffect(() => {
    parserRef.current.loadData();
  }, []);

  // Закрываем при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Поиск городов при изменении текста
  useEffect(() => {
    if (search.length >= 2) {
      setSuggestions(parserRef.current.searchCities(search));
    } else {
      setSuggestions([]);
    }
  }, [search]);

  const handleSelect = (city) => {
    onChange(city);
    setSearch(city);
    setIsOpen(false);
  };

  return (
    <div className="city-select" ref={wrapperRef}>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Начните вводить город"
        required
      />
      
      {isOpen && suggestions.length > 0 && (
        <div className="city-suggestions">
          {suggestions.map((city, index) => (
            <div 
              key={index} 
              className="suggestion-item"
              onClick={() => handleSelect(city)}
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};