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

export async function getMenuItemRatings(menuItemIds: number[]) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const results = await Promise.all(
    menuItemIds.map(async (id) => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/menu-reviews/?menu=${id}&page_size=200`, // ← menu-reviews, not restaurant-reviews
          { cache: 'no-store' }
        );
        if (!res.ok) return { id, avg: 0, count: 0 };
        const data = await res.json();
        const reviews = (data.results ?? []).filter(
          (r: any) => r.parent === null || r.parent === undefined
        );
        if (reviews.length === 0) return { id, avg: 0, count: 0 };
        const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
        return { id, avg, count: reviews.length };
      } catch {
        return { id, avg: 0, count: 0 };
      }
    })
  );

  return results;
}