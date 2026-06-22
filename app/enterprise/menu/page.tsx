import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';



import { fetchRestaurantById } from '@/lib/restaurant'
import { headers } from 'next/headers'



import MenuSection from '@/components/menu/MenuSection';
import {
  getRestaurantDetail,
  getRestaurantIdBySlug,
  getMenuItemRatings,
} from '@/lib/restaurant';
import { resolveUrl } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurantId = await getRestaurantIdBySlug(slug);
  if (!restaurantId) return { title: 'Restaurant Not Found' };

  const restaurant = await getRestaurantDetail(restaurantId);
  if (!restaurant) return { title: 'Restaurant Not Found' };

  const seo = restaurant.seo;
  const coverPhoto = seo?.open_graph?.['og:image'] ?? resolveUrl(restaurant.photos?.[0]?.photo_url);
  const pageUrl = seo?.canonical_url ?? '';

  return {
    title: seo?.title ?? restaurant.name,
    description: seo?.meta_description ?? `Explore the menu of ${restaurant.name}`,
    keywords: seo?.keywords ?? [],
    openGraph: {
      title: seo?.open_graph?.['og:title'] ?? restaurant.name,
      description: seo?.open_graph?.['og:description'] ?? seo?.meta_description,
      type: 'website',
      url: seo?.open_graph?.['og:url'] ?? pageUrl,
      siteName: seo?.open_graph?.['og:site_name'] ?? restaurant.name,
      ...(coverPhoto && { images: [{ url: coverPhoto, width: 1200, height: 630, alt: restaurant.name }] }),
    },
    twitter: {
      card: (seo?.twitter?.['twitter:card'] as 'summary' | 'summary_large_image') ?? 'summary_large_image',
      title: seo?.twitter?.['twitter:title'] ?? restaurant.name,
      description: seo?.twitter?.['twitter:description'] ?? seo?.meta_description,
      ...(seo?.twitter?.['twitter:image'] && { images: [seo.twitter['twitter:image']] }),
    },
    alternates: { canonical: pageUrl },
    robots: seo?.robots ?? 'index,follow',
  };
}


export default async function MenuPage({ params }: PageProps) {
  const { slug } = await params;
  // const restaurantId = await getRestaurantIdBySlug(slug);
 
  const headersList = await headers()
const restaurantId = Number(headersList.get('x-restaurant-id'));
 if (!restaurantId) return notFound();
  const restaurant = await getRestaurantDetail(restaurantId);
  if (!restaurant) return notFound();

  const categoryMap = Object.fromEntries(
    (restaurant.categories ?? []).map((cat: any) => [cat.id, cat.name])
  );

  const activeMenus = (restaurant.menus ?? []).filter((item: any) => item.status);

const menuItems: {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}[] = activeMenus.map((item: any) => ({
      id: item.id,
    name: item.name,
    description: item.description || '',
    price: parseFloat(item.price),
    image: resolveUrl(item.photos?.[0]?.photo_url),
    category: item.category_name || categoryMap[item.category] || 'Other',
  }));

  const ratings = await getMenuItemRatings(menuItems.map((m) => m.id));
  const ratingsById = Object.fromEntries(ratings.map((r) => [r.id, r]));

  const topRated = [...menuItems]
    .filter((m) => (ratingsById[m.id]?.count ?? 0) > 0)
    .sort((a, b) => (ratingsById[b.id]?.avg ?? 0) - (ratingsById[a.id]?.avg ?? 0))
    .slice(0, 3);

  const totalItems = activeMenus.length;

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO HEADER ── */}
      <div className="relative w-full h-36 sm:h-32 bg-secondary overflow-hidden">
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[secondary]/80 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
             Menu of {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              
              <span className="text-white/40 text-xs">•</span>
              <span className="text-sm text-white/75">
                {totalItems} items
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {topRated.length > 0 && (
          <div className="pt-8 pb-2">
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-base">
                  ⭐
                </div>
                <div>
                  <h2 className="text-lg font-bold text-secondary leading-none">
                    Top Rated
                  </h2>
                  <p className="text-xs text-secondary mt-0.5">
                    Loved by customers
                  </p>
                </div>
              </div>
              <span className="text-xs bg-secondary border border-accent text-white px-3 py-1 rounded-full font-medium">
                Customer picks
              </span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topRated.map((item, index) => {
                const rating = ratingsById[item.id];
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div
                    key={item.id}
                    className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-accent hover:shadow-md transition-all duration-200 flex gap-0"
                  >
                    {/* Left: image */}
                    <div className="relative w-28 shrink-0 bg-accent">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🍽️
                        </div>
                      )}
                      {/* Medal badge */}
                      <span className="absolute top-2 left-2 text-lg leading-none drop-shadow">
                        {medals[index]}
                      </span>
                    </div>

                    {/* Right: info */}
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-secondary">
                          Rs. {item.price.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 bg-accent px-2 py-0.5 rounded-full">
                          <span className="text-accent text-xs">★</span>
                          <span className="text-xs font-bold text-white">
                            {rating.avg.toFixed(1)}
                          </span>
                          <span className="text-xs text-secondary">
                            ({rating.count})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider into menu */}
            <div className="flex items-center gap-3 mt-8 mb-2">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-secondary font-medium px-2">Full Menu</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          </div>
        )}

        <MenuSection
          menuItems={menuItems}
          restaurantId={restaurantId}
          acceptsOnlineOrders={true}
        />
      </div>
    </div>
  );
}