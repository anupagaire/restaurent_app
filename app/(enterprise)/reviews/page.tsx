import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchRestaurantById } from '@/lib/restaurant'
import { headers } from 'next/headers'
import ReviewSection from '@/components/home/ReviewSection';

import {
  getRestaurantDetail,
  getRestaurantIdBySlug,
} from '@/lib/restaurant';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
const { slug } = await params;
  const restaurantId = await getRestaurantIdBySlug(slug);

  if (!restaurantId) {
    return {
      title: 'Restaurant Reviews Not Found',
    };
  }

  const restaurant = await getRestaurantDetail(restaurantId);

  if (!restaurant) {
    return {
      title: 'Restaurant Reviews Not Found',
    };
  }

  const seo = restaurant.seo;

  return {
    title:
      seo?.title
        ? `Reviews - ${seo.title}`
        : `Reviews | ${restaurant.name}`,

    description:
      seo?.meta_description ??
      `Read customer reviews and ratings for ${restaurant.name}`,

    keywords: seo?.keywords ?? [],

    openGraph: {
      title: `Reviews | ${restaurant.name}`,
      description:
        seo?.meta_description ??
        `Read customer reviews and ratings for ${restaurant.name}`,
      type: 'website',
      siteName: restaurant.name,
    },

    twitter: {
      card: 'summary_large_image',
      title: `Reviews | ${restaurant.name}`,
      description:
        seo?.meta_description ??
        `Read customer reviews and ratings for ${restaurant.name}`,
    },

    alternates: {
      canonical: seo?.canonical_url ?? '',
    },

    robots: seo?.robots ?? 'index,follow',
  };
}

export default async function ReviewPage({
  params,
}: PageProps) {
   const headersList = await headers()

  // Testing ko lagi ?? '8' — production ma hatauney
const restaurantId = Number(headersList.get('x-restaurant-id') ?? '8');
  if (!restaurantId) return notFound();

  const restaurant = await getRestaurantDetail(restaurantId);

  if (!restaurant) return notFound();

  return (
    <div className="min-h-screen bg-white">
      
      {/* ── HERO HEADER ── */}
      <div className="relative w-full h-36 sm:h-32 bg-secondary overflow-hidden">
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[secondary]/80 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
              Reviews of {restaurant.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-2">

              <span className="text-sm text-white/75">
                Customer feedback & ratings
              </span>

              {restaurant.address && (
                <>
                  <span className="text-white/40 text-xs">•</span>

                  <span className="text-sm text-white/75 truncate max-w-xs">
                    {restaurant.address}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <div className="flex items-center gap-2.5">
            
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-base">
              ⭐
            </div>

            <div>
              <h2 className="text-lg font-bold text-secondary leading-none">
                Customer Reviews
              </h2>

              <p className="text-xs text-secondary mt-0.5">
                What people are saying
              </p>
            </div>
          </div>
        </div>

        {/* ── REVIEW SECTION ── */}
        <ReviewSection restaurantId={restaurantId} />

      </div>
    </div>
  );
}