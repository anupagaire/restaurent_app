'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isSearchDesktop, setIsSearchDesktop] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setIsOpen(false);

  // Close desktop search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchDesktop(false);
      }
    };
    if (isSearchDesktop) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isSearchDesktop]);

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

          {/* ─── DESKTOP NAVBAR ─── everything in one row */}
          <div className="hidden md:flex h-16 items-center justify-between gap-8">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="relative h-10 w-28">
                <Image src="/logo.png" alt="Logo" fill sizes="112px" className="object-contain" />
              </div>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-6 text-sm font-medium text-white">
              <Link href="/" className="hover:text-[#c45cd1] transition-colors whitespace-nowrap">Home</Link>
              <Link href="/about" className="hover:text-[#c45cd1] transition-colors whitespace-nowrap">About Us</Link>
              <Link href="/restaurants" className="hover:text-[#c45cd1] transition-colors whitespace-nowrap">Restaurants</Link>
              <Link href="/contact" className="hover:text-[#c45cd1] transition-colors whitespace-nowrap">Contact</Link>
            </div>

            {/* Right side: Search icon button + CTA */}
            <div className="flex items-center gap-3 flex-shrink-0">

              {/* Search icon → dropdown panel */}
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => setIsSearchDesktop(!isSearchDesktop)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition text-sm font-medium
                    ${isSearchDesktop
                      ? 'bg-white/15 border-white/40 text-white'
                      : 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Search size={15} />
                  <span>Search</span>
                </button>

                <AnimatePresence>
                  {isSearchDesktop && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-[calc(100%+10px)] w-[480px] bg-black/90 backdrop-blur-xl
                        border border-white/15 rounded-2xl p-4 shadow-2xl"
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
              </div>

              {/* CTA */}
              <Link
                href="/register-restaurant"
                className="whitespace-nowrap px-5 py-2 rounded-full border border-white/20
                  hover:bg-white/10 transition text-white text-sm font-medium"
              >
                List Your Restaurant
              </Link>
            </div>
          </div>

          {/* ─── MOBILE NAVBAR ─── */}
          <div className="md:hidden h-16 flex items-center justify-between">
            <Link href="/" className="flex-shrink-0">
              <div className="relative h-10 w-24">
                <Image src="/logo.png" alt="Logo" fill sizes="96px" className="object-contain" />
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsSearchMobile(!isSearchMobile);
                  if (isOpen) setIsOpen(false);
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <button
                onClick={() => {
                  setIsOpen(!isOpen);
                  if (isSearchMobile) setIsSearchMobile(false);
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition"
                aria-label="Menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* ─── MOBILE SEARCH BAR ─── */}
          <AnimatePresence>
            {isSearchMobile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="md:hidden overflow-hidden border-t border-white/10 px-4 py-4 bg-black/60"
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

          {/* ─── MOBILE MENU ─── */}
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
                  <Link href="/" onClick={closeMenu} className="hover:text-[#c45cd1] transition font-medium">Home</Link>
                  <Link href="/about" onClick={closeMenu} className="hover:text-[#c45cd1] transition font-medium">About Us</Link>
                  <Link href="/restaurants" onClick={closeMenu} className="hover:text-[#c45cd1] transition font-medium">Restaurants</Link>
                  <Link href="/contact" onClick={closeMenu} className="hover:text-[#c45cd1] transition font-medium">Contact</Link>

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

                  <div className="pt-2">
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