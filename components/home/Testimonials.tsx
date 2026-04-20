"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Utensils } from "lucide-react";

const restaurants = [
  {
    id: 1,
    name: "Rajdoot Restaurant",
    text:
      "Authentic Indian, Western & Nepali cuisine served with love. Famous for butter chicken, momo and tandoori dishes. A perfect place for family dining and gatherings.",
    img: "/place/1.jpg",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Himalayan Spice House",
    text:
      "A cozy restaurant offering rich Nepali flavors with modern twists. Known for thali sets, momos, and traditional spices that bring Himalayan taste alive.",
    img: "/place/2.jpg",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Urban Curry Hub",
    text:
      "Modern Indian dining experience with fusion dishes. From creamy curries to street-style snacks, everything is crafted for a bold taste experience.",
    img: "/place/3.jpg",
    rating: 4.7,
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0 },
};

const Testimonials = () => {
  return (
    <section className="relative py-6 md:py-12 bg-white overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-12 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-[#5D0565]"
          >
            Testimonials
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#011659]/60 max-w-xl mx-auto"
          >
            Choose your favorite restaurant and enjoy delicious meals delivered fresh.
          </motion.p>
        </div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
        >
          {restaurants.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              className="flex flex-col relative rounded-[2rem] p-8 md:p-10 bg-[#faf7f2] border border-[#d4b78f]/30 shadow-lg hover:shadow-[0_20px_50px_rgba(212,183,143,0.15)] transition-all duration-300 h-full group"
            >
              {/* Icon */}
              <div className="absolute top-8 right-8 text-[#d4b78f]/20 group-hover:text-[#d4b78f]/30 transition-colors">
                <Utensils size={40} />
              </div>

              <div className="flex flex-col h-full space-y-6 relative z-10">

                {/* Image + Name */}
                <div className="flex items-center gap-4">
                  <div className="relative w-[60px] h-[60px]">
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      className="rounded-full object-cover border-2 border-[#d4b78f] shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div>
                    <h4 className="font-serif text-xl text-[#011659] leading-tight">
                      {item.name}
                    </h4>

                    <p className="text-[10px] text-green-600 uppercase tracking-[0.2em] font-bold mt-1">
                      Available to Order
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                  <span className="text-xs text-gray-500 ml-2">
                    {item.rating}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[#011659]/80 text-base leading-relaxed line-clamp-5 italic">
                  {item.text}
                </p>

               
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;