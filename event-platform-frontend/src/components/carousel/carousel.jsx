import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SLIDES from './carouselData';
import { Swiper, SwiperSlide } from 'swiper/react';
  import { Navigation, Pagination, Autoplay } from 'swiper/modules';
  import 'swiper/css';
  import 'swiper/css/navigation';
  import 'swiper/css/pagination';
  

const Carousel = () => {
  return (
    <section className="py-12 px-6">
      <h2 className="text-3xl font-bold text-center text-[#5A4A42] mb-8">
        Главные события города
      </h2>
      
      <div className="max-w-6xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          slidesPerView={1.5}
          centeredSlides={true}
          spaceBetween={20}
          breakpoints={{
            640: {
              slidesPerView: 1.8,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 2.2,
              spaceBetween: 40,
            }
          }}
          className="overflow-visible py-8"
        >
          {SLIDES.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden group">
                <img 
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
                  <p className="text-white/90">{slide.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
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