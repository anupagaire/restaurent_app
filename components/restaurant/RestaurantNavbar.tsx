
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function RestaurantNavbar({
  restaurant,
  slug,
}: {
  restaurant: any;
  slug: string;
}) {
  const [open, setOpen] = useState(false);
  const base = `/restaurants/${slug}`;

  const logo = restaurant.photos?.[0]?.photo_url;

  const links = [
    { href: base,             label: 'Home' },
    { href: `${base}/menu`,   label: 'Menu' },
    { href: `${base}/reviews`,label: 'Reviews' },
    // {href: `/menusearch`,   label: 'Search Menu' },

    {href: `/register-restaurant`,   label: 'List Your Venue' },
    {href: `/login`,   label: 'Login' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo + Name */}
        <Link href={base} className="flex items-center gap-3">
          {logo ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
              <Image src={logo} alt={restaurant.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#513012] flex items-center justify-center text-white font-bold text-lg">
              {restaurant.name?.[0]}
            </div>
          )}
          <span className="font-bold text-[#513012] text-lg hidden sm:block">
            {restaurant.name}
          </span>
        </Link>

        {/* Desktop links */}
        {/* Desktop links */}
<div className="hidden md:flex items-center gap-4">
  
  {/* Normal nav links */}
  <Link
    href={base}
    className="text-sm font-medium text-gray-600 hover:text-[#513012] transition-colors"
  >
    Home
  </Link>

  <Link
    href={`${base}/menu`}
    className="text-sm font-medium text-gray-600 hover:text-[#513012] transition-colors"
  >
    Menu
  </Link>

  <Link
    href={`${base}/reviews`}
    className="text-sm font-medium text-gray-600 hover:text-[#513012] transition-colors"
  >
    Reviews
  </Link>

  {/* CTA Buttons */}
  <div className="flex items-center gap-3 ml-2">
    
    <Link
      href="/register-restaurant"
      className="px-4 py-2 rounded-full border border-[#513012] text-[#513012] text-sm font-semibold hover:bg-[#513012] hover:text-white transition-all"
    >
      List Your Venue
    </Link>

    <Link
      href="/login"
      className="px-4 py-2 rounded-full bg-[#513012] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
    >
      Login
    </Link>

  </div>
</div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(p => !p)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-[#513012]"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}