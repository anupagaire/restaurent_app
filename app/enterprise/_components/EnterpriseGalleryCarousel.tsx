'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Photo {
  id: number | string
  photo_url: string
}

interface Props {
  photos: Photo[]
  restaurantName: string
  totalCount?: number
}

function resolveUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function EnterpriseGalleryCarousel({ photos, restaurantName, totalCount }: Props) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(0)
  const total = photos.length

  const move = (dir: number) => {
    setCurrent((prev) => (prev + dir + total) % total)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1)
      if (e.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [total])

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => move(1), 4000)
    return () => clearInterval(timer)
  }, [total])

  const getCardStyle = (index: number): React.CSSProperties => {
    let offset = index - current
    if (offset > total / 2) offset -= total
    if (offset < -total / 2) offset += total

    const absOff = Math.abs(offset)
    if (absOff > 2) return { opacity: 0, pointerEvents: 'none', zIndex: 0 }

    const tx = offset * 240
    const tz = absOff === 0 ? 0 : absOff === 1 ? -160 : -300
    const ry = offset * -18
    const scale = absOff === 0 ? 1 : absOff === 1 ? 0.78 : 0.58
    const opacity = absOff === 0 ? 1 : absOff === 1 ? 0.65 : 0.35

    return {
      transform: `translateX(calc(-50% + 50vw + ${tx}px)) translateY(-50%) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`,
      opacity,
      zIndex: 10 - absOff,
      pointerEvents: 'auto',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }

  if (photos.length === 0) return null

  return (
    <section className=" py-2 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-accent-500 text-xs font-semibold uppercase tracking-widest">
              📸 Our Gallery
            </span>
            <h2 className="text-4xl font-bold  mt-2">
              A Glimpse Inside
            </h2>
            <p className="text-secondary mt-2 text-sm">
              {totalCount ?? photos.length} photos from {restaurantName}
            </p>
          </div>
          <Link
            href="/gallery"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-accent-400 hover:text-accent-300 transition-colors"
          >
            View All <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* 3D Carousel */}
      <div className="relative">
        <div
          className="relative h-[320px] md:h-[420px] overflow-hidden"
          style={{ perspective: '1200px' }}
          onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX
            if (Math.abs(diff) > 40) move(diff > 0 ? 1 : -1)
          }}
        >
          {photos.map((photo, i) => {
            const url = resolveUrl(photo.photo_url)
            if (!url) return null
            return (
              <div
                key={photo.id}
                className="absolute top-1/2 left-0 w-[220px] md:w-[380px] h-[280px] md:h-[380px] rounded-3xl overflow-hidden cursor-pointer"
                style={getCardStyle(i)}
                onClick={() => setCurrent(i)}
              >
                <Image
                  src={url}
                  alt={`${restaurantName} - Photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="380px"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-secondary/30" />

                {/* Active ring */}
                {i === current && (
                  <div className="absolute inset-0 rounded-3xl ring-2 ring-accent-500 ring-offset-0" />
                )}

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-secondary/70 to-transparent">
                  <p className=" text-sm font-medium">
                    {restaurantName}
                  </p>
                  <p className=" text-xs mt-0.5">
                    {i + 1} / {total}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Arrow buttons */}
        <button
          onClick={() => move(-1)}
          className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-20  hover:bg-accent-500 text- w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all backdrop-blur-sm"
          aria-label="Previous"
        >
          ←
        </button>
        <button
          onClick={() => move(1)}
          className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-accent-500  w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all backdrop-blur-sm"
          aria-label="Next"
        >
          →
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2.5 bg-accent-500'
                : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Photo ${i + 1}`}
          />
        ))}
      </div>

      {/* Mobile view all */}
      <div className="text-center mt-8 md:hidden">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 bg-accent-500 text- font-semibold px-6 py-3 rounded-full text-sm"
        >
          View All Photos <ChevronRight size={16} />
        </Link>
      </div>
    </section>
  )
}