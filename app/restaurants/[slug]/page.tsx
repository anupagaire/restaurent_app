import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MenuSection from '@/components/menu/MenuSection';
import RestaurantTabs from '@/components/home/RestaurantTabs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ApiMenu {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: number;
  category_name?: string;
  image?: string;
  status: boolean;
  
}


interface ApiPhoto {
  id: number;
  object_id: number;
  photo_url: string;
  // type field may or may not be present
}

interface ApiRestaurant {
  id: number;
  name: string;
  availability?: string | null;
  address: string;
  city: string;
  zip?: string | null;
  photos: { id: number; photo: string }[];
  categories: { id: number; name: string; status: boolean }[];
  menus: ApiMenu[];
  status?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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

async function getMenuPhotoMap(menuIds: number[]): Promise<Record<number, string>> {
  if (menuIds.length === 0) return {};

  try {
    // Try fetching for each menu ID explicitly using object_id filter
    const params = new URLSearchParams({
      type: 'menu',
      page_size: '1000',
    });

    const res = await fetch(`${BASE_URL}/api/v1/photo/?${params}`, {
      cache: 'no-store',
    });

    if (!res.ok) return {};

    const data = await res.json();
    // Handle paginated response
    const photos: ApiPhoto[] = Array.isArray(data) ? data : data.results ?? [];

    console.log("Total photos fetched:", photos.length);
    console.log("All object_ids in photos:", photos.map(p => p.object_id));
    console.log("Menu IDs we need:", menuIds);

    const map: Record<number, string> = {};
    for (const photo of photos) {
      const objId = Number(photo.object_id);
      if (menuIds.includes(objId) && photo.photo_url) {
        if (!map[objId]) {
          map[objId] = photo.photo_url;
        }
      }
    }

    console.log("Final photo map:", map);
    return map;
  } catch (err) {
    console.error("Failed to fetch menu photos:", err);
    return {};
  }
}
export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;

  const restaurantId = await getRestaurantIdBySlug(slug);
  if (!restaurantId) return notFound();

  const restaurant = await getRestaurantDetail(restaurantId);
  if (!restaurant) return notFound();

  const categoryMap = Object.fromEntries(
    (restaurant.categories ?? []).map((cat: any) => [cat.id, cat.name])
  );

  const activeMenus = (restaurant.menus ?? []).filter((item: ApiMenu) => item.status);

  const menuItems = activeMenus.map((item: ApiMenu) => {
  const validPhoto = item.photos?.find(p => p.photo_url !== null)?.photo_url ?? null;
  const resolvedPhoto = validPhoto
    ? (validPhoto.startsWith('http') ? validPhoto : `${BASE_URL}${validPhoto}`)
    : null;
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: parseFloat(item.price),
    image: resolvedPhoto, 
    category: item.category_name || categoryMap[item.category] || 'Other',
  };
});
const restaurantImage = (restaurant.photos?.[0] as any)?.photo_url || '/placeholder-restaurant.jpg';

  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh' }}>
      <Navbar />

    
        <div
  className="
    flex flex-col md:flex-row
    h-auto md:h-[500px]
    overflow-hidden
    rounded-2xl
  "
>
        {/* Restaurant Hero Image */}
<div className="relative w-full h-64 md:w-1/2 md:h-full">
          <Image
            src={restaurantImage}
            alt={restaurant.name}
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>

   <div
  className="
    w-full md:w-1/2
    p-6 md:p-12
    flex flex-col justify-center
    text-white
  "
  style={{
    background: 'linear-gradient(135deg, #513012, #47034E, #5D0565)',
  }}
>
          <h1 style={{ fontFamily: 'Georgia,"Times New Roman",serif', fontSize: 'clamp(2rem,3vw,3rem)', fontWeight: 700, marginBottom: 16, lineHeight: 1.1 }}>
            {restaurant.name}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {restaurant.availability && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 24, padding: '8px 14px', fontSize: 13 }}>
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