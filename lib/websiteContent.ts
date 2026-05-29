
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getWebsiteContent() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/website-content/all/`, {
      next: { revalidate: 3600 }, // 1 hour cache
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}