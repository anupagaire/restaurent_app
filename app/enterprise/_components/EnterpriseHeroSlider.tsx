
'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, UtensilsCrossed } from 'lucide-react'

interface Photo {
  id: number
  photo_url: string
  alt?: string
}

interface Props {
  photos: Photo[]
  restaurant: {
    name?: string
    city?: string
    amenities?: string
  }
}

function resolveUrl(url: string, base: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function EnterpriseHeroSlider({ photos, restaurant }: Props) {
  const [current, setCurrent] = useState(0)
  const total = photos.length

  const next = useCallback(() => setCurrent(p => (p + 1) % total), [total])
  const prev = () => setCurrent(p => (p - 1 + total) % total)

  // Auto-play every 5 seconds
  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, total])

  if (photos.length === 0) {
  return (
    <section style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%)' }}>
      <HeroContent restaurant={restaurant} />
    </section>
  )
}

  return (
    <section className="relative h-[85vh] min-h-[500px] flex items-end overflow-hidden">

      {/* Slides */}
      {photos.map((photo, idx) => (
        <div
          key={photo.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={resolveUrl(photo.photo_url, process.env.NEXT_PUBLIC_API_URL ?? '')}
            alt={photo.alt ?? restaurant.name ?? 'Restaurant'}
            fill
            priority={idx === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }}
      />

      {/* Prev / Next arrows — only if more than 1 */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur text-white rounded-full p-3 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur text-white rounded-full p-3 transition-all"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 h-2 bg-accent-500' : 'w-2 h-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Content */}
      <HeroContent restaurant={restaurant} />
    </section>
  )
}

function HeroContent({ restaurant }: { restaurant: Props['restaurant'] }) {
  return (
    <div className="relative z-20 w-full max-w-6xl mx-auto px-6 pb-20">
      <div className="inline-flex items-center gap-2 bg-accent-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
        <UtensilsCrossed size={12} />
        {restaurant?.city ?? 'Fine Dining'}
      </div>
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
        {restaurant?.name}
      </h1>
      <p className="text-gray-300 text-lg max-w-xl mb-8">
        {restaurant?.amenities ?? 'Experience the finest dining. Reserve your table today.'}
      </p>
      <div className="flex flex-wrap gap-3">
        
        <Link
          href="/menu"
          className="bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-full transition-all flex items-center gap-2"
        >
          View Menu <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}
