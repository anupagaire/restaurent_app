'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Photo {
  id: number;
  photo_url: string;
}

interface RestaurantPhotoSliderProps {
  photos: Photo[];
  restaurantName: string;
}

const resolveUrl = (photoUrl: string): string => {
  if (!photoUrl) return '';
  if (photoUrl.startsWith('http')) return photoUrl;
  
  // तपाईंको base URL यहाँ राख्नुहोस्
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
  return `${baseUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
};

export default function RestaurantPhotoSlider({ 
  photos, 
  restaurantName 
}: RestaurantPhotoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerSlide = 3;

  const totalSlides = Math.ceil(photos.length / itemsPerSlide);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  if (!photos || photos.length === 0) return null;

  return (
    <div className="relative">
      {/* Slider Container */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div
              key={slideIndex}
              className="flex gap-3 w-full flex-shrink-0"
            >
              {photos
                .slice(
                  slideIndex * itemsPerSlide,
                  slideIndex * itemsPerSlide + itemsPerSlide
                )
                .map((photo, idx) => {
                  const url = resolveUrl(photo.photo_url);
                  if (!url) return null;

                  return (
                    <div
                      key={photo.id}
                      className="relative flex-1 aspect-[4/3] rounded-xl overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`${restaurantName} - Photo ${slideIndex * itemsPerSlide + idx + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {photos.length > 3 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-secondary/70 hover:bg-secondary/90 text-white p-4 rounded-full transition-all z-10"
          >
            ←
          </button>
          <button
            onClick={goToNext}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-secondary/70 hover:bg-secondary/90 text-white p-4 rounded-full transition-all z-10"
          >
            →
          </button>
        </>
      )}

      {/* Dots */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-secondary scale-110' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}