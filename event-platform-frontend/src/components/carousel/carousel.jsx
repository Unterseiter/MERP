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

    useEffect(() => {
      const handleResize = () => window.scrollTo(0, 0);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
      <section className="py-9 px-6 relative overflow-hidden">
      <h2 className="text-3xl font-bold text-center text-[#5A4A42] mb-8">
        Главные события города
      </h2>

      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

      <div 
        className="relative mx-auto overflow-visible"
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
  
          <div className="relative h-[475px] w-[100%]">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-8" // Добавляем промежутки
              style={{ 
                transform: `translateX(calc(-${currentSlide * (100 / SLIDES.length)}%))`,
                padding: '0 10%' // Отступы по бокам
              }}
            >
              {SLIDES.map((SLIDE, index) => (
                <div 
                  key={SLIDE.id}
                  className={`
                    relative 
                    min-w-[60%]
                    flex-shrink-0 
                    transition-all 
                    duration-300
                    ${index === currentSlide ? 'scale-100 z-10' : 'scale-90 opacity-75 z-0'}
                  `}
                >
                  <div className="relative aspect-[16/9] h-full w-full shadow-xl rounded-xl overflow-hidden">
                    <img 
                      src={SLIDE.imageUrl}
                      alt={SLIDE.title}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    <section className='absolute text-[#FFFFFF] inset-0 flex flex-col justify-center items-center 
  bg-gradient-to-t from-black/80 to-transparent p-6'>
                      <div className='mt-auto text-center'>
                        <h3 className='text-2xl md:text-4xl font-bold mb-2'>
                          {SLIDE.title}
                        </h3>
                        <p className='text-sm md:text-lg max-w-2xl'>
                          {SLIDE.description}
                        </p>
                      </div>
                    </section>
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




  
  //         <div className="overflow-x-hidden overflow-y">
  //           <div 
  //             className="flex transition-transform duration-500 ease-in-out gap-8"
  //             style={{ 
  //               transform: `translateX(-${currentSlide * (100 / SLIDES.length)}%)`,
  //               width: `calc(${SLIDES.length * 100}% + ${SLIDES.length * 4}rem)` 
  //             }}
  //           >
  //             {SLIDES.map((SLIDE, index) => (
  //               <div 
  //               key={SLIDE.id}
  //               // className='carousel-slide'
  //               className={`
  //                 relative
  //                 min-w-[60vw]
  //                 flex-shrink-0 
  //                 transition-all 
  //                 duration-300
  //                 ${index === currentSlide ? 'scale-100 z-10' : 'scale-90 opacity-75 z-0'}
  //               `}
  //             >
  //                 <div className="relative aspect-[16/9] h-full w-full shadow-xl rounded-xl overflow-hidden">
  //                   <img 
  //                     src={SLIDE.imageUrl}
  //                     alt={SLIDE.title}
  //                     className="w-full h-full object-cover absolute inset-0"
  //                   />
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   );