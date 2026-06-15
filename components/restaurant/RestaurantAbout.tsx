'use client'
import Link from 'next/link'
import RestaurantPhotoSlider from './RestaurantPhotoSlider'
import { MapPin, Utensils, ChevronRight, Sparkles } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import Image from 'next/image'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.05 },
  }),
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface RestaurantAboutProps {
  restaurant: {
    name: string
    address: string
    city: string
    zip?: string | null
    availability?: string | null
    description?: string | null
    amenities?: string | null
    table_count?: number
    photos?: { id: number; photo_url: string }[]
  }
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function resolvePhoto(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function RestaurantAbout({ restaurant }: RestaurantAboutProps) {
  const locationParts = [restaurant.address, restaurant.city, restaurant.zip].filter(Boolean)
  const amenitiesList = restaurant.amenities
    ? restaurant.amenities.split(',').map((a) => a.trim()).filter(Boolean)
    : []
  const slug = toSlug(restaurant.name)
  const imageUrl = resolvePhoto(restaurant.photos?.[0]?.photo_url)

  const pillars = [
    { icon: '🍽️', label: 'Authentic Flavors' },
    { icon: '👨‍🍳', label: 'Expert Chefs' },
    { icon: '🌿', label: 'Fresh Ingredients' },
    { icon: '⭐', label: 'Premium Experience' },
  ]

  const stats = [
    { icon: '🪑', value: `${restaurant.table_count ?? '20'}+`, label: 'Tables' },
    { icon: '✨', value: '100%', label: 'Fresh Daily' },
  ]

  return (
    <div className=" overflow-hidden">
      <div className="relative px-6 sm:px-10 lg:px-20 pt-24 pb-10 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 max-w-6xl rounded-full bg-[#c8914a]/10 blur-[120px]" />
       

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px w-12 bg-[#c8914a]" />
            <span className="text-[#c8914a] text-[11px] tracking-[0.45em] uppercase font-light">Our Story</span>
          </motion.div>

          <div className="mb-5">
            <motion.h2
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}
              className="font-light leading-[0.92] tracking-tight text-2xl"
              style={{  fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Welcome to
            </motion.h2>
            <motion.h2 className="font-bold leading-[0.92] tracking-tight text-4xl sm:text-5xl md:text-7xl"
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={2}
              style={{
                
                color: '#c8914a',
                fontStyle: 'italic',
                
              }}
            >
              {restaurant.name}
            </motion.h2>
          </div>

          <motion.p
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={3}
            className=" text-base sm:text-lg font-light max-w-xl leading-relaxed"
          >
            Experience authentic flavors and warm hospitality in the heart of{' '}
            <span className="text-[#c8914a]">{restaurant.city}</span>
          </motion.p>
        </div>
      </div>

      {/* ══════════════════════════════
          MAIN — Left text + Right image
      ══════════════════════════════ */}
      <div className="px-6 sm:px-10 lg:px-20 pb-20 max-w-8xl mx-auto">
        <div className="relative w-full flex flex-col lg:flex-row items-stretch justify-between min-h-[460px] gap-6 lg:gap-0">

          {/* ── LEFT CONTENT ── */}
          <div className="w-full lg:w-[54%] flex flex-col justify-between gap-6 z-10 pr-0 lg:pr-10">

            {/* Description */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
              className="relative rounded-3xl p-8 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,145,74,0.12)' }}
            >
              <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-[#c8914a]/25 rounded-tl-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-[#c8914a]/25 rounded-br-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-5">
                <Sparkles className="w-4 h-4 text-[#c8914a]" />
                <span className="text-[#c8914a] text-[10px] tracking-[0.35em] uppercase font-light">About Us</span>
              </div>
              <p
                className=" leading-[1.9] text-base font-light mb-6"
              >
                {restaurant.description ||
                  "We're passionate about serving delicious food made with fresh, quality ingredients. Our team is dedicated to providing you with an unforgettable dining experience."}
              </p>
              {locationParts.length > 0 && (
                <div
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full"
                  style={{ background: 'rgba(200,145,74,0.08)', border: '1px solid rgba(200,145,74,0.18)' }}
                >
                  <MapPin className="w-4 h-4 text-[#c8914a]" />
                  <span className=" text-sm font-light">{locationParts.join(', ')}</span>
                </div>
              )}
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}
              className="flex items-center gap-6 flex-wrap"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(200,145,74,0.12)' }}
                  >
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-secondary text-[#c8914a] leading-none">{stat.value}</div>
                    <div className="text-[10.5px] font-bold  mt-0.5">{stat.label}</div>
                  </div>
                  {i < stats.length - 1 && <div className="h-10 w-px bg-secondary/10 ml-3" />}
                </div>
              ))}
            </motion.div>

            {/* Pillars */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={2}
              className="grid grid-cols-2 gap-2"
            >
              {pillars.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:-translate-y-0.5 transition-transform"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(200,145,74,0.12)',
                    borderLeft: '3px solid #c8914a',
                  }}
                >
                  <span className="text-base shrink-0">{p.icon}</span>
                  <span className="text-[10.5px] font-bold leading-tight">{p.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={3}
              className="flex gap-3 flex-wrap"
            >
              <Link
                href={`/restaurants/${slug}`}
                className="inline-flex items-center gap-2  font-semibold px-6 py-2.5 rounded-full text-sm transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #c8914a, #a8722e)' }}
              >
                Reserve a Table →
              </Link>
              <Link
                href={`/restaurants/${slug}/menu`}
                className="inline-flex items-center gap-2 text-[#c8914a] font-semibold px-6 py-2.5 rounded-full text-sm transition-all hover:bg-[#c8914a]/10"
                style={{ border: '1px solid rgba(200,145,74,0.4)' }}
              >
                View Menu
              </Link>
            </motion.div>
          </div>

          {/* ── RIGHT IMAGE FRAME ── */}
          <motion.div
            variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="w-full lg:w-[44%] relative min-h-[400px] lg:min-h-full flex items-stretch"
          >
            {/* Curved container */}
            <div className="relative w-full h-full min-h-[400px] rounded-t-[14rem] lg:rounded-t-none lg:rounded-l-[24rem] overflow-hidden border-t-[10px] lg:border-t-0 lg:border-l-[10px] border-[#c8914a] shadow-2xl bg-gray-900">

              {/* Inner accent line */}
              <div className="absolute inset-0 z-10 border-t-[3px] lg:border-t-0 lg:border-l-[3px] border-[#c8914a]/40 rounded-t-[14rem] lg:rounded-t-none lg:rounded-l-[24rem] pointer-events-none" />

              {/* Dot grid */}
              <div className="absolute inset-0 z-10 opacity-20 mix-blend-screen bg-[radial-gradient(#c8914a_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />

              {/* Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#c8914a]/20 blur-[90px] z-10 pointer-events-none" />

              {/* Image */}
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={restaurant.name}
                  fill
                  className="object-cover object-center scale-105 transition-transform duration-1000 hover:scale-110"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#c8914a]/20 to-[#0e0b07] flex items-center justify-center">
                  <span className="text-8xl opacity-20">🍽️</span>
                </div>
              )}

              {/* Gold wave bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[72px] bg-[#c8914a] z-10 pointer-events-none"
                style={{ clipPath: 'ellipse(110% 100% at 50% 100%)' }}
              />
            </div>

            {/* Floating card — Location */}
            <div className="absolute top-8 right-3 lg:right-8  backdrop-blur-md rounded-2xl shadow-lg border  p-2.5 flex items-center gap-2.5 w-44 z-20">
              <span className="text-lg p-1.5 rounded-xl shrink-0" style={{ background: 'rgba(200,145,74,0.1)' }}>📍</span>
              <div>
                <span className="text-[11.5px] font-secondary text-gray-900 leading-tight block">
                  {restaurant.city ?? 'Our Location'}
                </span>
                <span className="text-[9px] font-bold text-secondary mt-0.5 block">
                  {restaurant.address ?? 'Visit Us Today'}
                </span>
              </div>
            </div>

            

            {/* Bottom badge */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 bg-secondary/95 backdrop-blur-md rounded-2xl shadow-lg border border-secondary/70 px-4 py-2.5 flex items-center gap-3 z-20 secondaryspace-nowrap">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: '#c8914a' }}>
                <span className="text-secondary text-[10px] font-extrabold">✓</span>
              </div>
              <div>
                <div className="text-[9.5px] font-bold text-secondary leading-none">Fine Dining</div>
                <div className="text-[14px] font-secondary leading-tight mt-0.5" style={{ color: '#c8914a' }}>
                  {restaurant.name}
                </div>
              </div>
            </div>

            {/* Three dots */}
            <div className="absolute bottom-5 right-8 flex items-center gap-1.5 z-20">
              <span className="w-2 h-2 rounded-full bg-[#c8914a]" />
              <span className="w-2 h-2 rounded-full bg-secondary/30" />
              <span className="w-2 h-2 rounded-full bg-[#c8914a]/50" />
            </div>
          </motion.div>
        </div>
      </div>

     

      {/* ══════════════════════════════
          GALLERY
      ══════════════════════════════ */}
      {restaurant.photos && restaurant.photos.length > 0 && (
        <div className="px-6 sm:px-10 lg:px-20 pb-20 max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#c8914a]" />
                <span className="text-[#c8914a] text-[10px] tracking-[0.45em] uppercase font-light">Gallery</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-light text-secondary leading-tight"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Inside Our World
              </h2>
            </div>
            <Link
              href={`/restaurants/${slug}/gallery`}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-light text-[#c8914a] transition-all duration-300 group hover:bg-[#c8914a] hover:text-[#0e0b07]"
              style={{ border: '1px solid rgba(200,145,74,0.4)' }}
            >
              View All ({restaurant.photos.length})
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}
            className="rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(200,145,74,0.12)' }}
          >
            <RestaurantPhotoSlider photos={restaurant.photos} restaurantName={restaurant.name} />
          </motion.div>

          <Link
            href={`/restaurants/${slug}/gallery`}
            className="sm:hidden mt-4 flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full text-sm font-light text-[#c8914a] transition-all hover:bg-[#c8914a] hover:text-[#0e0b07]"
            style={{ border: '1px solid rgba(200,145,74,0.4)' }}
          >
            View All Photos ({restaurant.photos.length})
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ══════════════════════════════
          CTA
      ══════════════════════════════ */}
      <div className="px-6 sm:px-10 lg:px-20 pb-24 max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#c8914a] via-[#a8722e] to-[#6b3d12]" />
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '150px',
            }}
          />
          <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

          <div className="relative px-8 sm:px-14 py-14 text-center">
            <p className="text-secondary/45 text-[10px] tracking-[0.45em] uppercase font-light mb-5">
              Reserve Your Experience
            </p>
            <h3
              className="text-[#0e0b07] font-light leading-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Ready to Dine With Us?
            </h3>
            <p className="text-secondary/55 mb-10 max-w-lg mx-auto font-light text-base sm:text-lg leading-relaxed">
              Book your table now and experience the best of{' '}
              <span className="text-secondary/85 font-medium">{restaurant.city}</span>'s culinary scene.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/restaurants/${slug}/menu`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0e0b07] text-[#c8914a] rounded-full font-medium text-sm hover:bg-[#1c1208] transition-all"
              >
                <Utensils className="w-4 h-4" /> View Menu
              </Link>
              <Link
                href={`/restaurants/${slug}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent text-[#0e0b07] rounded-full font-medium text-sm hover:bg-secondary/10 transition-all"
                style={{ border: '2px solid rgba(14,11,7,0.22)' }}
              >
                More Details
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  )
}

