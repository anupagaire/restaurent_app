import { headers } from 'next/headers'
import { fetchRestaurantById } from '@/lib/restaurant'
import { MapPin, Clock, Phone, ChevronRight, UtensilsCrossed, Star, Camera } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function resolveUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

export default async function EnterpriseHomePage() {
  const headersList = await headers()
  const restaurantId = headersList.get('x-restaurant-id') ?? '8'
  const restaurant = await fetchRestaurantById(restaurantId)

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL

  // Cover photo
  let coverPhoto = null
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/photo/?type=restaurant&object_id=${restaurantId}&purpose=cover`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data = await res.json()
      coverPhoto = data.results?.[0]?.photo_url ?? null
      if (coverPhoto && !coverPhoto.startsWith('http')) {
        coverPhoto = `${BASE_URL}${coverPhoto}`
      }
    }
  } catch {}

  // All photos for gallery preview (max 6)
  let galleryPhotos: { id: number; photo_url: string }[] = []
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/photo/?type=restaurant&object_id=${restaurantId}&page_size=6`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data = await res.json()
      galleryPhotos = data.results ?? []
    }
  } catch {}

  // Fallback to restaurant.photos
  if (galleryPhotos.length === 0) {
    galleryPhotos = (restaurant?.photos ?? []).slice(0, 6)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section
        className="relative h-[85vh] min-h-[500px] flex items-end"
        style={{
          background: coverPhoto
            ? `url(${coverPhoto}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%)',
        }}
      >
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
        }} />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
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
            <Link href="/booking"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-105 flex items-center gap-2">
              Reserve a Table <ChevronRight size={16} />
            </Link>
            <Link href="/menu"
              className="bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-full transition-all flex items-center gap-2">
              View Menu <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── INFO STRIP ── */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-700">
          {restaurant?.address && (
            <div className="flex items-center gap-3 py-2 md:py-0">
              <MapPin size={18} className="text-orange-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm font-medium">{restaurant.address}, {restaurant.city}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 py-2 md:py-0 md:px-6">
            <Clock size={18} className="text-orange-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Hours</p>
              <p className="text-sm font-medium">{restaurant?.availability ?? 'Open Daily'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2 md:py-0 md:px-6">
            <Phone size={18} className="text-orange-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Reservations</p>
              <p className="text-sm font-medium">Book online or call us</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">About Us</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6 leading-tight">
              Welcome to<br />{restaurant?.name}
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              {restaurant?.amenities ?? 'We bring you an exceptional dining experience with carefully crafted dishes and warm hospitality.'}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { icon: '🍽️', label: 'Menu Items', value: `${restaurant?.menus_count ?? '50'}+` },
                { icon: '⭐', label: 'Avg Rating', value: '4.8' },
                { icon: '👨‍🍳', label: 'Expert Chefs', value: '10+' },
                { icon: '🏆', label: 'Years Open', value: '5+' },
              ].map((stat) => (
                <div key={stat.label} className="bg-orange-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-gray-900 rounded-3xl p-8 text-white">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">5.0 Rating</span>
              </div>
              <blockquote className="text-gray-300 text-lg leading-relaxed italic mb-6">
                "An unforgettable dining experience. The food, ambiance, and service are all exceptional."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold">G</div>
                <div>
                  <p className="font-medium text-sm">Guest Review</p>
                  <p className="text-gray-400 text-xs">Verified Customer</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-orange-500 text-white rounded-2xl px-4 py-3 shadow-lg">
              <p className="text-xs font-medium">Now Accepting</p>
              <p className="text-lg font-bold">Reservations</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY PREVIEW ── */}
      {galleryPhotos.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            {/* Header */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
                  <Camera size={14} /> Our Gallery
                </span>
                <h2 className="text-4xl font-bold text-gray-900 mt-2">
                  A Glimpse Inside
                </h2>
              </div>
              <Link
                href="/gallery"
                className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                View All {galleryPhotos.length > 6 ? 'Photos' : `${galleryPhotos.length} Photos`}
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Photo Grid — 3 col layout */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {galleryPhotos.slice(0, 6).map((photo, idx) => {
                const url = resolveUrl(photo.photo_url)
                if (!url) return null

                // First photo bigger
                const isFeatured = idx === 0
                return (
                  <div
                    key={photo.id}
                    className={`relative rounded-2xl overflow-hidden group ${
                      isFeatured ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-square'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${restaurant?.name} photo ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                  </div>
                )
              })}
            </div>

            {/* Mobile view all */}
            <div className="text-center mt-6 md:hidden">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-3 rounded-full"
              >
                View All Photos <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="bg-orange-500 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready for an Amazing Experience?</h2>
          <p className="text-orange-100 mb-8 text-lg">Book your table now and enjoy a memorable dining experience.</p>
          <Link href="/booking"
            className="inline-flex items-center gap-2 bg-white text-orange-500 font-bold px-10 py-4 rounded-full hover:bg-orange-50 transition-all hover:scale-105 text-lg">
            Reserve Your Table <ChevronRight size={20} />
          </Link>
        </div>
      </section>

    </div>
  )
}