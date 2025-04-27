import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SLIDES from './carouselData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Carousel = () => {
  const swiperRef = useRef(null);

  return (
    <section className="py-2 sm:py-8 px-0 sm:px-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#5A4A42] mb-3 sm:mb-5">
        Главные события города
      </h2>
      
      <div className="max-w-7xl mx-auto  relative">
        {/* Адаптивные кнопки навигации */}
        <button 
          className="absolute left-1 sm:left-4 top-1/2 z-20 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#5A4A42]" />
        </button>
        
        <button 
          className="absolute right-1 sm:right-4 top-1/2 z-20 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#5A4A42]" />
        </button>

        <div 
          onMouseEnter={() => swiperRef.current?.autoplay.stop()}
          onMouseLeave={() => swiperRef.current?.autoplay.start()}
        >
          <Swiper
            modules={[Pagination, Autoplay, Navigation]}
            pagination={{ 
              clickable: true,
              dynamicBullets: true
            }}
            autoplay={{
              delay: 7000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={true}
            slidesPerView={1} // Изменили с 1.1 на 1
            centeredSlides={false} // Отключили центрирование для мобильных
            spaceBetween={0} // Убрали промежутки для мобильных
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 0, // Убрали промежутки
                centeredSlides: false // Отключили центрирование
              },
              480: {
                slidesPerView: 1,
                spaceBetween: 0,
                centeredSlides: true // Включаем центрирование с 480px
              },
              640: {
                slidesPerView: 1.4,
                spaceBetween: 25
              },
              // Large tablets (768px+)
              768: {
                slidesPerView: 1.7,
                spaceBetween: 30
              },
              // Laptops (1024px+)
              1024: {
                slidesPerView: 1.8,
                spaceBetween: 40
              },
              // Large screens (1280px+)
              1280: {
                slidesPerView: 2,
                spaceBetween: 50
              }
            }}
            className="overflow-visible py-6 sm:py-8"
          >
            {SLIDES.map((slide) => (
              <SwiperSlide key={slide.id}>
                {({ isActive }) => (
                  <div 
                    className={`
                      relative aspect-[16/9] rounded-xl overflow-hidden group
                      transition-all duration-500 cursor-pointer
                      ${isActive ? 'scale-110 z-10' : 'scale-90 opacity-70 hover:opacity-90'}
                    `}
                  >
                    <img 
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className={`
                      absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white
                      transition-all duration-500
                      ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
                    `}>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">{slide.title}</h3>
                      <p className="text-sm sm:text-base opacity-90 line-clamp-2">{slide.description}</p>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default Carousel;