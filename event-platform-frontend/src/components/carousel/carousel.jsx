import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

  const slides = [
    {
      id: 1,
      title: "Масленица в КубГАУ",
      description: "Описание праздника и детали мероприятия...",
      imageUrl: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&q=80&w=1000",
    },
    {
      id: 2,
      title: "Новый год в Галерее",
      description: "Описание новогоднего мероприятия...",
      imageUrl: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&q=80&w=1000",
    },
  ];

const Carousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
  
    const nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    };
  
    const prevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };
  
    useEffect(() => {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }, []);
  
    return (
      <section className="py-12 px-6">
        <h2 className="text-3xl font-bold text-center text-[#5A4A42] mb-8">
          Главные события города
        </h2>
        
        <div className="relative max-w-7xl mx-auto">
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition z-10"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition z-10"
          >
            <ChevronRight size={24} />
          </button>
  
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div 
                  key={slide.id}
                  className="min-w-full"
                >
                  <div className="relative aspect-[16/9]">
                    <img 
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-6">
                      <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
                      <p>{slide.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  export default Carousel;