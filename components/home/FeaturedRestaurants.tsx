'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { restaurants } from '@/data/mockData';
import { motion } from 'framer-motion';

export default function FeaturedRestaurants() {
  // Sort by rating descending, take top 10
  const topRestaurants = [...restaurants]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#5D0565] text-center mb-10"
        >
          Featured Restaurants
        </motion.h2>

        {/* Responsive Grid — NO scroll */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            show: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {topRestaurants.map((restaurant) => (
            <motion.div
              key={restaurant.id}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href={`/restaurants/${restaurant.slug}`}
                className="block group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-36 sm:h-44">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-2xl text-xs font-medium flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {restaurant.rating}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-semibold text-[#513012] mb-1 truncate">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                    {restaurant.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs truncate max-w-[100px]">
                      📍 {restaurant.address}
                    </span>
                    <span className="bg-[#513012] text-white text-xs px-2 py-1 rounded-full">
                      View Menu
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <Link
            href="/restaurants"
            className="text-white bg-[#513012] rounded-3xl py-2 px-8 hover:opacity-90 transition font-medium"
          >
            View All →
          </Link>
        </div>

      </div>
    </section>
  );
}