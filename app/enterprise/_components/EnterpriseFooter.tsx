'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, UtensilsCrossed, Star, Phone, Mail } from 'lucide-react'

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
  photos?: { id: number; photo_url: string; purpose: string }[]
}

export default function EnterpriseFooter({ restaurant }: { restaurant: Restaurant }) {
  const year = new Date().getFullYear()
  const logoUrl = restaurant.photos?.find(p => p.purpose === 'logo')?.photo_url

  const navLinks = [
    { label: 'Home',    href: '/' },
    { label: 'Menu',    href: '/menu' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <footer className="bg-primary text-white relative overflow-hidden">
      {/* subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 32px' }}>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">

          {/* ── Brand column ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              {logoUrl ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent-500/40 shrink-0">
                  <Image
                    src={logoUrl}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center shrink-0">
                  <UtensilsCrossed size={20} className="text-white" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{restaurant.name}</h2>
                {restaurant.city && (
                  <p className="text-xs text-white/50">{restaurant.city}, Nepal</p>
                )}
              </div>
            </div>

            <p className="text-white/70 text-sm leading-relaxed mb-5">
              {restaurant.amenities ?? 'Bringing the best flavors to your table. Fresh • Delicious • Authentic'}
            </p>

            {/* Stars */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className="fill-accent-400 text-accent-400" />
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-5 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-accent-500 rounded-full" />
            </h3>
            <ul className="flex flex-col gap-3 mt-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-accent-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0 group-hover:scale-125 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-5 relative inline-block">
              Get In Touch
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-accent-500 rounded-full" />
            </h3>
            <div className="flex flex-col gap-4 mt-2">

              {restaurant.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-accent-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70">
                    {restaurant.address}
                    {restaurant.city ? `, ${restaurant.city}` : ''}
                    {restaurant.zip ? ` - ${restaurant.zip}` : ''}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Phone size={16} className="text-accent-400 shrink-0" />
                <p className="text-sm text-white/70">Contact us for reservations</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-accent-400 shrink-0" />
                <p className="text-sm text-white/70">
                  info@{restaurant.name?.toLowerCase().replace(/\s+/g, '')}.com
                </p>
              </div>

              {restaurant.table_count && restaurant.table_count > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-base shrink-0">🪑</span>
                  <p className="text-sm text-white/70">{restaurant.table_count} tables available</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">
            © {year} {restaurant.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/50">
            Powered by{' '}
            <a href="https://yummynepal.com" className="text-accent-400 hover:underline">
              Yummynepal
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}