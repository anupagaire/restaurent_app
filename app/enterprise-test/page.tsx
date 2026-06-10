import { headers } from 'next/headers'
import { fetchRestaurantById } from '@/lib/restaurant'
import { MapPin, Clock, Phone, ChevronRight, UtensilsCrossed, Star } from 'lucide-react'
import Link from 'next/link'
import EnterpriseGalleryCarousel from '../(enterprise)/_components/EnterpriseGalleryCarousel';
import EnterpriseAbout from '../(enterprise)/_components/EnterpriseAbout';
import Navbar from "../(enterprise)/_components/EnterpriseNavbar"
import Footer from '../(enterprise)/_components/EnterpriseFooter';

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
    <>
    <Navbar restaurant={restaurant} />
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
      <EnterpriseAbout
  restaurant={restaurant}
  coverPhotoUrl={coverPhoto}
/>

      {/* ── GALLERY CAROUSEL ── */}
      {galleryPhotos.length > 0 && (
        <EnterpriseGalleryCarousel
          photos={galleryPhotos}
          restaurantName={restaurant?.name ?? ''}
          totalCount={galleryPhotos.length}
        />
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
    <Footer restaurant={restaurant} />
     

    </>
  )
}