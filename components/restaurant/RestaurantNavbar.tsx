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
    { href: `${base}/gallery`,label: 'Gallery' },
    { href: `${base}/about-us`,label: 'About Us' },
    { href: `${base}/services`,label: 'Services' },
    { href: `/register-restaurant`,   label: 'List Your Venue' },
    { href: `/login`,   label: 'Login' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-primary/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo + Name */}
        <Link href={base} className="flex items-center gap-3">
          {logo ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
              <Image src={logo} alt={restaurant.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-accent font-bold text-lg">
              {restaurant.name?.[0]}
            </div>
          )}
          <span className="font-bold text-secondary text-lg hidden sm:block">
            {restaurant.name}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
                    <Link
            href={base}
            className="text-base font-bold text-secondary/70 hover:text-primary transition-colors"
          >
            Home
          </Link>

          <Link
            href={`${base}/menu`}
            className="text-base font-bold text-secondary/70 hover:text-primary transition-colors"
          >
            Menu
          </Link>

          <Link
            href={`${base}/reviews`}
            className="text-base font-bold text-secondary/70 hover:text-primary transition-colors"
          >
            Reviews
          </Link>

          <Link
            href={`${base}/about-us`}
            className="text-base font-bold text-secondary/70 hover:text-primary transition-colors"
          >
            About Us
          </Link>

          <Link
            href={`${base}/services`}
            className="text-base font-bold text-secondary/70 hover:text-primary transition-colors"
          >
            Services
          </Link>

          <Link
            href={`${base}/gallery`}
            className="text-base font-bold text-secondary/70 hover:text-primary transition-colors"
          >
            Gallery
          </Link>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 ml-2">
            
            <Link
              href="/register-restaurant"
              className="px-4 py-2 rounded-full border-2 border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-accent transition-all"
            >
              List Your Venue
            </Link>

            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-secondary transition-all shadow-sm"
            >
              Login
            </Link>

          </div>
        </div>

        {/* Mobile hamburger */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors" 
          onClick={() => setOpen(p => !p)}
        >
          {open ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-primary/10 px-4 py-3 space-y-2">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-primary hover:text-primary hover:bg-accent/20 px-3 rounded-lg transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}