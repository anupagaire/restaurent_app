
import { notFound } from 'next/navigation';
import RestaurantNavbar from '@/components/restaurant/RestaurantNavbar';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function getRestaurantBySlug(slug: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/restaurant/?status=true&page_size=1000`, {
      cache: 'no-store',
    });
    const data = await res.json();
    const list = data.results ?? [];
    const found = list.find((r: any) => toSlug(r.name) === slug);
    if (!found) return null;

    const detail = await fetch(`${BASE_URL}/api/v1/restaurant/${found.id}/`, {
      cache: 'no-store',
    });
    return await detail.json();
  } catch {
    return null;
  }
}

export default async function RestaurantSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return notFound();

  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh' }}>
      <RestaurantNavbar restaurant={restaurant} slug={slug} />
      
      {children}
  </div>
  );
}