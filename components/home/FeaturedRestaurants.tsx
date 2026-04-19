'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { restaurants } from '@/data/mockData';
import { motion } from 'framer-motion';

export default function FeaturedRestaurants() {
  return (
    <section className="py-16 bg-gray-50 ">
      <div className="max-w-7xl mx-auto px-6  mb-12 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center items-end mb-10"
        >
          <div>


          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
                      className="text-4xl md:text-5xl font-serif text-[#5D0565]"
          >
              Featured Restaurants
          </motion.h2>
          </div>
        </motion.div>

        <div className="overflow-x-auto pb-4 scrollbar-hide scroll-smooth">

          <motion.div
            className="grid grid-flow-col grid-rows-2 gap-6 w-max"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            {restaurants.map((restaurant) => (
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
                  className="w-[280px] block group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Rating */}
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-2xl text-sm font-medium flex items-center gap-1 shadow">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {restaurant.rating}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[#513012] mb-1">
                      {restaurant.name}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {restaurant.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        📍 {restaurant.address}
                      </span>

                     <Link
  href={`/restaurants/${restaurant.slug}`}
  className="bg-[#513012] text-white text-xs px-4 py-1 rounded-full hover:bg-[#3f260f]"
>
  View Menu
</Link>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
           <div className="flex justify-center mt-6">
  <Link
    href="/restaurants"
    className="text-white bg-[#513012] rounded-3xl py-2 px-5 hover:underline font-medium"
  >
    View All →
  </Link>
</div>
        </div>
      </div>
    </section>
  );
}