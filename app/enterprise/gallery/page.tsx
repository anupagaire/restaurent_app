import { fetchRestaurantById } from '@/lib/restaurant'
import { headers } from 'next/headers'

import EnterprisePhotoGallery from './../_components/EnterprisePhotoGallery'
import Link from 'next/link'

export default async function EnterpriseGalleryPage() {
    const headersList = await headers()
    const restaurantId = headersList.get('x-restaurant-id')

    if (!restaurantId) return <div>Restaurant not found</div>




  const restaurant = await fetchRestaurantById(restaurantId)
  if (!restaurant) return <div>Not found</div>

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  let photos = restaurant.photos ?? []

  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/photo/?type=restaurant&object_id=${restaurantId}&page_size=100`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.results?.length > 0) photos = data.results
    }
  } catch {}

  return (
    <div>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0f0a, #2d1810)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '16px', display: 'block' }}>
            ← Back to Home
          </Link>
          <h1 style={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}>
            {restaurant.name} Gallery
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
            {photos.length} photos
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <EnterprisePhotoGallery
          photos={photos}
          restaurantName={restaurant.name}
          perPage={12}
        />
      </div>

    </div>
  )
}