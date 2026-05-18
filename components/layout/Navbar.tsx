'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import SearchModal from '@/components/SearchCityModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 h-16 md:h-20 flex items-center">

          <div className="flex items-center justify-between w-full">

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-12 w-28 md:h-16 md:w-40">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  sizes="(max-width: 768px) 112px, 160px"
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 text-base lg:text-lg font-medium text-white">
              <Link href="/" className="hover:text-[#5D0565] transition">Home</Link>
              <Link href="/about" className="hover:text-[#5D0565] transition">About Us</Link>
              <Link href="/restaurants" className="hover:text-[#5D0565] transition">Restaurants</Link>
              <Link href="/contact" className="hover:text-[#5D0565] transition">Contact</Link>
              <Link
                href="/register-restaurant"
                className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition text-white"
              >
                List Your Restaurant
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">

              {/* Search icon button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <Link
                href="/restaurants"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium 
                bg-gradient-to-r from-[#513012] via-[#47034E] to-[#5D0565]
                hover:opacity-90 transition"
              >
                Explore
              </Link>

              {/* Mobile button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-white text-3xl leading-none"
              >
                {isOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="absolute top-16 left-0 w-full md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 px-6 py-6"
              >
                <div className="flex flex-col gap-5 text-white text-lg">
                  {/* Mobile search bar */}
                  <button
                    onClick={() => { closeMenu(); setSearchOpen(true); }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/10 text-white/60 text-sm text-left"
                  >
                    <Search size={15} />
                    Search restaurants...
                  </button>

                  <Link href="/" onClick={closeMenu} className="hover:text-[#5D0565]">Home</Link>
                  <Link href="/about" onClick={closeMenu} className="hover:text-[#5D0565]">About Us</Link>
                  <Link href="/restaurants" onClick={closeMenu} className="hover:text-[#5D0565]">Restaurants</Link>
                  <Link href="/contact" onClick={closeMenu} className="hover:text-[#5D0565]">Contact</Link>

                  <Link
                    href="/restaurants"
                    onClick={closeMenu}
                    className="mt-4 text-center px-5 py-3 rounded-full text-white font-medium 
                    bg-gradient-to-r from-[#513012] via-[#47034E] to-[#5D0565]"
                  >
                    Explore Restaurants
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </nav>

      {/* Search Modal — rendered outside nav so it overlays everything */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}