import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  src: string;
  heading: string;
  description: string;
}

interface CarouselProps {
  slides: Slide[];
  autoPlayMs?: number;
}

const Carousel = ({ slides, autoPlayMs = 5000 }: CarouselProps) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(next, autoPlayMs);
    return () => clearInterval(id);
  }, [paused, next, autoPlayMs, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
      style={{ aspectRatio: '16 / 5' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.heading}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

      {/* Text overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8 md:p-10 pointer-events-none">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute bottom-6 sm:bottom-8 md:bottom-10 left-6 sm:left-8 md:left-10 right-16 sm:right-20 transition-all duration-700 ease-in-out ${
              i === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-white text-lg sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-lg">
              {slide.heading}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm md:text-base mt-1 sm:mt-2 max-w-lg drop-shadow">
              {slide.description}
            </p>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;
export type { Slide };
