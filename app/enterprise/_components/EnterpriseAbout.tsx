'use client'

import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

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

interface Restaurant {
  name: string
  city?: string
  address?: string
  amenities?: string
  availability?: string
  table_count?: number
  menus_count?: number
  cover_photo?: Record<string, string>
  photos?: { id: number; photo_url: string }[]
}

interface Props {
  restaurant: Restaurant
  coverPhotoUrl?: string | null
}

export default function EnterpriseAbout({ restaurant, coverPhotoUrl }: Props) {
  const imageUrl = coverPhotoUrl ?? (restaurant.photos?.[0]?.photo_url ?? null)

  const pillars = [
    { icon: '🍽️', label: 'Authentic Flavors', color: '#f97316' },
    { icon: '👨‍🍳', label: 'Expert Chefs', color: '#f97316' },
    { icon: '🌿', label: 'Fresh Ingredients', color: '#f97316' },
    { icon: '⭐', label: 'Premium Experience', color: '#f97316' },
  ]

  const stats = [
    { icon: '🏆', value: '5+', label: 'Years Open', color: '#f97316' },
    { icon: '🍽️', value: `${restaurant.menus_count ?? '50'}+`, label: 'Menu Items', color: '#f97316' },
    { icon: '🪑', value: `${restaurant.table_count ?? '20'}+`, label: 'Tables', color: '#f97316' },
  ]

  return (
    <section className="w-full bg-white py-10 px-4 sm:px-8 lg:px-12 font-sans overflow-hidden">
      <div className="relative w-full flex flex-col lg:flex-row items-stretch justify-between min-h-[460px] gap-6 lg:gap-0 max-w-6xl mx-auto">

        {/* ── LEFT CONTENT ── */}
        <div className="w-full lg:w-[54%] flex flex-col justify-between gap-5 z-10 pr-0 lg:pr-10">

          {/* Headers */}
          <div className="space-y-3">
            <motion.h1
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
              className="text-4xl sm:text-[52px] font-secondary tracking-tight leading-[1.05] text-gray-900"
            >
              Welcome to{' '}
              <span className="text-accent-500">{restaurant.name}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}
              className="flex items-center border-l-4 border-accent-500 pl-3 py-0.5"
            >
              <p className="text-sm sm:text-base font-bold text-gray-700">
                {restaurant.city ? `Fine Dining in ${restaurant.city}` : 'A Premium Dining Experience'}
              </p>
            </motion.div>

            {/* Tagline */}
            <motion.p
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={2}
              className="text-sm sm:text-base font-extrabold italic text-accent-500"
            >
              &quot;Every meal, an unforgettable memory.&quot;
            </motion.p>

            {/* Description */}
            <motion.p
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={3}
              className="text-primary font-medium text-[13.5px] leading-relaxed max-w-lg"
            >
              {restaurant.amenities ??
                `${restaurant.name} offers an exceptional dining experience crafted with the finest ingredients, expert chefs, and warm hospitality. Come discover flavors that tell a story.`}
            </motion.p>
          </div>

          {/* Stats Row */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={4}
            className="flex items-center gap-6 max-w-lg flex-wrap"
          >
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-accent-50 flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <div>
                  <div className="text-2xl font-secondary text-accent-500 leading-none">{stat.value}</div>
                  <div className="text-[10.5px] font-bold text-primary mt-0.5">{stat.label}</div>
                </div>
                {i < stats.length - 1 && <div className="h-10 w-px bg-gray-200 ml-3" />}
              </div>
            ))}
          </motion.div>

          {/* Pillars */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={5}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl"
          >
            {pillars.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white border border-gray-100 border-l-[3px] border-l-accent-500 rounded-lg px-2.5 py-2 shadow-sm hover:-translate-y-0.5 transition-transform"
              >
                <span className="text-base shrink-0">{p.icon}</span>
                <span className="text-[10.5px] font-extrabold text-gray-800 leading-tight">{p.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={6}
            className="flex gap-3 flex-wrap"
          >
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-secondary hover:bg-accent-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all hover:scale-105"
            >
              Reserve a Table →
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 border border-accent-500 text-white bg-primary hover:bg-secondary font-semibold px-6 py-2.5 rounded-full text-sm transition-all"
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
          <div className="relative w-full h-full min-h-[400px] rounded-t-[14rem] lg:rounded-t-none lg:rounded-l-[24rem] overflow-hidden border-t-[10px] lg:border-t-0 lg:border-l-[10px] border-accent-500 shadow-2xl bg-gray-200">

            {/* accent accent inner line */}
            <div className="absolute inset-0 z-10 border-t-[3px] lg:border-t-0 lg:border-l-[3px] border-accent-300 rounded-t-[14rem] lg:rounded-t-none lg:rounded-l-[24rem] pointer-events-none" />

            {/* Dot-grid overlay */}
            <div className="absolute inset-0 z-10 opacity-20 mix-blend-screen bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />

            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-accent-400/20 blur-[90px] z-10 pointer-events-none" />

            {/* Main image */}
            {imageUrl ? (
              <Image
                src={imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`}
                alt={restaurant.name}
                fill
                className="object-cover object-center scale-105 transition-transform duration-1000 hover:scale-110"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-accent-900 to-gray-900 flex items-center justify-center">
                <span className="text-8xl opacity-20">🍽️</span>
              </div>
            )}

            {/* accent wave bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[72px] bg-accent-500 z-10 pointer-events-none"
              style={{ clipPath: 'ellipse(110% 100% at 50% 100%)' }}
            />
          </div>

          {/* Floating Card — Location */}
          <div className="absolute top-8 right-3 lg:right-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/70 p-2.5 flex items-center gap-2.5 w-44 z-20">
            <span className="text-lg bg-accent-50 p-1.5 rounded-xl shrink-0">📍</span>
            <div>
              <span className="text-[11.5px] font-secondary text-gray-900 leading-tight block">
                {restaurant.city ?? 'Our Location'}
              </span>
              <span className="text-[9px] font-bold text-primary mt-0.5 block">
                {restaurant.address ?? 'Visit Us Today'}
              </span>
            </div>
          </div>

        
          {/* Bottom badge */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/70 px-4 py-2.5 flex items-center gap-3 z-20 whitespace-nowrap">
            <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-extrabold">✓</span>
            </div>
            <div>
              <div className="text-[9.5px] font-bold text-primary leading-none">Est.</div>
              <div className="text-[15px] font-secondary text-accent-500 leading-tight mt-0.5">
                {restaurant.name}
              </div>
            </div>
          </div>

          {/* Three color dots */}
          <div className="absolute bottom-5 right-8 flex items-center gap-1.5 z-20">
            <span className="w-2 h-2 rounded-full bg-accent-500" />
            <span className="w-2 h-2 rounded-full bg-gray-800" />
            <span className="w-2 h-2 rounded-full bg-accent-300" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}