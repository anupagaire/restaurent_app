// app/(enterprise)/layout.tsx
import { headers } from 'next/headers'
import { fetchRestaurantById } from '@/lib/restaurant'
import EnterpriseNavbar from './_components/EnterpriseNavbar'
import EnterpriseFooter from './_components/EnterpriseFooter'

export default async function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()  
  const restaurantId = headersList.get('x-restaurant-id') ?? '8'

  const restaurant = await fetchRestaurantById(restaurantId)

  return (
    <html lang="en">
      <head>
        <title>{restaurant?.name ?? 'Restaurant'}</title>
        <meta name="description" content={restaurant?.seo?.description ?? ''} />
      </head>
      <body>
        <EnterpriseNavbar restaurant={restaurant} />
        {children}
        <EnterpriseFooter restaurant={restaurant} />
      </body>
    </html>
  )
}