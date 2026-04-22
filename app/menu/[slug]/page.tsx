'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

/* ─── Types ──────────────────────────────────────────────── */
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isVeg: boolean;
}

interface Restaurant {
  slug: string;
  name: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  coverImage?: string;
  tagline?: string;
}

/* ─── Mock data ─────────────────────────────────────────── */
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    slug: 'spice-garden',
    name: 'Spice Garden',
    tagline: 'Authentic flavours of the Subcontinent',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SG&backgroundColor=513012&textColor=ffffff',
    address: 'Thamel, Kathmandu',
    phone: '+977-9800000000',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop',
  },
  {
    slug: 'himalayan-kitchen',
    name: 'Himalayan Kitchen',
    tagline: 'Traditional tastes from the mountains',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=HK&backgroundColor=1a5276&textColor=ffffff',
    address: 'Patan, Lalitpur',
    phone: '+977-9811111111',
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=400&fit=crop',
  },
];

const MOCK_MENU: Record<string, MenuItem[]> = {
  'spice-garden': [
    { id: 1, name: 'Butter Chicken', description: 'Tender chicken in rich tomato-cream gravy', price: 420, category: 'Main Course', isAvailable: true, isVeg: false, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae784?w=200&h=200&fit=crop' },
    { id: 2, name: 'Paneer Butter Masala', description: 'Cottage cheese in silky tomato gravy', price: 380, category: 'Main Course', isAvailable: true, isVeg: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop' },
    { id: 3, name: 'Veg Biryani', description: 'Fragrant basmati with seasonal vegetables', price: 320, category: 'Rice & Biryani', isAvailable: true, isVeg: true },
    { id: 4, name: 'Chicken Biryani', description: 'Slow-cooked dum biryani with whole spices', price: 450, category: 'Rice & Biryani', isAvailable: true, isVeg: false },
    { id: 5, name: 'Garlic Naan', description: 'Soft leavened bread with garlic & butter', price: 80, category: 'Breads', isAvailable: true, isVeg: true },
    { id: 6, name: 'Tandoori Roti', description: 'Whole wheat bread from the clay oven', price: 50, category: 'Breads', isAvailable: true, isVeg: true },
    { id: 7, name: 'Mango Lassi', description: 'Chilled yogurt with Alphonso mango', price: 120, category: 'Beverages', isAvailable: true, isVeg: true },
    { id: 8, name: 'Masala Chai', description: 'Spiced milk tea, brewed strong', price: 60, category: 'Beverages', isAvailable: true, isVeg: true },
    { id: 9, name: 'Gulab Jamun', description: 'Soft milk dumplings in rose syrup', price: 140, category: 'Desserts', isAvailable: true, isVeg: true },
  ],
  'himalayan-kitchen': [
    { id: 1, name: 'Dal Bhat', description: 'Traditional lentil soup with steamed rice', price: 250, category: 'Main Course', isAvailable: true, isVeg: true },
    { id: 2, name: 'Momo', description: 'Steamed dumplings with tomato achar', price: 180, category: 'Appetizers', isAvailable: true, isVeg: false },
    { id: 3, name: 'Thukpa', description: 'Tibetan noodle soup with vegetables', price: 220, category: 'Soups', isAvailable: true, isVeg: true },
  ],
};

function getRestaurant(slug: string): Restaurant | null {
  return MOCK_RESTAURANTS.find((r) => r.slug === slug) ?? null;
}
function getMenu(slug: string): MenuItem[] {
  return (MOCK_MENU[slug] ?? []).filter((i) => i.isAvailable);
}
function groupByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
  return items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

/* ─── Ornamental divider ─────────────────────────────────── */
function OrnamentDivider() {
  return (
    <div className="flex items-center justify-center gap-2 my-1">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #b8936a)' }} />
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
        <path d="M10 6 L6 2 L2 6 L6 10 Z" fill="#b8936a" opacity="0.7" />
        <path d="M10 6 L14 2 L18 6 L14 10 Z" fill="#b8936a" opacity="0.7" />
        <circle cx="10" cy="6" r="1.5" fill="#b8936a" />
      </svg>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #b8936a)' }} />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const restaurant = getRestaurant(slug);
  const menuItems = getMenu(slug);
  const grouped = groupByCategory(menuItems);
  const categories = Object.keys(grouped);

  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? '');
  const [filter, setFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (!restaurant) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');`}</style>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6"
          style={{ background: '#fdf6ec', fontFamily: "'Lato', sans-serif" }}>
          <div className="text-5xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#513012', fontFamily: "'Playfair Display', serif" }}>Menu Not Found</h1>
          <p className="text-sm" style={{ color: '#a0856b' }}>This restaurant doesn't exist or the link may be incorrect.</p>
        </div>
      </>
    );
  }

  const filteredGrouped = Object.fromEntries(
    Object.entries(grouped)
      .map(([cat, items]) => [cat, items.filter((i) => {
        if (filter === 'veg') return i.isVeg;
        if (filter === 'nonveg') return !i.isVeg;
        return true;
      })])
      .filter(([, items]) => (items as MenuItem[]).length > 0)
  );
  const visibleCategories = Object.keys(filteredGrouped);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');

        .menu-serif { font-family: 'Playfair Display', Georgia, serif; }
        .menu-sans  { font-family: 'Lato', sans-serif; }

        .paper-bg {
          background-color: #fdf6ec;
          background-image:
            radial-gradient(ellipse at 20% 0%, rgba(184,147,106,0.10) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 100%, rgba(81,48,18,0.07) 0%, transparent 55%);
          min-height: 100vh;
        }

        .menu-card {
          background: #fffdf8;
          border: 1px solid rgba(184,147,106,0.18);
          box-shadow: 0 2px 16px rgba(81,48,18,0.07), inset 0 0 0 1px rgba(255,255,255,0.7);
        }

        .item-row {
          border-bottom: 1px dashed rgba(184,147,106,0.28);
        }
        .item-row:last-child { border-bottom: none; }

        .cat-pill {
          font-family: 'Lato', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 999px;
          padding: 5px 14px;
          border: 1px solid #d4b896;
          color: #8a6040;
          background: transparent;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .cat-pill.active {
          background: #513012;
          color: #fdf6ec;
          border-color: #513012;
        }

        .fade-up {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .fade-up.show { opacity: 1; transform: translateY(0); }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="paper-bg menu-sans">

        {/* ══ HERO HEADER ══ */}
        <div className={`relative fade-up ${visible ? 'show' : ''}`}>

          {/* Cover photo */}
          {restaurant.coverImage && (
            <div className="relative w-full overflow-hidden" style={{ height: 200 }}>
              <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" priority />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to bottom, rgba(20,10,2,0.25) 0%, rgba(253,246,236,1) 100%)'
              }} />
            </div>
          )}

          {/* Identity block */}
          <div className={`text-center px-5 ${restaurant.coverImage ? '-mt-10 relative z-10' : 'pt-12'} pb-4`}>

            {/* Logo circle with gold ring */}
            <div className="inline-flex items-center justify-center mb-3">
              <div className="rounded-full p-0.5" style={{ background: 'linear-gradient(135deg, #b8936a, #f0d4a8, #b8936a)' }}>
                <div className="rounded-full overflow-hidden w-20 h-20 bg-white">
                  {restaurant.logoUrl
                    ? <img src={restaurant.logoUrl} alt="logo" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                        style={{ background: '#513012', fontFamily: "'Playfair Display', serif" }}>
                        {restaurant.name[0]}
                      </div>
                  }
                </div>
              </div>
            </div>

            {/* Name */}
            <h1 className="menu-serif font-bold" style={{ fontSize: 30, color: '#1e0f02', lineHeight: 1.2 }}>
              {restaurant.name}
            </h1>

            {/* Italic tagline */}
            {restaurant.tagline && (
              <p className="menu-serif italic mt-1" style={{ fontSize: 13, color: '#8a6040' }}>
                {restaurant.tagline}
              </p>
            )}

            <div className="mt-3 mb-2"><OrnamentDivider /></div>

            {/* Address + phone */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {restaurant.address && (
                <span style={{ fontSize: 11, color: '#9a7458', letterSpacing: '0.05em' }}>📍 {restaurant.address}</span>
              )}
              {restaurant.phone && (
                <span style={{ fontSize: 11, color: '#9a7458', letterSpacing: '0.05em' }}>📞 {restaurant.phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* ══ FILTER PILLS ══ */}
        <div className={`px-4 mt-3 fade-up ${visible ? 'show' : ''}`} style={{ transitionDelay: '100ms' }}>
          <div className="flex gap-2 justify-center flex-wrap">
            {(['all', 'veg', 'nonveg'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className="cat-pill" style={{
                background: filter === f ? '#513012' : 'transparent',
                color: filter === f ? '#fdf6ec' : '#8a6040',
                borderColor: filter === f ? '#513012' : '#d4b896',
              }}>
                {f === 'all' ? 'All Items' : f === 'veg' ? '🟢 Veg Only' : '🔴 Non-Veg'}
              </button>
            ))}
          </div>
        </div>

        {/* ══ STICKY CATEGORY NAV ══ */}
        <div className="sticky top-0 z-20 mt-4" style={{
          background: 'rgba(253,246,236,0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(184,147,106,0.2)',
          boxShadow: '0 2px 12px rgba(81,48,18,0.07)',
        }}>
          <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-3 max-w-2xl mx-auto">
            {visibleCategories.map((cat) => (
              <button key={cat} className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                style={{
                  background: activeCategory === cat ? '#513012' : 'transparent',
                  color: activeCategory === cat ? '#fdf6ec' : '#8a6040',
                  borderColor: activeCategory === cat ? '#513012' : '#d4b896',
                }}
                onClick={() => {
                  setActiveCategory(cat);
                  document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ══ MENU SECTIONS ══ */}
        <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto space-y-12">

          {visibleCategories.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">🥗</div>
              <p className="menu-serif italic text-lg" style={{ color: '#b8936a' }}>No items match this filter.</p>
            </div>
          ) : visibleCategories.map((category, catIdx) => (
            <div
              key={category}
              id={`cat-${category}`}
              className={`scroll-mt-20 fade-up ${visible ? 'show' : ''}`}
              style={{ transitionDelay: `${160 + catIdx * 70}ms` }}
            >
              {/* Category heading — printed menu style */}
              <div className="text-center mb-6">
                <OrnamentDivider />
                <h2 className="menu-serif font-bold tracking-wide mt-3 mb-1"
                  style={{ fontSize: 22, color: '#1e0f02' }}>
                  {category}
                </h2>
                <OrnamentDivider />
              </div>

              {/* Items */}
              <div className="menu-card rounded-2xl overflow-hidden px-5 py-1">
                {(filteredGrouped[category] as MenuItem[]).map((item) => (
                  <div key={item.id} className="item-row py-4 flex items-start gap-3">

                    {/* FSSAI veg/non-veg square dot */}
                    <div className="mt-1.5 shrink-0">
                      <div className="w-4 h-4 rounded-sm border-2 flex items-center justify-center"
                        style={{ borderColor: item.isVeg ? '#16a34a' : '#dc2626' }}>
                        <div className="w-2 h-2 rounded-full"
                          style={{ background: item.isVeg ? '#16a34a' : '#dc2626' }} />
                      </div>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      {/* Name ········· Price  (dotted leader line) */}
                      <div className="flex items-baseline gap-1">
                        <span className="menu-serif font-semibold shrink-0" style={{ fontSize: 15, color: '#1e0f02' }}>
                          {item.name}
                        </span>
                        <span className="flex-1 mx-1" style={{
                          borderBottom: '1px dotted rgba(184,147,106,0.45)',
                          minWidth: 12,
                          marginBottom: 3,
                        }} />
                        <span className="menu-sans font-bold shrink-0" style={{ fontSize: 14, color: '#513012' }}>
                          Rs.{item.price}
                        </span>
                      </div>
                      {/* Description */}
                      {item.description && (
                        <p className="menu-serif italic mt-0.5 leading-relaxed" style={{ fontSize: 12, color: '#9a7458' }}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Thumbnail */}
                    {item.image && (
                      <div className="relative shrink-0 rounded-xl overflow-hidden"
                        style={{ width: 56, height: 56, border: '1.5px solid rgba(184,147,106,0.25)' }}>
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="text-center pt-6 pb-12 space-y-3">
            <OrnamentDivider />
            <p className="menu-sans uppercase tracking-widest text-xl font-bold text-[#c9a87a]" >
              {restaurant.name}{restaurant.address && ` · ${restaurant.address}`}
            </p>
            <OrnamentDivider />
          </div>

        </div>
      </div>
    </>
  );
}