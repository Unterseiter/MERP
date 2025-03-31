import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SLIDES from './carouselData';
  

const Carousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    const nextSlide = useCallback(() =>{
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, [SLIDES.length]);
    
    const prevSlide = useCallback(() => {
      setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
    },[SLIDES.length]);
  
    useEffect(() => {
      let interval;
      if (autoPlay) {
        interval = setInterval (nextSlide, 7000);
      }
      return () => {
        if (interval) clearInterval(interval); 
      };
    },[autoPlay, nextSlide]);

    return (
      <section className="py-12 px-6">
        <h2 className="text-3xl font-bold text-center text-[#5A4A42] mb-8">
          Главные события города
        </h2>
        
        <div 
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
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
              {SLIDES.map((SLIDE) => (
                <div 
                  key={SLIDE.id}
                  className="min-w-full"
                >
                  <div className="relative aspect-[16/9]">
                    <img 
                      src={SLIDE.imageUrl}
                      alt={SLIDE.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-6">
                      <h3 className="text-2xl font-bold mb-2">{SLIDE.title}</h3>
                      <p>{SLIDE.description}</p>
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