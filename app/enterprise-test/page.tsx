import { headers } from 'next/headers'
import { fetchRestaurantById } from '@/lib/restaurant'
import { MapPin, Clock, Phone, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import EnterpriseGalleryCarousel from '../(enterprise)/_components/EnterpriseGalleryCarousel';
import EnterpriseAbout from '../(enterprise)/_components/EnterpriseAbout';
import Navbar from "../(enterprise)/_components/EnterpriseNavbar"
import Footer from '../(enterprise)/_components/EnterpriseFooter';
import EnterpriseHeroSlider from '../(enterprise)/_components/EnterpriseHeroSlider'
function resolveUrl(url: string, base: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

 
export default async function EnterpriseHomePage() {
  const headersList = await headers()
  const restaurantId = headersList.get('x-restaurant-id') ?? '8'
  const restaurant = await fetchRestaurantById(restaurantId)
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
 
  // ── Slider photos (type=restaurant_website_section, purpose=slider)
  let sliderPhotos: { id: number; photo_url: string; alt: string }[] = []
  try {
    

const res = await fetch(
  `${BASE_URL}/api/v1/photo/?type=restaurant&purpose=slider&object_id=${restaurantId}&page_size=10`,
  { cache: 'no-store' }
)



    if (res.ok) {
      const data = await res.json()
      sliderPhotos = (data.results ?? []).map((p: any) => ({
        id: p.id,
        photo_url: resolveUrl(p.photo_url, BASE_URL),
        alt: p.alt ?? '',
      }))
    }
  } catch {}
 
  // ── Fallback: cover photo if no slider photos
  // if (sliderPhotos.length === 0) {
  //   try {
  //     const res = await fetch(
  //       `${BASE_URL}/api/v1/photo/?type=restaurant&object_id=${restaurantId}&purpose=cover`,
  //       { cache: 'no-store' }
  //     )
  //     if (res.ok) {
  //       const data = await res.json()
  //       const url = data.results?.[0]?.photo_url
  //       if (url) {
  //         sliderPhotos = [{
  //           id: data.results[0].id,
  //           photo_url: resolveUrl(url, BASE_URL),
  //           alt: restaurant?.name ?? '',
  //         }]
  //       }
  //     }
  //   } catch {}
  // }
 
  // ── Gallery photos for carousel
  let galleryPhotos: { id: number; photo_url: string }[] = []
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/photo/?type=restaurant&object_id=${restaurantId}&page_size=8`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data = await res.json()
      galleryPhotos = data.results ?? []
    }
  } catch {}
 
  if (galleryPhotos.length === 0) {
    galleryPhotos = (restaurant?.photos ?? []).slice(0, 8)
  }
   return (
    <>
    <Navbar restaurant={restaurant} />
     <div className="min-h-screen bg-white">
 
      {/* ── HERO SLIDER ── */}
      <EnterpriseHeroSlider
        photos={sliderPhotos}
        restaurant={{
          name: restaurant?.name,
          city: restaurant?.city,
          amenities: restaurant?.amenities,
        }}
      />
 
      {/* ── INFO STRIP ── */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-700">
          {restaurant?.address && (
            <div className="flex items-center gap-3 py-2 md:py-0">
              <MapPin size={18} className="text-orange-400 shrink-0" />
              <div>
                <p className="text-xs text-secondary">Location</p>
                <p className="text-sm font-medium">{restaurant.address}, {restaurant.city}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 py-2 md:py-0 md:px-6">
            <Clock size={18} className="text-orange-400 shrink-0" />
            <div>
              <p className="text-xs text-secondary">Hours</p>
              <p className="text-sm font-medium">{restaurant?.availability ?? 'Open Daily'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2 md:py-0 md:px-6">
            <Phone size={18} className="text-orange-400 shrink-0" />
            <div>
              <p className="text-xs text-secondary">Reservations</p>
              <p className="text-sm font-medium">Book online or call us</p>
            </div>
          </div>
        </div>
      </section>
 
      {/* ── ABOUT ── */}
      <EnterpriseAbout
        restaurant={restaurant}
        coverPhotoUrl={sliderPhotos[0]?.photo_url ?? null}
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
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-white text-orange-500 font-bold px-10 py-4 rounded-full hover:bg-orange-50 transition-all hover:scale-105 text-lg"
          >
            Reserve Your Table <ChevronRight size={20} />
          </Link>
        </div>
      </section>
 
    </div>
       <Footer restaurant={restaurant} />
     

    </>
  )
}