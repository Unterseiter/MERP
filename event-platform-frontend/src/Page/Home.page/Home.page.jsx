import React, { useState, useEffect } from 'react';
import Carousel from '../../components/carousel/carousel';
import { EventsList } from '../../components/Event/EventList';
import { useNavigate } from 'react-router-dom';
import ROUTER_PATH from '../../navigation/path';
import EventService from '../../services/Event.service/event.service';

function Home() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [hasSearch, setHasSearch] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        start_date: null,
        end_date: null,
        sortBy: 'start_date',
        sortOrder: 'ASC'
    });
    const limited = 6;

    useEffect(() => {
        fetchEvents();
    }, [page, filters]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
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
            
            setTimeout(() => {
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
        setPage(1);
    };

    const handleReset = () => {
        setHasSearch(false);
        setFilters({
            search: '',
            start_date: null,
            end_date: null,
            sortBy: 'start_date',
            sortOrder: 'ASC'
        });
        setPage(1);
    };

    return (
        <div className="bg-[#fef6f1] ">
            <Carousel/>
            <EventsList 
                eventList={events} 
                loading={loading}
                error={error}
                hasSearch={hasSearch}
                onSearch={handleSearch}
                onReset={handleReset}
                handleMoreClick={() => navigate(ROUTER_PATH.func)}
            />
        </div>
    )
}

export default Home;