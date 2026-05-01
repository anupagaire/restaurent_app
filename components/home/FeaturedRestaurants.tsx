'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  city: string;
  status: boolean;
  availability: string;
  photos: { id: number; photo: string }[];
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function resolvePhoto(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function FeaturedRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);

        // ✅ Removed today filter — now fetching ALL active restaurants
        const res = await fetch(
          `${BASE_URL}/api/v1/restaurant/?status=true&page_size=8`,
          { cache: 'no-store' }
        );

        if (!res.ok) {
          setRestaurants([]);
          return;
        }

        const data = await res.json();
        setRestaurants(data.results ?? []);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-serif text-center text-[#5D0565] mb-10">
          Featured Restaurants
        </h2>

        {loading ? (
          <p className="text-center text-gray-400">Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <p className="text-center text-gray-500">No restaurants available at the moment</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => {
              const photo = resolvePhoto(restaurant.photos?.[0]?.photo);

              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${toSlug(restaurant.name)}`}
                  className="bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-40 bg-gray-100">
                    {photo ? (
                      <img
                        src={photo}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl bg-gray-50">
                        🍽️
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-[#513012] text-lg leading-tight">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      📍 {restaurant.city}
                    </p>
                    
                    {restaurant.availability && (
                      <p className="text-[10px] text-green-600 mt-2 font-medium">
                        ● {restaurant.availability}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}