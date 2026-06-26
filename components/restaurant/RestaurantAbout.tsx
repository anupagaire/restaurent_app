'use client'
import Link from 'next/link'
import RestaurantPhotoSlider from './RestaurantPhotoSlider'
import { MapPin, Utensils, ChevronRight, Sparkles, Star, Users, Leaf, Award } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import SectionHeader from "@/components/layout/SectionHeader";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 },
  }),
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.93 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
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
  const slug = toSlug(restaurant.name)
  const imageUrl = resolvePhoto(restaurant.photos?.[0]?.photo_url)

  const pillars = [
    { icon: Star, label: 'Authentic Flavors', desc: 'Recipes passed through generations' },
    { icon: Users, label: 'Expert Chefs', desc: 'Masters of their craft' },
    { icon: Leaf, label: 'Fresh Ingredients', desc: 'Sourced daily from local farms' },
    { icon: Award, label: 'Premium Experience', desc: 'Every detail perfected' },
  ]

  const stats = [
    { value: `${restaurant.table_count ?? '20'}+`, label: 'Tables' },
    { value: '100%', label: 'Fresh Daily' },
    { value: '5★', label: 'Rated' },
  ]

  return (
    <div className="overflow-hidden">

      {/* ── SECTION 1: HERO ABOUT ── */}
      <section className="relative px-5 sm:px-10 lg:px-20 py-16 lg:py-4">

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT — Text */}
            <div className="flex flex-col gap-7">

              <div>
                <motion.p
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}
                  className="text-xl font-bold leading-none mb-1 opacity-70"
                >
               Welcome To
                </motion.p>
                <motion.h2
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={2}
                  className="font-bold leading-none tracking-tight text-7xl text-primary"
                 
                >
                  {restaurant.name}
                </motion.h2>
              </div>

              {/* Description */}
              <motion.p
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={3}
                className="text-base sm:text-lg font-light  text-secondary leading-[1.85] opacity-75 max-w-lg"
              >
                {restaurant.description ||
                  `Experience authentic flavors and warm hospitality in the heart of ${restaurant.city}. We're passionate about serving delicious food made with fresh, quality ingredients.`}
              </motion.p>

              {locationParts.length > 0 && (
                <motion.div
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={4}
                  className="inline-flex items-center gap-2.5 self-start px-4 py-2.5 font-bold rounded-full"
                  style={{  border: '1px solid rgba(200,145,74,0.25)' }}
                >
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-sm font-light opacity-80">{locationParts.join(', ')}</span>
                </motion.div>
              )}

              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={5}
                className="flex items-center gap-0 pt-2"
              >
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`${i > 0 ? 'pl-6 lg:pl-8' : ''} ${i < stats.length - 1 ? 'pr-6 lg:pr-8' : ''}`}>
                      <div className="text-2xl sm:text-3xl font-bold text-primary" >
                        {stat.value}
                      </div>
                      <div className="text-[10px] font-bold tracking-widest uppercase opacity-50 mt-0.5">{stat.label}</div>
                    </div>
                    {i < stats.length - 1 && <div className="h-10 w-px opacity-20" style={{ background: '#c8914a' }} />}
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                variants={fadeUp} 
                className="flex flex-wrap gap-3 pt-1"
              >
                <Link
                  href={`/restaurants/${slug}`}
                  className="inline-flex items-center bg-accent text-white gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  
                >
                  Reserve a Table
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/restaurants/${slug}/menu`}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium text-accent transition-all duration-300 hover:bg-accent/10"
                  style={{ border: '1px solid rgba(200,145,74,0.35)' }}
                >
                  <Utensils className="w-4 h-4" />
                  View Menu
                </Link>
              </motion.div>
            </div>

            {/* RIGHT — Image */}
            <motion.div
              variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="relative w-full"
            >
              {/* Main image frame */}
              <div className="relative w-full aspect-[4/5] max-h-[580px] rounded-[2.5rem] overflow-hidden"
                style={{ border: '1px solid rgba(200,145,74,0.2)' }}>

                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={restaurant.name}
                    fill
                    className="object-cover object-center transition-transform duration-700 hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(200,145,74,0.15), rgba(14,11,7,0.8))' }}>
                    <span className="text-8xl opacity-20">🍽️</span>
                  </div>
                )}

                {/* Gradient overlay bottom */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(14,11,7,0.7) 0%, transparent 50%)' }} />
              </div>

              {/* Floating accent card */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={3}
                className="absolute -top-4 -right-4 sm:top-6 sm:-right-6 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl z-20"
                style={{
                  background: 'rgba(14,11,7,0.85)',
                  border: '1px solid rgba(200,145,74,0.3)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(200,145,74,0.15)' }}>
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-accent text-xs font-bold">Premium Quality</div>
                    <div className="text-white/50 text-[10px] mt-0.5">Crafted with passion</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-10 lg:px-20 py-12 lg:py-6">
        <div className="max-w-7xl mx-auto">

          <motion.div
            variants={fadeIn} 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {pillars.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={i}
                  variants={fadeUp} 
                  className="group flex flex-col gap-3 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    border: '1px solid rgba(200,145,74,0.12)',
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
                    style={{ background: 'rgba(200,145,74,0.1)' }}>
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-base font-semibold mb-1">{p.label}</div>
                    <div className="text-sm font-light opacity-50 leading-relaxed">{p.desc}</div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {restaurant.photos && restaurant.photos.length > 0 && (
        <section className="px-5 sm:px-10 lg:px-20 py-2 lg:py-8">
          <div className="max-w-7xl mx-auto">

            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
            >
              <div>
                <h2
                  className="text-3xl sm:text-4xl font-light leading-tight"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  Inside Our World
                </h2>
              </div>
              <Link
                href={`/restaurants/${slug}/gallery`}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-light text-accent transition-all duration-300 hover:bg-accent/10 group"
                style={{ border: '1px solid rgba(200,145,74,0.3)' }}
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
              className="sm:hidden mt-4 flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full text-sm font-light text-accent transition-all hover:bg-accent/10"
              style={{ border: '1px solid rgba(200,145,74,0.3)' }}
            >
              View All Photos ({restaurant.photos.length})
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ── SECTION 4: CTA BANNER ── */}
      <section className="px-5 sm:px-10 lg:px-20 pb-8">
        <div className="max-w-10xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
            className="relative rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a0e05 0%, #2d1a08 50%, #1a0e05 100%)' }}
          >
            {/* Accent border top */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #c8914a, transparent)' }} />

            {/* Glow orbs */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
              style={{ background: 'rgba(200,145,74,0.12)' }} />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-60 h-60 rounded-full blur-[80px] pointer-events-none"
              style={{ background: 'rgba(200,145,74,0.08)' }} />

            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundSize: '150px',
              }} />

            <div className="relative px-8 sm:px-14 lg:px-20 py-14 lg:py-20">
              <div className="max-w-2xl mx-auto text-center">
                <motion.div
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}
                  className="inline-flex items-center gap-2 mb-6"
                >
                  <div className="w-5 h-px bg-accent/60" />
                  <span className="text-white text-[10px] tracking-[0.4em] uppercase">Reserve Your Experience</span>
                  <div className="w-5 h-px bg-accent/60" />
                </motion.div>

                <motion.h3
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={2}
                  className="font-light text-white leading-tight mb-5"
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontFamily: '"Playfair Display", Georgia, serif',
                  }}
                >
                  Ready to Dine{' '}
                  <span className="text-accent"style={{  fontStyle: 'italic' }}>With Us?</span>
                </motion.h3>

                <motion.p
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={3}
                  className="text-white/45 mb-10 text-base sm:text-lg font-light leading-relaxed"
                >
                  Book your table and experience the finest dining in{' '}
                  <span className="text-white/70 font-medium">{restaurant.city}</span>.
                </motion.p>

                <motion.div
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={4}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Link
                    href={`/restaurants/${slug}`}
                    className="inline-flex items-center bg-accent text-white justify-center gap-2 px-9 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Reserve a Table
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/restaurants/${slug}/menu`}
                    className="inline-flex items-center justify-center gap-2 px-9 py-3.5 rounded-full text-sm font-medium text-white/70 transition-all duration-300 hover:text-accent hover:border-accent/50"
                    style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <Utensils className="w-4 h-4" />
                    View Menu
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Accent border bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #c8914a, transparent)' }} />
          </motion.div>
        </div>
      </section>

    </div>
  )
}