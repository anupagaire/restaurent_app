import { headers } from 'next/headers'
import { fetchRestaurantById } from '@/lib/restaurant'
import { MapPin, Clock, Phone, ChevronRight } from 'lucide-react'
import Link from 'next/link'
// import Navbar from "./_components/EnterpriseNavbar";
// import Footer from "./_components/EnterpriseFooter";
import EnterpriseGalleryCarousel from "./_components/EnterpriseGalleryCarousel";
import EnterpriseAbout from "./_components/EnterpriseAbout";
import EnterpriseHeroSlider from "./_components/EnterpriseHeroSlider";
function resolveUrl(url: string, base: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

 
export default async function EnterpriseHomePage() {
  const headersList = await headers()
  const restaurantId = headersList.get('x-restaurant-id') 
  console.log('🔍 Restaurant ID from header:', restaurantId);
    if (!restaurantId) return <div>Restaurant not found</div>

  const restaurant = await fetchRestaurantById(restaurantId)

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
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
    {/* <Navbar restaurant={restaurant} /> */}
     <div className="min-h-screen bg-white">
 
      <EnterpriseHeroSlider
        photos={sliderPhotos}
        restaurant={{
          name: restaurant?.name,
          city: restaurant?.city,
          amenities: restaurant?.amenities,
        }}
      />
 
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-700">
          {restaurant?.address && (
            <div className="flex items-center gap-3 py-2 md:py-0">
              <MapPin size={18} className="text-accent-400 shrink-0" />
              <div>
                <p className="text-xs text-secondary">Location</p>
                <p className="text-sm font-medium">{restaurant.address}, {restaurant.city}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 py-2 md:py-0 md:px-6">
            <Clock size={18} className="text-accent-400 shrink-0" />
            <div>
              <p className="text-xs text-secondary">Hours</p>
              <p className="text-sm font-medium">{restaurant?.availability ?? 'Open Daily'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2 md:py-0 md:px-6">
            <Phone size={18} className="text-accent-400 shrink-0" />
            <div>
              <p className="text-xs text-secondary">Reservations</p>
              <p className="text-sm font-medium">Book online or call us</p>
            </div>
          </div>
        </div>
      </section>
 
      <EnterpriseAbout
        restaurant={restaurant}
        coverPhotoUrl={sliderPhotos[0]?.photo_url ?? null}
      />
 
      {galleryPhotos.length > 0 && (
        <EnterpriseGalleryCarousel
          photos={galleryPhotos}
          restaurantName={restaurant?.name ?? ''}
          totalCount={galleryPhotos.length}
        />
      )}
 
      {/* ── CTA ── */}
      <section className="bg-accent-500 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready for an Amazing Experience?</h2>
          <p className="text-accent-100 mb-8 text-lg">Book your table now and enjoy a memorable dining experience.</p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-white text-accent-500 font-bold px-10 py-4 rounded-full hover:bg-accent-50 transition-all hover:scale-105 text-lg"
          >
            Reserve Your Table <ChevronRight size={20} />
          </Link>
        </div>
      </section>
 
    </div>
       {/* <Footer restaurant={restaurant} /> */}
     

    </>
  )
}