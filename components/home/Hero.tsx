'use client';

import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <div className="relative h-[90vh] flex items-center overflow-hidden">
      
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/food11.jpg')", 
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/70 to-black/80" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 z-10 text-center">
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Discover. Shop. Enjoy.
        </h1>

        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
          Explore thousands of products from multiple stores in one place. 
          Find the best deals, trending items, and everything you need — all in a single platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
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
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center">
        
      </div>
    </div>
  );
}