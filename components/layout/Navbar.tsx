'use client'; 

import { useState } from 'react';
import Link from 'next/link';



export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    
    <nav className=" border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-screen-2xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3">
           
            <div>
              <h1 
                className="text-3xl font-bold tracking-tighter" 
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                LOGO
              </h1>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-lg font-bold">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
                        <Link href="/restaurants" className="hover:text-amber-400 transition-colors">Restaurants</Link>
            <Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/restaurants"
              className="bg-[#513012] hover:bg-amber-600 text-white px-6 py-3 rounded-3xl font-semibold flex items-center gap-2 shadow-lg transition-colors"
            >
              <i className="fa-solid fa-utensils"></i>
              Explore Restaurants
            </Link>
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden text-3xl text-white"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-col gap-6 text-lg">
              <Link 
                href="/" 
                onClick={() => setIsOpen(false)}
                className="hover:text-amber-400"
              >
                Home
              </Link>
              <Link 
                href="/menu" 
                onClick={() => setIsOpen(false)}
                className="hover:text-amber-400"
              >
                Menu
              </Link>
              <Link 
                href="/order" 
                onClick={() => setIsOpen(false)}
                className="hover:text-amber-400"
              >
                Order Online
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}