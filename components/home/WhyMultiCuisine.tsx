// WhyMultiCuisine.tsx (Server Component)
import WhyMultiCuisineClient, { AboutSectionsData } from './WhyMultiCuisineClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function WhyMultiCuisine() {
  let data: AboutSectionsData | null = null;

  try {
    // Fetch data on the server BEFORE rendering
    const res = await fetch(`${BASE_URL}/api/v1/website-content/about-sections/`, {
      next: { revalidate: 3600 }, // Optional: caches data for 1 hour to speed up loads
    });
    
    if (res.ok) {
      data = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch about sections data:", error);
  }

  // If the API fails, return null or a fallback UI
  if (!data) return null;

  // Pass the fully loaded data as props to the Client Component
  return <WhyMultiCuisineClient initialData={data} />;
}