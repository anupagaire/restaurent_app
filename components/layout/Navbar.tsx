// components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white border-b border-[#513012]/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#513012] to-[#5D0565] rounded-2xl flex items-center justify-center">
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#513012] tracking-tight">Food</h1>
              <p className="text-xs text-gray-500 -mt-1">Taste of Nepal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-[#513012] font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+9779841234567" className="flex items-center gap-2 text-[#513012] hover:text-[#47034E]">
              <Phone className="w-5 h-5" />
              <span className="font-medium">+977 9841234567</span>
            </a>
            <Link href="/login">
              
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#513012]"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-6 py-6 flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-gray-700 hover:text-[#513012]"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="pt-4 border-t flex flex-col gap-4">
              <a href="tel:+9779841234567" className="flex items-center gap-2 text-[#513012]">
                <Phone className="w-5 h-5" />
                +977 9841234567
              </a>
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}