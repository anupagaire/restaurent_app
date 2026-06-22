'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, MapPin, UtensilsCrossed } from 'lucide-react'

interface Restaurant {
  id: number
  name: string
  address?: string
  city?: string
  cover_photo?: Record<string, string>
}

export default function EnterpriseNavbar({ restaurant }: { restaurant: Restaurant }) {
  const [open, setOpen] = useState(false)
  
  if (!restaurant) return null
  
  const navLinks = [
    { label: 'Home',    href: '/' },
    { label: 'About Us',   href: '/about-us' },
    { label: 'Menu',    href: '/menu' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Gallery', href: '/gallery' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-primary/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo / Name */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <UtensilsCrossed size={18} className="text-accent" />
            </div>
            <span className="font-bold text-secondary text-lg leading-tight">
              {restaurant.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-primary hover: transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/menu"
              className="bg-primary hover:bg-secondary text-accent text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Order Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} className="text-primary" /> : <Menu size={20} className="text-primary" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-primary/10 bg-white px-4 py-4 flex flex-col gap-3">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-secondary/70 hover:text-primary hover:bg-accent/20 py-2 px-3 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/booking"
            onClick={() => setOpen(false)}
            className="mt-2 bg-primary text-accent text-sm font-semibold px-4 py-2.5 rounded-lg text-center hover:bg-secondary transition-colors"
          >
            Reserve a Table
          </Link>
          {restaurant.address && (
            <p className="text-xs text-secondary/50 flex items-center gap-1 mt-1 px-3">
              <MapPin size={11} /> {restaurant.address}, {restaurant.city}
            </p>
          )}
        </div>
      )}
    </header>
  )
}