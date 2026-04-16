// components/home/Hero.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Phone, MapPin } from 'lucide-react';

interface Restaurant {
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  openingHours: string;
}

interface HeroProps {
  restaurant: Restaurant;
}

export default function Hero({ restaurant }: HeroProps) {
  return (
    <div className="relative h-[90vh] flex items-center overflow-hidden">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/food11.jpg')",   // ← Change this if needed
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-[#513012]/85 via-[#47034E]/75 to-[#5D0565]/80" />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 pt-20 z-10">
        <div className="max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight mb-6">
            {restaurant.name}
          </h1>
          
          <p className="text-2xl text-orange-200 mb-4 font-light">
            {restaurant.tagline}
          </p>
          
          <p className="text-lg text-gray-100 mb-10 leading-relaxed max-w-lg">
            {restaurant.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg"
              className="bg-white text-[#513012] hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-semibold shadow-lg transition-all"
            >
              View Full Menu
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-black hover:bg-white hover:text-[#513012] text-lg px-8 py-6 rounded-xl font-semibold transition-all"
            >
              Reserve a Table
            </Button>
          </div>

          {/* Quick Info */}
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm text-gray-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {restaurant.address}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              {restaurant.phone}
            </div>
            <div className="flex items-center gap-2">
              ⭐ {restaurant.rating} ({restaurant.reviewCount}+ reviews)
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 text-center">
        <p className="text-sm text-white/90">Open Now</p>
        <p className="text-white font-medium">{restaurant.openingHours}</p>
      </div>

    
    </div>
  );
}