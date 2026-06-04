'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Photo {
  id: string;
  photo_url: string;
}

interface RestaurantPhotoGridProps {
  photos: Photo[];
  restaurantName: string;
  perPage?: number;
}

const resolveUrl = (photoUrl: string): string => {
  if (!photoUrl) return '';
  if (photoUrl.startsWith('http')) return photoUrl;
  
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
  return `${baseUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
};

export default function RestaurantPhotoGrid({ 
  photos, 
  restaurantName, 
  perPage = 15 
}: RestaurantPhotoGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(photos.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentPhotos = photos.slice(startIndex, startIndex + perPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentPhotos.map((photo, index) => {
          const url = resolveUrl(photo.photo_url);
          if (!url) return null;

          return (
            <div 
              key={photo.id} 
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={url}
                alt={`${restaurantName} - Photo ${startIndex + index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-5 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  page === currentPage 
                    ? 'bg-black text-white' 
                    : 'border hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-5 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
          >
            Next
          </button>
        </div>
      )}

      <div className="text-center text-sm text-gray-500 mt-6">
        Showing {startIndex + 1} - {Math.min(startIndex + perPage, photos.length)} of {photos.length} photos
      </div>
    </div>
  );
}