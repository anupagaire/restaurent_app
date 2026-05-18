import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RestaurantTabs from '@/components/home/RestaurantTabs';
import { Eye } from 'lucide-react';

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
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ── Resolve any URL to an absolute URL ──────────────────────────────────────
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

  // Restaurant cover photo
  const restaurantImage = resolveUrl(restaurant.photos?.[0]?.photo_url) ?? '/placeholder-restaurant.jpg';

  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div className="flex flex-col md:flex-row h-auto md:h-[500px] overflow-hidden rounded-2xl">
        {/* Cover image */}
        <div className="relative w-full h-64 md:w-1/2 md:h-full">
          <Image
            src={restaurantImage}
            alt={restaurant.name}
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Info panel */}
        <div
          className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #513012, #47034E, #5D0565)' }}
        >
          
          <h1
            style={{
              fontFamily: 'Georgia,"Times New Roman",serif',
              fontSize: 'clamp(2rem,3vw,3rem)',
              fontWeight: 700,
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            {restaurant.name}
          </h1>
          {restaurant.view_count > 0 && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
    <Eye size={14} color="rgba(255,255,255,0.7)" />
    <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>
      {restaurant.view_count >= 1000
        ? `${(restaurant.view_count / 1000).toFixed(1)}k views`
        : `${restaurant.view_count} views`}
    </span>
  </div>
)}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {restaurant.availability && (
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 24, padding: '8px 14px', fontSize: 13,
                }}
              >
                🕒 {restaurant.availability}
              </span>
            )}
            {restaurant.address && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.9 }}>
                📍 {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu section */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 80px' }}>
        <RestaurantTabs
          menuItems={menuItems}
          restaurantId={restaurantId}
        />
      </div>

      <Footer />
    </div>
  );
}