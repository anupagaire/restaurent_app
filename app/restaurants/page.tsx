'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from 'next/image';

const ITEMS_PER_PAGE = 12;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  city: string;
  status: boolean;
photos: { id: number; photo_url: string }[];
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function resolvePhoto(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: 'true',
        page: String(currentPage),
        page_size: String(ITEMS_PER_PAGE),
        ...(search && { search }),
      });

      // ✅ plain fetch — no auth header, fully public
      const res = await fetch(`${BASE_URL}/api/v1/restaurant/?${params}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        console.error('Failed to fetch restaurants:', res.status);
        setRestaurants([]);
        setTotalCount(0);
        return;
      }

      const data = await res.json();
      setRestaurants(data.results ?? []);
      setTotalCount(data.count ?? 0);
    } catch (err) {
      console.error(err);
      setRestaurants([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-5xl font-bold text-[#513012] text-center mb-4">
          All Restaurants
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Discover the best restaurants in Kathmandu
        </p>

        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#513012]"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-20">Loading...</p>
        ) : restaurants.length === 0 ? (
          <p className="text-center text-gray-500 py-20">No restaurants found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            {restaurants.map((restaurant) => {
                const photo = resolvePhoto(restaurant.photos?.[0]?.photo_url);
              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${toSlug(restaurant.name)}`}
                  className="group bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="relative h-40 bg-gray-100">
                    {photo ? (
                     <Image
  src={photo}
  alt={restaurant.name}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  className="object-cover"
/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-base font-bold text-[#513012]">{restaurant.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">📍 {restaurant.city}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2 flex-wrap">
            <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border disabled:opacity-50">
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border ${currentPage === i + 1 ? 'bg-[#513012] text-white' : 'bg-white'}`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border disabled:opacity-50">
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}