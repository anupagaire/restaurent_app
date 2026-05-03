'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import Image from "next/image";
interface MenuItem {
  id: string | number;
  name: string;
  description: string;
  price: number;
  image: string | null; 
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

// ✅ Food emoji placeholders by category name (fallback when no image)
function getCategoryEmoji(category?: string): string {
  const map: Record<string, string> = {
    pizza: '🍕', burger: '🍔', drink: '🥤', drinks: '🥤', coffee: '☕',
    dessert: '🍰', desserts: '🍰', soup: '🍜', salad: '🥗', starter: '🥗',
    starters: '🥗', sas: '🍽️', food: '🍛', noodle: '🍜', noodles: '🍜',
    rice: '🍚', chicken: '🍗', fish: '🐟', sushi: '🍣', sandwich: '🥪',
  };
  const key = (category ?? '').toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (key.includes(k)) return v;
  }
  return '🍽️';
}

function MenuCard({ item }: { item: MenuItem }) {
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !item.image || imgError;

  return (
    <motion.div
      variants={cardVariant}
      layout
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#513012]/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#fdf6ec] to-[#e8ddd0] flex items-center justify-center">
        {showPlaceholder ? (
          <span style={{ fontSize: 56 }}>{getCategoryEmoji(item.category)}</span>
        ) : (
<Image
  src={item.image!}
  alt={item.name}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  onError={() => setImgError(true)}
  className="object-cover group-hover:scale-105 transition-transform duration-500"
/>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-[15px] leading-tight text-gray-900 line-clamp-2">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-xs text-gray-500 mt-3 line-clamp-3 flex-1">
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-bold text-xl text-[#513012]">
            Rs. {item.price}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function MenuSection({ menuItems }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(i => i.category ?? 'Other')));
    return ['All', ...cats];
  }, [menuItems]);

  const filtered = useMemo(() => {
    return menuItems.filter((item) =>
      activeCategory === 'All' ? true : (item.category ?? 'Other') === activeCategory
    );
  }, [menuItems, activeCategory]);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

        {/* Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="bg-white rounded-3xl border p-6 sticky top-24">
            <h3 className="font-bold text-[#513012] mb-4 text-lg">Filters</h3>
            <div className="space-y-2 mb-8">
              <button
                onClick={() => setActiveCategory('All')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeCategory === 'All' ? 'bg-[#513012] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <UtensilsCrossed size={18} /> All
              </button>
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

        <main className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-6">{filtered.length} items found</p>
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