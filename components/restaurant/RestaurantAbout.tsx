import Image from 'next/image';

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

function resolveUrl(url?: string | null): string | null {
  if (!url) return null;

  if (url.startsWith('http')) return url;

  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function RestaurantAbout({
  restaurant,
}: RestaurantAboutProps) {
  const coverPhoto =
    resolveUrl(restaurant.photos?.[0]?.photo_url) ??
    '/placeholder-restaurant.jpg';

  return (
    <div style={{ background: '#faf8f5' }}>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Location */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 text-lg mb-3">
              📍 Location
            </h2>

            <p className="text-gray-600">
              {restaurant.address}, {restaurant.city}
            </p>

            {restaurant.zip && (
              <p className="text-gray-400 text-sm mt-2">
                ZIP: {restaurant.zip}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 text-lg mb-3">
              ℹ️ Details
            </h2>

            <div className="space-y-2">
              {restaurant.availability && (
                <p className="text-gray-600">
                  🕒 {restaurant.availability}
                </p>
              )}

              {restaurant.amenities && (
                <p className="text-gray-600">
                  ✨ {restaurant.amenities}
                </p>
              )}

              {restaurant.table_count &&
                restaurant.table_count > 0 && (
                  <p className="text-gray-600">
                    🪑 {restaurant.table_count} tables
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 text-lg mb-3">
              About Us
            </h2>

            <p className="text-gray-600 leading-relaxed">
              {restaurant.description}
            </p>
          </div>
        )}

        {/* Gallery */}
        {restaurant.photos && restaurant.photos.length > 1 && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-4">
              Gallery
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {restaurant.photos.slice(0, 6).map((photo) => {
                const url = resolveUrl(photo.photo_url);

                if (!url) return null;

                return (
                  <div
                    key={photo.id}
                    className="relative h-40 rounded-xl overflow-hidden"
                  >
                    <Image
                      src={url}
                      alt={restaurant.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}