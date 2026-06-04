import Link from 'next/link';
import RestaurantPhotoSlider from './RestaurantPhotoSlider';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface RestaurantAboutProps {
  restaurant: {
    name: string;
    address: string;
    city: string;
    zip?: string | null;
    availability?: string | null;
    description?: string | null;
    amenities?: string | null;
    table_count?: number;
    photos?: {
      id: number;
      photo_url: string;
    }[];
  };
}
function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
function resolveUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function RestaurantAbout({ restaurant }: RestaurantAboutProps) {
  // Build a natural paragraph from location + details
  const locationParts = [restaurant.address, restaurant.city, restaurant.zip ? `ZIP: ${restaurant.zip}` : null].filter(Boolean);
  const detailParts = [
    restaurant.availability ? `Open: ${restaurant.availability}` : null,
    restaurant.amenities ? `Amenities include ${restaurant.amenities}` : null,
    restaurant.table_count && restaurant.table_count > 0 ? `We have ${restaurant.table_count} tables available` : null,
  ].filter(Boolean);

  const aboutParagraph = [
    locationParts.length ? `We are located at ${locationParts.join(', ')}.` : '',
    detailParts.length ? detailParts.join('. ') + '.' : '',
  ].filter(Boolean).join(' ');

  return (
    <div style={{ background: '#faf8f5' }}>
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 text-lg mb-3">About Us</h2>
          <p className="text-gray-600 leading-relaxed">{aboutParagraph}</p>

          {/* Description below if exists */}
          {restaurant.description && (
            <p className="text-gray-600 leading-relaxed mt-4">
              {restaurant.description}
            </p>
          )}
        </div>

     {restaurant.photos && restaurant.photos.length > 0 && (
  <div>
    <h2 className="font-bold text-gray-800 text-lg mb-4">Gallery</h2>
    
    <RestaurantPhotoSlider 
      photos={restaurant.photos} 
      restaurantName={restaurant.name} 
    />

   <Link
  href={`/restaurants/${toSlug(restaurant.name)}/gallery`}
  className="inline-flex mt-6 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition"
>
  View All Photos
</Link>
  </div>
)}      </div>
    </div>
  );
}