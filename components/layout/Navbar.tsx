'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { LogOut } from "lucide-react";
interface NavLink { name: string; url: string; }
interface NavButton { text: string; url: string; }
interface SiteLogo { image: string; alt: string; }
interface NavbarProps {
  logo?: SiteLogo;
  links?: NavLink[];
  loginBtn?: NavButton;
  registerBtn?: NavButton;
  darkBg?: boolean;
}

const DEFAULT_LINKS: NavLink[] = [
  { name: 'Home', url: '/' },
  { name: 'About Us', url: '/about' },
  { name: 'Venues', url: '/restaurants' },
  { name: 'Pricing', url: '/pricing' },
  { name: 'Contact', url: '/contact' },
];

export default function Navbar({ logo, links, loginBtn, registerBtn, darkBg = false}: NavbarProps) {
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
  const { currentUser, isAuthenticated, logout } = useAuth();
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
  };

  window.addEventListener('scroll', handleScroll);

  return () => window.removeEventListener('scroll', handleScroll);
}, []);
  // Use props or fallback
const resolvedLogo = {
  image: logo?.image?.trim() || '/logo.png',
  alt: logo?.alt || 'Logo',
};
  const resolvedLinks = links ?? DEFAULT_LINKS;
  const resolvedLoginBtn = loginBtn ?? { text: 'Login', url: '/login' };
  const resolvedRegisterBtn = registerBtn ?? { text: 'List Your Venue', url: '/register-restaurant' };

  const closeMenu = () => setIsOpen(false);

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

  useEffect(() => {
    if ((isSearchDesktop || isSearchMobile) && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isSearchDesktop, isSearchMobile]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/restaurant/?status=true&search=${encodeURIComponent(searchQuery)}&page_size=6`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions((data.results ?? []).map((r: { name: string }) => r.name));
      } catch { setSuggestions([]); }
      finally { setLoadingSuggestions(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);
const handleProfileClick = () => {
  const role = currentUser?.role?.toLowerCase();

  if (role === "super_admin") {
    router.push("/super-admin");
  } else if (role === "customer") {
    router.push("/customer");
  } else {
    router.push("/restaurant-admin");
  }
};
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

  const renderSearchBox = (dark = false) => (
    <div className={`relative flex items-center gap-2 rounded-xl px-3 py-2 ${dark ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200'}`}>
      <Search size={15} className={dark ? 'text-white/60' : 'text-secondary'} />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search restaurants, cities..."
        autoComplete="off"
        className={`flex-1 bg-transparent text-sm outline-none ${dark ? 'text-white placeholder:text-white/40' : 'text-gray-800 placeholder:text-secondary'}`}
      />
      {searchQuery && (
        <button onClick={() => { setSearchQuery(''); setSuggestions([]); inputRef.current?.focus(); }} className={`text-xs ${dark ? 'text-white/40 hover:text-white/70' : 'text-gray-300 hover:text-secondary'}`}>
          <X size={14} />
        </button>
      )}
      <button onClick={() => handleSearch()} disabled={!searchQuery.trim()} className="px-3 py-1 rounded-lg text-xs font-medium bg-secondary text-white hover:bg-[#3d2209] disabled:opacity-40 transition-colors">
        Go
      </button>
      <AnimatePresence>
        {(suggestions.length > 0 || loadingSuggestions) && searchQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {loadingSuggestions ? (
              <div className="px-4 py-3 text-xs text-secondary flex items-center gap-2">
                <span className="animate-spin inline-block w-3 h-3 border border-gray-300 border-t-secondary rounded-full" />
                Searching...
              </div>
            ) : (
              suggestions.map((name, i) => (
                <button key={i} onClick={() => handleSearch(name)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-accent hover:text-secondary flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0">
                  <Search size={12} className="text-gray-300 " />
                  {name}
                </button>
              ))
            )}
            <button onClick={() => handleSearch()} className="w-full text-left px-4 py-2.5 text-xs text-secondary font-medium hover:bg-accent border-t border-gray-100 flex items-center gap-1">
              <Search size={11} /> Search all results for &ldquo;{searchQuery}&rdquo;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    

<nav
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
  ${scrolled ? 'bg-white/95 shadow-lg' : 'bg-white shadow-md'}`}
>
      <div className="max-w-screen-6xl mx-auto  sm:px-6 lg:px-15">

        {/* DESKTOP */}
        <div className="hidden md:flex h-16 items-center justify-between gap-8">
          <Link href="/">
         <div className="relative h-[130px] w-[200px]">
          
  {resolvedLogo.image && (
    <Image
      src={resolvedLogo.image}
      alt={resolvedLogo.alt}
      fill
      sizes="160px"
      className="object-contain"
      
    />
  )}
</div>      </Link>
          <div className="flex items-center gap-6 text-lg font-medium">
            {resolvedLinks.map((link) => (
              <Link key={link.url} href={link.url} className="hover:text-[#c45cd1] transition-colors whitespace-nowrap">
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 ">
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => { setIsSearchDesktop(!isSearchDesktop); setSearchQuery(''); setSuggestions([]); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition text-sm font-medium ${isSearchDesktop ? 'bg-primary/85 border-primary ' : 'border-primary/80  hover:text-secondary hover:bg-primary/10'}`}
              >
                <Search size={15} /><span>Search</span>
              </button>
              <AnimatePresence>
                {isSearchDesktop && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-[calc(100%+10px)] w-[420px] bg-primary/40 backdrop-blur-xl border border-primary/15 rounded-2xl p-4 shadow-2xl"
                  >
                    <p className="text-xs  mb-2 font-medium tracking-wide text-white uppercase">Search venues</p>
                    {renderSearchBox(true)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {isAuthenticated && currentUser ? (
  <>
    <span
  onClick={handleProfileClick}
  className="text-primary text-xl font-bold whitespace-nowrap"
>
  Hi {currentUser.name.split(" ")[0]}
</span>
    <button
  onClick={() => {
    logout();
    router.push("/");
  }}
  className="p-2 rounded-full border border-primary  hover:bg-white/10 transition"
  title="Logout"
>
  <LogOut size={18} />
</button>
  </>
) : (
  <>
    <Link href={resolvedLoginBtn.url} className="whitespace-nowrap px-4 py-2 rounded-full border border-primary/90  text-sm font-medium hover:bg-white/10 transition">
      {resolvedLoginBtn.text}
    </Link>
    <Link href={resolvedRegisterBtn.url} className="whitespace-nowrap px-5 py-2 rounded-full border border-primary hover:bg-white/10 transitionprimary text-sm font-medium">
      {resolvedRegisterBtn.text}
    </Link>
  </>
)}
          </div>
        </div>

        {/* MOBILE */}
        <div className="md:hidden h-16 flex items-center justify-between">
          <Link href="/" >
            <div className="relative h-40 w-24">
  {resolvedLogo.image && (
    <Image
      src={resolvedLogo.image}
      alt={resolvedLogo.alt}
      fill
      sizes="96px"
      className="object-contain"
    />
  )}
</div>
          </Link>
          <div className="flex items-center gap-2">
  <button
    onClick={() => {
      setIsSearchMobile(!isSearchMobile);
      if (isOpen) setIsOpen(false);
      setSearchQuery('');
      setSuggestions([]);
    }}
    className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition"
  >
    <Search size={18} />
  </button>

  {isAuthenticated && currentUser && (
    <>
      <span className="text-white text-sm font-medium">
        Hi {currentUser.name.split(" ")[0]}
      </span>

      <button
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="flex items-center justify-center w-8 h-8 rounded-full  hover:bg-white/10 transition"
        title="Logout"
      >
        <LogOut size={16} />
      </button>
    </>
  )}

  <button
    onClick={() => {
      setIsOpen(!isOpen);
      if (isSearchMobile) setIsSearchMobile(false);
    }}
    className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition"
  >
    {isOpen ? <X size={22} /> : <Menu size={22} />}
  </button>
</div>
        </div>

        <AnimatePresence>
          {isSearchMobile && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="md:hidden overflow-visible border-t border-white/10 px-4 py-4 bg-secondary/60">
              {renderSearchBox(true)}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="md:hidden bg-secondary/90 backdrop-blur-xl border-t border-white/10 px-4 py-6">
              <div className="flex flex-col gap-5 text-white text-base">
                {resolvedLinks.map((link) => (
                  <Link key={link.url} href={link.url} onClick={closeMenu} className="hover:text-[#c45cd1] transition font-medium">
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                 {isAuthenticated && currentUser ? (
  <>
    {/* <span className="text-white/70 text-sm">Hi, {currentUser.name.split(' ')[0]}</span> */}
    {/* <button
  onClick={() => {
    logout();
    router.push("/");
  }}
  className="p-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
  title="Logout"
>
  <LogOut size={18} />
</button> */}
  </>
) : (
  <>
    <Link href={resolvedLoginBtn.url} onClick={closeMenu} className="block w-full text-center px-5 py-3 rounded-full text-white font-medium border border-white/20 hover:bg-white/10 transition">
      {resolvedLoginBtn.text}
    </Link>
    <Link href={resolvedRegisterBtn.url} onClick={closeMenu} className="block w-full text-center px-5 py-3 rounded-full text-white font-medium bg-gradient-to-r from-secondary via-primary to-primary hover:opacity-90 transition">
      {resolvedRegisterBtn.text}
    </Link>
  </>
)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}