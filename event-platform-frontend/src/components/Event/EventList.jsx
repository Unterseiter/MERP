import React from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import { EventCard } from './EventCard';
import { useNavigate } from 'react-router-dom';
import ROUTER_PATH from '../../navigation/path';


export const EventsList = ({eventList, isVisibleSearth = false}) => {

  console.log(eventList);
  const events = eventList || [];
  const navigate = useNavigate();

  const handleAuthClick = () => {
    console.log("GHbskdmlafwem");
    navigate(ROUTER_PATH.func);
  }
  return (
    <section className="px-6 py-12">
      <div className="max-w-6xl mx-auto">
      {isVisibleSearth && (  // Условный рендеринг
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-[#5A4A42] mb-6">Частные объявления</h2>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Поиск"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CAA07D] pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>

              <div className="flex gap-4">
                <button className="bg-[#CAA07D] text-white px-6 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2">
                  <Filter size={20} />
                  <span>Фильтр</span>
                </button>
                <button className="bg-[#CAA07D] text-white px-6 py-2 rounded-full hover:bg-[#B08F6E] transition flex items-center gap-2">
                  <SortAsc size={20} />
                  <span>Сортировка</span>
                </button>
              </div>
            </div>
          </header>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              description={event.description}
              imageUrl={event.imageUrl}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleAuthClick}
            className="bg-[#CAA07D] text-white px-8 py-3 rounded-full hover:bg-[#B08F6E] transition">
            Больше
          </button>
        </div>
      </div>
    </section>
  );
}