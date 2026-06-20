import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import {
  getRestaurantDetail,
  getRestaurantIdBySlug,
} from '@/lib/restaurant';
import { resolveUrl } from '@/lib/utils';
import RestaurantPhotoGrid from '@/components/restaurant/RestaurantPhotoGrid';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurantId = await getRestaurantIdBySlug(slug);
  if (!restaurantId) return { title: 'Gallery - Restaurant Not Found' };

  const restaurant = await getRestaurantDetail(restaurantId);
  if (!restaurant) return { title: 'Gallery - Restaurant Not Found' };

  const photoUrl = restaurant.photos?.[0]?.photo_url;
  const resolvedUrl = photoUrl ? resolveUrl(photoUrl) : null;

  return {
    title: `${restaurant.name} - Gallery`,
    description: `View all photos of ${restaurant.name}`,
    openGraph: {
      title: `${restaurant.name} Gallery`,
      images: resolvedUrl ? [{ url: resolvedUrl }] : [],
    },
  };
}

export default async function RestaurantGalleryPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurantId = await getRestaurantIdBySlug(slug);
  
  if (!restaurantId) return notFound();

  const restaurant = await getRestaurantDetail(restaurantId);
  if (!restaurant || !restaurant.photos || restaurant.photos.length === 0) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header - Menu Page जस्तै */}
      <div className="relative w-full h-52 bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <Link 
              href={`/restaurants/${slug}`}
              className="text-white/70 hover:text-white flex items-center gap-2 mb-3 text-sm"
            >
              ← Back to Restaurant
            </Link>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {restaurant.name} Gallery
            </h1>
            <p className="text-white/80 mt-2 text-lg">
              {restaurant.photos.length} Beautiful Photos
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <RestaurantPhotoGrid 
          photos={restaurant.photos} 
          restaurantName={restaurant.name} 
          perPage={15}
        />
      </div>
    </div>
  );
}