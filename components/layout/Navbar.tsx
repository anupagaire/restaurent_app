'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMobile, setIsSearchMobile] = useState(false);
  const [isSearchDesktop, setIsSearchDesktop] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeMenu = () => setIsOpen(false);

  // Close desktop search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchDesktop(false);
        setSuggestions([]);
      }
    };
    if (isSearchDesktop) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isSearchDesktop]);

  // Focus input when search opens
  useEffect(() => {
    if ((isSearchDesktop || isSearchMobile) && inputRef.current) {
      // Delay slightly so AnimatePresence can mount the element first
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isSearchDesktop, isSearchMobile]);

  // Debounced suggestions fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/restaurant/?status=true&search=${encodeURIComponent(searchQuery)}&page_size=6`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        const names: string[] = (data.results ?? []).map((r: { name: string }) => r.name);
        setSuggestions(names);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const handleSearch = (query?: string) => {
    const q = (query ?? searchQuery).trim();
    if (!q) return;
    setIsSearchDesktop(false);
    setIsSearchMobile(false);
    setSuggestions([]);
    setSearchQuery('');
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Shared search UI — used in both desktop dropdown and mobile bar
  const renderSearchBox = (dark = false) => (
    <div className={`relative flex items-center gap-2 rounded-xl px-3 py-2 ${dark ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200'}`}>
      <Search size={15} className={dark ? 'text-white/60' : 'text-gray-400'} />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search restaurants, cities..."
        autoComplete="off"
        className={`flex-1 bg-transparent text-sm outline-none placeholder:text-opacity-50 ${dark ? 'text-white placeholder:text-white/40' : 'text-gray-800 placeholder:text-gray-400'}`}
      />
      {searchQuery && (
        <button
          onClick={() => { setSearchQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
          className={`text-xs ${dark ? 'text-white/40 hover:text-white/70' : 'text-gray-300 hover:text-gray-500'}`}
        >
          <X size={14} />
        </button>
      )}
      <button
        onClick={() => handleSearch()}
        disabled={!searchQuery.trim()}
        className="px-3 py-1 rounded-lg text-xs font-medium bg-[#513012] text-white hover:bg-[#3d2209] disabled:opacity-40 transition-colors"
      >
        Go
      </button>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {(suggestions.length > 0 || loadingSuggestions) && searchQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {loadingSuggestions ? (
              <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                <span className="animate-spin inline-block w-3 h-3 border border-gray-300 border-t-[#513012] rounded-full" />
                Searching...
              </div>
            ) : (
              suggestions.map((name, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(name)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-[#513012] flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0"
                >
                  <Search size={12} className="text-gray-300 flex-shrink-0" />
                  {name}
                </button>
              ))
            )}
            <button
              onClick={() => handleSearch()}
              className="w-full text-left px-4 py-2.5 text-xs text-[#513012] font-medium hover:bg-amber-50 border-t border-gray-100 flex items-center gap-1"
            >
              <Search size={11} />
              Search all results for &ldquo;{searchQuery}&rdquo;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">

          {/* ─── DESKTOP NAVBAR ─── */}
          <div className="hidden md:flex h-16 items-center justify-between gap-8">

            <Link href="/" >
              <div className="relative h-30 w-28">
                <Image src="/logo.png" alt="Logo" fill sizes="112px" className="object-contain" />
              </div>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-6 text-lg font-medium text-white">
              <Link href="/" className="hover:text-[#c45cd1] transition-colors whitespace-nowrap">Home</Link>
              <Link href="/about" className="hover:text-[#c45cd1] transition-colors whitespace-nowrap">About Us</Link>
              <Link href="/restaurants" className="hover:text-[#c45cd1] transition-colors whitespace-nowrap">Restaurants</Link>
              <Link href="/pricing" className="hover:text-[#c45cd1] transition-colors whitespace-nowrap">Pricing</Link>
              <Link href="/contact" className="hover:text-[#c45cd1] transition-colors whitespace-nowrap">Contact</Link>
            </div>

            {/* Right side: Search + CTA */}
            <div className="flex items-center gap-3 flex-shrink-0">

              {/* Search toggle */}
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => { setIsSearchDesktop(!isSearchDesktop); setSearchQuery(''); setSuggestions([]); }}
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
                      className="absolute right-0 top-[calc(100%+10px)] w-[420px] bg-black/90 backdrop-blur-xl
                        border border-white/15 rounded-2xl p-4 shadow-2xl"
                    >
                      <p className="text-xs text-white/40 mb-2 font-medium tracking-wide uppercase">Search restaurants</p>
                      {renderSearchBox(true)}
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

          <div className="md:hidden h-16 flex items-center justify-between">
            <Link href="/" className="flex-shrink-0">
              <div className="relative h-10 w-24">
                <Image src="/logo.png" alt="Logo" fill sizes="96px" className="object-contain" />
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsSearchMobile(!isSearchMobile); if (isOpen) setIsOpen(false); setSearchQuery(''); setSuggestions([]); }}
                className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <button
                onClick={() => { setIsOpen(!isOpen); if (isSearchMobile) setIsSearchMobile(false); }}
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
                className="md:hidden overflow-visible border-t border-white/10 px-4 py-4 bg-black/60"
              >
                {renderSearchBox(true)}
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