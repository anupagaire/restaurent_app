'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Drumstick, UtensilsCrossed } from 'lucide-react';

interface MenuItem {
  id: string | number;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  category?: string;
}

interface Props {
  menuItems: MenuItem[];
}

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.06 } },
};

function VegDot({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isVeg ? 'border-green-600' : 'border-red-600'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
    </span>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <motion.div
      variants={cardVariant}
      layout
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#513012]/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image 
          src={item.image} 
          alt={item.name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start gap-3">
          <VegDot isVeg={item.isVeg} />
          <h3 className="font-semibold text-[15px] leading-tight text-gray-900 line-clamp-2 flex-1">
            {item.name}
          </h3>
        </div>

        <p className="text-xs text-gray-500 mt-3 line-clamp-3 flex-1">
          {item.description}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-bold text-xl text-[#513012]">
            Rs. {item.price}
          </span>

          <span
            className={`text-xs px-4 py-1.5 rounded-full font-medium ${
              item.isVeg 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}
          >
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function MenuSection({ menuItems }: Props) {
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(i => i.category ?? 'Other')));
    return ['All', ...cats];
  }, [menuItems]);

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const dietOk = dietFilter === 'all' 
        ? true 
        : dietFilter === 'veg' ? item.isVeg : !item.isVeg;

      const catOk = activeCategory === 'All' 
        ? true 
        : (item.category ?? 'Other') === activeCategory;

      return dietOk && catOk;
    });
  }, [menuItems, dietFilter, activeCategory]);

  return (
    <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

        <aside className="hidden lg:block w-72 shrink-0">
          <div className="bg-white rounded-3xl border p-6 sticky top-24">
            <h3 className="font-bold text-[#513012] mb-4 text-lg">Filters</h3>
            
            <div className="space-y-2 mb-8">
              {[
                { key: 'all', label: 'All', icon: UtensilsCrossed },
                { key: 'veg', label: 'Veg', icon: Leaf },
                { key: 'nonveg', label: 'Non-Veg', icon: Drumstick },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setDietFilter(key as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    dietFilter === key ? 'bg-[#513012] text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} /> {label}
                </button>
              ))}
            </div>

            <h3 className="font-bold text-[#513012] mb-4 text-lg">Category</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    activeCategory === cat ? 'bg-[#5D0565] text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-6">
            {filtered.length} items found
          </p>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}