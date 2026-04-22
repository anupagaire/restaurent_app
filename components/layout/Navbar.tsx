"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center">
  
  <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2">
           <div className="relative h-26 w-45">
  <Image
    src="/logo.png"
    alt="Logo"
    fill
    className="object-contain"
  />
</div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10 text-lg font-medium text-white">
            <Link href="/" className="hover:text-[#5D0565] transition">
              Home
            </Link>
            <Link href="/restaurants" className="hover:text-[#5D0565] transition">
              Restaurants
            </Link>
            <Link href="/contact" className="hover:text-[#5D0565] transition">
              Contact
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* CTA */}
            <Link
              href="/restaurants"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium 
              bg-gradient-to-r from-[#513012] via-[#47034E] to-[#5D0565]
              hover:opacity-90 transition"
            >
              Explore
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-2xl text-white"
            >
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-6 p-6 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10"
            >
              <div className="flex flex-col gap-6 text-lg text-white">

                <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-[#5D0565]">
                  Home
                </Link>

                <Link href="/restaurants" onClick={() => setIsOpen(false)} className="hover:text-[#5D0565]">
                  Restaurants
                </Link>

                <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-[#5D0565]">
                  Contact
                </Link>

                <Link
                  href="/restaurants"
                  onClick={() => setIsOpen(false)}
                  className="text-center mt-4 px-5 py-3 rounded-full text-white font-medium 
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
  );
}