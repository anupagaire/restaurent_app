'use client';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategorySliderProps {
  categories: string[];
  activeCategory: string;
  onSelect: (cat: string) => void;
}

export default function CategorySlider({ categories, activeCategory, onSelect }: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

  // Auto-scroll active tab into view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLElement>('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 bg-white z-10 -mx-4 px-0 border-b border-gray-100 mb-6">
      <div className="relative flex items-center">

        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 z-20 flex items-center justify-center w-8 h-full bg-gradient-to-r from-white via-white to-transparent transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll left"
        >
          <div className="w-6 h-6 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
            <ChevronLeft size={14} className="text-gray-500" />
          </div>
        </button>

        {/* Scrollable tabs */}
        <div
          ref={scrollRef}
          className="flex gap-0 overflow-x-auto w-full px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={checkScroll}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                data-active={isActive}
                onClick={() => onSelect(cat)}
                className="shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
                style={{
                  borderBottomColor: isActive ? '#513012' : 'transparent',
                  color: isActive ? '#513012' : '#6b7280',
                  background: 'transparent',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 z-20 flex items-center justify-center w-8 h-full bg-gradient-to-l from-white via-white to-transparent transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll right"
        >
          <div className="w-6 h-6 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
            <ChevronRight size={14} className="text-gray-500" />
          </div>
        </button>

      </div>
    </div>
  );
}