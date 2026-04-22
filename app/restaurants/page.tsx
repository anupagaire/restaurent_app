'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { restaurants } from '@/data/mockData';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ITEMS_PER_PAGE = 12;

export default function RestaurantsPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 🔍 Filter restaurants
  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  // 📄 Pagination logic
  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRestaurants = filteredRestaurants.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

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

        {/* 🔍 Search */}
        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // reset page
            }}
            className="w-full max-w-md px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#513012]"
          />
        </div>

        {/* 🍽 Grid */}
        {currentRestaurants.length === 0 ? (
          <p className="text-center text-gray-500">
            No restaurants found.
          </p>
        ) : (
<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-8">
            {currentRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.slug}`}
                className="group bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all"
              >
<div className="relative h-40 ">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                </div>

                {/* Content */}
                <div className="p-3 ">
  <h3 className="text-base  font-bold text-[#513012]">
                    {restaurant.name}
                  </h3>

                  <p className="text-gray-600 text-sm mt-1">
                    📍 {restaurant.address}
                  </p>

                  <div className="flex items-center gap-1 mt-3">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">
                      {restaurant.rating}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 📄 Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border disabled:opacity-50"
            >
              Prev
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === i + 1
                    ? 'bg-[#513012] text-white'
                    : 'bg-white'
                }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}