import { headers } from 'next/headers'
import { fetchRestaurantById } from '@/lib/restaurant'
import EnterpriseNavbar from './_components/EnterpriseNavbar'
import EnterpriseFooter from './_components/EnterpriseFooter'

export default async function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const restaurantId = headersList.get('x-restaurant-id')

  if (!restaurantId) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-[#0e0b07]">
            <div className="text-center">
              <p className="text-6xl mb-4">🔗</p>
              <h1 className="text-2xl font-bold text-white mb-2">Domain Not Configured</h1>
              <p className="text-white/50">This domain is not linked to any restaurant.</p>
            </div>
          </div>
        </body>
      </html>
    )
  }

  const restaurant = await fetchRestaurantById(restaurantId)

  if (!restaurant) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-[#0e0b07]">
            <p className="text-white/50">Restaurant not found.</p>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <title>{restaurant.name}</title>
        <meta name="description" content={restaurant.seo?.description ?? restaurant.amenities ?? ''} />
      </head>
      <body>
        <EnterpriseNavbar restaurant={restaurant} />
        <main>{children}</main>
        <EnterpriseFooter restaurant={restaurant} />
      </body>
    </html>
  )
}