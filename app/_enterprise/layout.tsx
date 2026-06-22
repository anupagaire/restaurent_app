import { ReactNode } from 'react';
import { headers } from 'next/headers'
import { fetchRestaurantById } from '@/lib/restaurant'
import EnterpriseNavbar from './_components/EnterpriseNavbar'
import EnterpriseFooter from './_components/EnterpriseFooter'
interface EnterpriseLayoutProps {
  children: ReactNode;
}
export default async function EnterpriseLayout({
  children,
}: EnterpriseLayoutProps) {
  const headersList = await headers()
  const restaurantId = headersList.get('x-restaurant-id')
  
  if (!restaurantId) return <div>Domain not configured</div>

  const restaurant = await fetchRestaurantById(restaurantId)
  if (!restaurant) return <div>Restaurant not found</div>

  return (
    <>
      <EnterpriseNavbar restaurant={restaurant} />
      <main>{children}</main>
      <EnterpriseFooter restaurant={restaurant} />
    </>
  )
}