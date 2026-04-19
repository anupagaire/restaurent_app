
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { restaurants } from '@/data/mockData';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params; 

  const restaurant = restaurants.find(
    (r) => r.slug === slug
  );

  if (!restaurant) {
    return notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* HERO */}
      <div className="relative h-[300px]">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/50 flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-4xl font-bold">
              {restaurant.name}
            </h1>
            <p className="text-sm opacity-90">
              {restaurant.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* INFO */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
          <span>📍 {restaurant.address}</span>
          <span>📞 {restaurant.phone}</span>
          <span>⭐ {restaurant.rating} ({restaurant.reviewCount})</span>
          <span>🕒 {restaurant.openingHours}</span>
        </div>

        {/* MENU */}
        <h2 className="text-3xl font-bold text-[#513012] mb-6">
          Menu
        </h2>

        {restaurant.menuItems.length === 0 ? (
          <p className="text-gray-500">No menu available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurant.menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden flex"
              >
                <div className="relative w-32 h-32">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-[#513012]">
                      Rs. {item.price}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}