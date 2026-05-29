// lib/restaurant.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function getRestaurantIdBySlug(slug: string): Promise<number | null> {
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

export async function getRestaurantDetail(id: number) {
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