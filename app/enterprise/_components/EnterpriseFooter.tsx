'use client'

import Link from 'next/link'
import { MapPin, UtensilsCrossed, Star, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react'

interface Restaurant {
  id: number
  name: string
  address?: string
  city?: string
  zip?: string
  amenities?: string
  availability?: string
  table_count?: number
  menus?: { id: number; name: string; status: boolean }[]
}

export default function EnterpriseFooter({ restaurant }: { restaurant: Restaurant }) {
  const year = new Date().getFullYear()

  const navLinks = [
    { label: 'Home',    href: '/' },
    { label: 'Menu',    href: '/menu' },
    { label: 'Booking', href: '/booking' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <footer className="bg-primary text-white">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 32px' }}>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* ── Brand column ── */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                <UtensilsCrossed size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{restaurant.name}</h2>
                {restaurant.city && (
                  <p className="text-xs text-secondary">{restaurant.city}, Nepal</p>
                )}
              </div>
            </div>

            <p className="text-secondary text-sm leading-relaxed mb-4">
              {restaurant.amenities ?? 'Bringing the best flavors to your table. Fresh • Delicious • Authentic'}
            </p>

            {/* Stars */}
            <div className="flex gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className="fill-accent text-white" />
              ))}
            </div>

           
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white hover:text-orange-400 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-4">Get In Touch</h3>
            <div className="flex flex-col gap-3">

              {restaurant.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-orange-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-secondary">
                    {restaurant.address}
                    {restaurant.city ? `, ${restaurant.city}` : ''}
                    {restaurant.zip ? ` - ${restaurant.zip}` : ''}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Phone size={16} className="text-orange-400 shrink-0" />
                <p className="text-sm text-secondary">Contact us for reservations</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-orange-400 shrink-0" />
                <p className="text-sm text-secondary">
                  info@{restaurant.name?.toLowerCase().replace(/\s+/g, '')}.com
                </p>
              </div>

              {restaurant.table_count && restaurant.table_count > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-base shrink-0">🪑</span>
                  <p className="text-sm text-secondary">{restaurant.table_count} tables available</p>
                </div>
              ) : null}
            </div>

          
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-secondary">
            © {year} {restaurant.name}. All rights reserved.
          </p>
          <p className="text-xs text-white">
            Powered by{' '}
            <a href="https://foodhub.com" className="text-white hover:underline">
              FoodHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}