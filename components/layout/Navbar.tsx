'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import SearchAndFilterBar from '@/components/SearchCityModal';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [locationBanner, setLocationBanner] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isSearchMobile, setIsSearchMobile] = useState(false);

  const closeMenu = () => setIsOpen(false);

  // Fetch available cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/restaurant/?status=true&page_size=200`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        const cities = [...new Set(data.results?.map((r: any) => r.city).filter(Boolean))] as string[];
        setAvailableCities(cities.sort());
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      }
    };
    fetchCities();
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
          
          {/* Desktop Navbar */}
          <div className="hidden md:block">
            <div className="h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center flex-shrink-0">
                <div className="relative h-12 w-32">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    fill
                    sizes="128px"
                    className="object-contain"
                  />
                </div>
              </Link>

              {/* Desktop Menu Links */}
              <div className="flex items-center gap-8 text-base font-medium text-white">
                <Link href="/" className="hover:text-[#5D0565] transition">Home</Link>
                <Link href="/about" className="hover:text-[#5D0565] transition">About Us</Link>
                <Link href="/restaurants" className="hover:text-[#5D0565] transition">Restaurants</Link>
                <Link href="/contact" className="hover:text-[#5D0565] transition">Contact</Link>
              </div>

              <Link
                href="/register-restaurant"
                className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition text-white text-sm font-medium flex-shrink-0"
              >
                List Your Restaurant
              </Link>
            </div>

            <div className="py-4 border-t border-white/10">
              <div className="max-w-4xl mx-auto">
                <SearchAndFilterBar
                  search={search}
                  onSearchChange={setSearch}
                  selectedCity={selectedCity}
                  onCityChange={setSelectedCity}
                  onClear={() => setSelectedCity('')}
                  availableCities={availableCities}
                  locationBanner={locationBanner}
                  onLocationBannerChange={setLocationBanner}
                />
              </div>
            </div>
          </div>

          {/* Mobile Navbar */}
          <div className="md:hidden h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="relative h-10 w-24">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchMobile(!isSearchMobile)}
                className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white text-2xl leading-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Below Nav */}
          <AnimatePresence>
            {isSearchMobile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="md:hidden border-t border-white/10 px-4 py-4 bg-black/60"
              >
                <SearchAndFilterBar
                  search={search}
                  onSearchChange={setSearch}
                  selectedCity={selectedCity}
                  onCityChange={setSelectedCity}
                  onClear={() => setSelectedCity('')}
                  availableCities={availableCities}
                  locationBanner={locationBanner}
                  onLocationBannerChange={setLocationBanner}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-6"
              >
                <div className="flex flex-col gap-5 text-white text-base">
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="hover:text-[#5D0565] transition font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    href="/about"
                    onClick={closeMenu}
                    className="hover:text-[#5D0565] transition font-medium"
                  >
                    About Us
                  </Link>
                  <Link
                    href="/restaurants"
                    onClick={closeMenu}
                    className="hover:text-[#5D0565] transition font-medium"
                  >
                    Restaurants
                  </Link>
                  <Link
                    href="/contact"
                    onClick={closeMenu}
                    className="hover:text-[#5D0565] transition font-medium"
                  >
                    Contact
                  </Link>

                  <div className="pt-4 border-t border-white/10">
                    <Link
                      href="/register-restaurant"
                      onClick={closeMenu}
                      className="block w-full text-center px-5 py-3 rounded-full text-white font-medium 
                      bg-gradient-to-r from-[#513012] via-[#47034E] to-[#5D0565] hover:opacity-90 transition"
                    >
                      List Your Restaurant
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <Link
                      href="/restaurants"
                      onClick={closeMenu}
                      className="block w-full text-center px-5 py-3 rounded-full text-white font-medium 
                      border border-white/20 hover:bg-white/10 transition"
                    >
                      Explore Restaurants
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </nav>
    </>
  );
}