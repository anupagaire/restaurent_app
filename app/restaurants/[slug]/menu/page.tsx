import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import MenuSection from '@/components/menu/MenuSection';
import {
  getRestaurantDetail,
  getRestaurantIdBySlug,
} from '@/lib/restaurant';

import { resolveUrl } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;  
  const restaurantId = await getRestaurantIdBySlug(slug); 

  if (!restaurantId) {
    return { title: 'Restaurant Not Found' };
  }

  const restaurant = await getRestaurantDetail(restaurantId);

  if (!restaurant) {
    return { title: 'Restaurant Not Found' };
  }

  const seo = restaurant.seo;

  const coverPhoto =
    seo?.open_graph?.['og:image'] ??
    resolveUrl(restaurant.photos?.[0]?.photo_url);

  const pageUrl = seo?.canonical_url ?? '';

  return {
    title: seo?.title ?? restaurant.name,
    description:
      seo?.meta_description ??
      `Explore the menu of ${restaurant.name}`,

    keywords: seo?.keywords ?? [],

    openGraph: {
      title:
        seo?.open_graph?.['og:title'] ??
        restaurant.name,

      description:
        seo?.open_graph?.['og:description'] ??
        seo?.meta_description,

      type: 'website',
      url:
        seo?.open_graph?.['og:url'] ??
        pageUrl,

      siteName:
        seo?.open_graph?.['og:site_name'] ??
        restaurant.name,

      ...(coverPhoto && {
        images: [
          {
            url: coverPhoto,
            width: 1200,
            height: 630,
            alt: restaurant.name,
          },
        ],
      }),
    },

    twitter: {
      card:
        (seo?.twitter?.['twitter:card'] as
          | 'summary'
          | 'summary_large_image') ??
        'summary_large_image',

      title:
        seo?.twitter?.['twitter:title'] ??
        restaurant.name,

      description:
        seo?.twitter?.['twitter:description'] ??
        seo?.meta_description,

      ...(seo?.twitter?.['twitter:image'] && {
        images: [seo.twitter['twitter:image']],
      }),
    },

    alternates: {
      canonical: pageUrl,
    },

    robots: seo?.robots ?? 'index,follow',
  };
}

export default async function MenuPage({ params }: PageProps) {
  const { slug } = await params;  
  const restaurantId = await getRestaurantIdBySlug(slug);

  if (!restaurantId) return notFound();

  const restaurant = await getRestaurantDetail(
    restaurantId
  );

  if (!restaurant) return notFound();

  const categoryMap = Object.fromEntries(
    (restaurant.categories ?? []).map(
      (cat: any) => [cat.id, cat.name]
    )
  );

  const activeMenus = (restaurant.menus ?? []).filter(
    (item: any) => item.status
  );

  const menuItems = activeMenus.map((item: any) => {
    const resolvedPhoto = resolveUrl(
      item.photos?.[0]?.photo_url
    );

    return {
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: parseFloat(item.price),
      image: resolvedPhoto,
      category:
        item.category_name ||
        categoryMap[item.category] ||
        'Other',
    };
  });

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <MenuSection
          menuItems={menuItems}
          restaurantId={restaurantId}
          acceptsOnlineOrders={true}
        />
      </div>
    </div>
  );
}