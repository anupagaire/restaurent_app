
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Restaurants in Nepal | Browse & Order Online',
  description: 'Discover the best restaurants in Nepal. Browse menus, view photos, read reviews and order online via QR code.',
  alternates: {
    canonical: "https://restaurent-app-sepia.vercel.app/restaurants",
  },
  keywords: ['restaurants Nepal', 'food ordering', 'QR menu', 'restaurant near me'],
  openGraph: {
    title: 'All Restaurants in Nepal | Browse & Order Online',
    description: 'Discover the best restaurants in Nepal.',
    type: 'website',
  },
};

export default function RestaurantsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}


