"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="relative h-[90vh] flex items-center overflow-hidden">
      
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: "url('/food11.jpg')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-[#47034E]/70 to-black/80" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 z-10 w-full">
        
        <div className="max-w-2xl text-left">

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Discover. Shop. Enjoy.
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 mb-10"
          >
            Explore thousands of products from multiple stores in one place.
            Find the best deals, trending items, and everything you need ,
            all in a single platform.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg rounded-xl font-semibold"
            >
              Browse Products
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white  hover:bg-white hover:text-gray-700 px-8 py-6 text-lg rounded-xl font-semibold"
            >
              Explore Restaurant
            </Button>
          </motion.div>

        </div>
      </div>

      <motion.div
        className="absolute bottom-10 right-10 hidden md:block w-32 h-32 bg-white/10 rounded-full blur-2xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
}