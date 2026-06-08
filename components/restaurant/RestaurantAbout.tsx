import Link from 'next/link';
import RestaurantPhotoSlider from './RestaurantPhotoSlider';
import { MapPin, Clock, Users, Star, Utensils, ChevronRight, Sparkles } from 'lucide-react';

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

export default function RestaurantAbout({ restaurant }: RestaurantAboutProps) {
  const locationParts = [restaurant.address, restaurant.city, restaurant.zip].filter(Boolean);

  const amenitiesList = restaurant.amenities
    ? restaurant.amenities.split(',').map((a) => a.trim()).filter(Boolean)
    : [];

  const slug = toSlug(restaurant.name);

  return (
    <div className=" overflow-hidden">

      {/* ── HERO ABOUT HEADER ── */}
      <div className="relative px-6 sm:px-10 lg:px-20 pt-20 pb-16 overflow-hidden">
        {/* Decorative grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px',
          }}
        />

        {/* Large decorative circle */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#c8914a]/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#c8914a]/5 blur-2xl" />

        <div className="relative max-w-6xl mx-auto">
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-10 bg-[#c8914a]" />
            <span className="text-[#c8914a] text-xs tracking-[0.4em] uppercase font-light">
              Our Story
            </span>
          </div>

          {/* Headline */}
          <div className="mb-6">
            <h2
              className="font-light leading-[0.95] tracking-tight"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 7rem)',
                fontFamily: '"Playfair Display", Georgia, serif',
              }}
            >
              Welcome to
            </h2>
            <h2
              className="leading-[0.95] tracking-tight"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 7rem)',
                fontFamily: '"Playfair Display", Georgia, serif',
                color: '#c8914a',
                fontStyle: 'italic',
              }}
            >
              {restaurant.name}
            </h2>
          </div>

          <p className="text-white/40 text-base sm:text-lg font-light max-w-xl leading-relaxed">
            Experience authentic flavors and warm hospitality in the heart of{' '}
            <span className="text-white/70">{restaurant.city}</span>
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT — Asymmetric Split ── */}
      <div className="px-6 sm:px-10 lg:px-20 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

          {/* LEFT: Story — wider */}
          <div className="lg:col-span-3 text-black border border-[#c8914a]/10 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#c8914a]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#c8914a]/30 rounded-br-2xl" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-4 h-4 " />
                <span className=" text-xs tracking-[0.3em] uppercase font-light">
                  About Us
                </span>
              </div>

              <p
                className=" leading-[1.9] text-base sm:text-lg font-light mb-8"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {restaurant.description ||
                  "We're passionate about serving delicious food made with fresh, quality ingredients. Our team is dedicated to providing you with an unforgettable dining experience."}
              </p>

              {/* Location pill */}
              {locationParts.length > 0 && (
                <div className="inline-flex items-center gap-3 px-5 py-3 bg-[#c8914a]/10 border border-[#c8914a]/20 rounded-full">
                  <MapPin className="w-4 h-4 " />
                  <span className=" text-sm font-light">
                    {locationParts.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Quick Info — narrower, stacked */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Hours */}
            {restaurant.availability && (
              <div className="bg-[#c8914a] rounded-2xl p-6 sm:p-8 text-[#0e0b07] relative overflow-hidden">
                <div className="absolute top-3 right-4 text-[#0e0b07]/10 text-6xl font-black leading-none select-none">
                  ◷
                </div>
                <div className="relative">
                  <Clock className="w-5 h-5 mb-3 text-[#0e0b07]/60" />
                  <p className="text-xs tracking-[0.3em] uppercase font-semibold text-[#0e0b07]/60 mb-1">
                    Opening Hours
                  </p>
                  <p className="text-[#0e0b07] text-lg font-semibold leading-snug">
                    {restaurant.availability}
                  </p>
                </div>
              </div>
            )}

            {/* Tables */}
            {restaurant.table_count && restaurant.table_count > 0 && (
              <div className="bg-[#c8914a] border border-[#c8914a]/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-3 right-4 text-white/5 text-7xl font-black leading-none select-none">
                  {restaurant.table_count}
                </div>
                <div className="relative">
                  <Users className="w-5 h-5 mb-3 text-[#c8914a]" />
                  <p className="text-xs tracking-[0.3em] uppercase font-light mb-1">
                    Capacity
                  </p>
                  <p className=" text-2xl font-light">
                    {restaurant.table_count}{' '}
                    <span >tables</span>
                  </p>
                </div>
              </div>
            )}

            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <div className="bg-[#c8914a] border border-[#c8914a]/10 rounded-2xl p-6 sm:p-8">
                <Utensils className="w-5 h-5 mb-3 text-[#c8914a]" />
                <p className="text-xs tracking-[0.3em] uppercase font-light  mb-4">
                  Amenities
                </p>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xsfont-light hover:border-[#c8914a]/40 hover:text-white/80 transition-colors duration-300"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── GALLERY SECTION ── */}
      {restaurant.photos && restaurant.photos.length > 0 && (
        <div className="px-6 sm:px-10 lg:px-20 pb-20 max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#c8914a]" />
                <span className="text-[#c8914a] text-xs tracking-[0.4em] uppercase font-light">
                  Gallery
                </span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-lightleading-tight"
              >
                Inside Our World
              </h2>
            </div>

            <Link
              href={`/restaurants/${slug}/gallery`}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 border border-[#c8914a]/40 text-[#c8914a] rounded-full text-sm font-light hover:bg-[#c8914a] hover:text-[#0e0b07] transition-all duration-300 group"
            >
              View All ({restaurant.photos.length})
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Slider */}
          <div className="rounded-2xl overflow-hidden border border-[#c8914a]/10">
            <RestaurantPhotoSlider
              photos={restaurant.photos}
              restaurantName={restaurant.name}
            />
          </div>

          {/* Mobile button */}
          <Link
            href={`/restaurants/${slug}/gallery`}
            className="sm:hidden mt-4 flex items-center justify-center gap-2 w-full px-5 py-3 border border-[#c8914a]/40 text-[#c8914a] rounded-full text-sm font-light hover:bg-[#c8914a] hover:text-[#0e0b07] transition-all duration-300"
          >
            View All Photos ({restaurant.photos.length})
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── CTA SECTION ── */}
      <div className="px-6 sm:px-10 lg:px-20 pb-20 max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c8914a] via-[#a8722e] to-[#7a4f1a]" />
          {/* Texture */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '150px',
            }}
          />
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-black/20 blur-2xl" />

          <div className="relative px-8 sm:px-12 py-12 sm:py-16 text-center">
            <p className="text-[#0e0b07]/60 text-xs tracking-[0.4em] uppercase font-light mb-4">
              Reserve Your Experience
            </p>
            <h3
              className="text-[#0e0b07] font-light leading-tight mb-3"
              style={{
                fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
                fontFamily: '"Playfair Display", Georgia, serif',
              }}
            >
              Ready to Dine With Us?
            </h3>
            <p className="text-[#0e0b07]/70 mb-10 max-w-xl mx-auto font-light text-base sm:text-lg leading-relaxed">
              Book your table now and experience the best of{' '}
              <span className="text-[#0e0b07] font-medium">{restaurant.city}</span>'s culinary scene
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/restaurants/${slug}/menu`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0e0b07] text-[#c8914a] rounded-full font-medium text-sm hover:bg-[#1a1208] transition-all duration-300 group"
              >
                <Utensils className="w-4 h-4" />
                View Menu
              </Link>
              <Link
                href={`/restaurants/${slug}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent text-[#0e0b07] border-2 border-[#0e0b07]/30 rounded-full font-medium text-sm hover:bg-[#0e0b07]/10 transition-all duration-300"
              >
                More Details
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}