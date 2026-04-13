'use client';  

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { menuCategories, menuItems } from '@/data/mockData';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen text-black pt-20">
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <h1 
            className="text-6xl font-bold text-center mb-4" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Our Menu
          </h1>
          <p className="text-center text-white/70 text-xl mb-12">
            Crafted with love • Served with pride
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-8 py-3 rounded-3xl font-medium transition-all ${
                activeCategory === 'All' 
                  ? 'bg-amber-500 text-black shadow-lg' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
              }`}
            >
              All
            </button>

            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-8 py-3 rounded-3xl font-medium flex items-center gap-2 transition-all ${
                  activeCategory === cat.name 
                    ? 'bg-amber-500 text-black shadow-lg' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                <span>{cat.icon}</span> 
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

    </>
  );
}