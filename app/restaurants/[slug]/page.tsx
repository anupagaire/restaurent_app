import { notFound } from 'next/navigation';
import Image from 'next/image';
import RestaurantTabs from '@/components/home/RestaurantTabs';
import { Eye } from 'lucide-react';
import type { Metadata } from 'next';
import RestaurantAbout from '@/components/restaurant/RestaurantAbout';
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
    title: seo?.title,
    description: seo?.meta_description,
    keywords: seo?.keywords ?? [],

    openGraph: {
      title: seo?.open_graph?.['og:title'],
      description: seo?.open_graph?.['og:description'],
      type: 'website',
      url: seo?.open_graph?.['og:url'] ?? pageUrl,
      siteName: seo?.open_graph?.['og:site_name'],
      ...(coverPhoto && {
        images: [{ url: coverPhoto, width: 1200, height: 630, alt: restaurant.name }],
      }),
    },

    twitter: {
      card: seo?.twitter?.['twitter:card'] as any ?? 'summary_large_image',
      title: seo?.twitter?.['twitter:title'],
      description: seo?.twitter?.['twitter:description'],
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
interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ApiPhoto {
  id: number;
  object_id: number;
  photo_url: string;
}

interface ApiMenu {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: number;
  category_name?: string;
  status: boolean;
  photos?: ApiPhoto[];
}

interface ApiRestaurant {
  id: number;
  name: string;
  view_count: number;
  availability?: string | null;
  address: string;
  city: string;
  zip?: string | null;
  photos: ApiPhoto[];
  categories: { id: number; name: string; status: boolean }[];
  menus: ApiMenu[];
  status?: boolean;
  seo?: {                                      
    title?: string;
    meta_description?: string;
    keywords?: string[];
    canonical_url?: string;
    robots?: string;
    json_ld?: any;
    open_graph?: Record<string, string>;
    twitter?: Record<string, string>;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function resolveUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function getRestaurantIdBySlug(slug: string): Promise<number | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/restaurant/?status=true&page_size=1000`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.results ?? [];
    const found = list.find((r: any) => toSlug(r.name) === slug);
    return found?.id ?? null;
  } catch {
    return null;
  }
}

async function getRestaurantDetail(id: number): Promise<ApiRestaurant | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/restaurant/${id}/`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;

  const restaurantId = await getRestaurantIdBySlug(slug);
  if (!restaurantId) return notFound();

  const restaurant = await getRestaurantDetail(restaurantId);
  if (!restaurant) return notFound();

  // Category id → name map
  const categoryMap = Object.fromEntries(
    (restaurant.categories ?? []).map((cat: any) => [cat.id, cat.name])
  );

  const activeMenus = (restaurant.menus ?? []).filter((item) => item.status);

  const menuItems = activeMenus.map((item) => {
    const nestedPhotoUrl = item.photos?.[0]?.photo_url ?? null;
    const resolvedPhoto = resolveUrl(nestedPhotoUrl);

    return {
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: parseFloat(item.price),
      image: resolvedPhoto,
      category: item.category_name || categoryMap[item.category] || 'Other',
    };
  });

 
  const restaurantImage = resolveUrl(restaurant.photos?.[0]?.photo_url) ?? '/placeholder-restaurant.jpg';

  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh' }}>
      {restaurant.seo?.json_ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(restaurant.seo.json_ld),
          }}
        />
      )}

      {/* Hero Section */}
<div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
  <Image
    src={restaurantImage}
    alt={restaurant.name}
    fill
    priority
    style={{ objectFit: 'cover' }}
  />
  {/* Gradient overlay */}
  <div className="absolute inset-0" style={{
    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
  }} />

  {/* Content */}
  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
    <h1 style={{
      fontFamily: 'Georgia,"Times New Roman",serif',
      fontSize: 'clamp(2rem,4vw,3.5rem)',
      fontWeight: 700,
      color: '#fff',
      lineHeight: 1.1,
      marginBottom: 16,
      textShadow: '0 2px 12px rgba(0,0,0,0.4)',
    }}>
      {restaurant.name}
    </h1>

    <div className="flex flex-wrap items-center gap-3">
      {restaurant.view_count > 0 && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff' }}>
          <Eye size={13} />
          {restaurant.view_count >= 1000
            ? `${(restaurant.view_count / 1000).toFixed(1)}k views`
            : `${restaurant.view_count} views`}
        </span>
      )}
      {restaurant.availability && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff' }}>
          🕒 {restaurant.availability}
        </span>
      )}
      {restaurant.address && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff' }}>
          📍 {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}
        </span>
      )}
    </div>
  </div>
</div>
<RestaurantAbout restaurant={restaurant} />
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 24px 80px' }}>
        <RestaurantTabs
          menuItems={menuItems}
          restaurantId={restaurantId}
        />
      </div>

    </div>
  );
}