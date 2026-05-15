'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Restaurant {
  id: number;
  name: string;
  city: string;
  status: boolean;
  availability: string;
  photos: { id: number; photo_url: string }[];
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function resolvePhoto(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ── Fetch average rating from API ────────────────────────────
async function fetchAvgRating(restaurantId: number): Promise<{ avg: number; count: number }> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/restaurant-reviews/?restaurant=${restaurantId}&page_size=200`,
      { cache: 'no-store' }
    );
    if (!res.ok) return { avg: 0, count: 0 };
    const data = await res.json();
    const reviews: { rating: number; parent: number | null }[] = data.results ?? [];
    const topLevel = reviews.filter((r) => r.parent === null);
    if (topLevel.length === 0) return { avg: 0, count: 0 };
    const avg = topLevel.reduce((s, r) => s + r.rating, 0) / topLevel.length;
    return { avg, count: topLevel.length };
  } catch {
    return { avg: 0, count: 0 };
  }
}

// ── Star Rating — database ma save ───────────────────────────
function StarRating({ restaurantId }: { restaurantId: number }) {
  const [myRating, setMyRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  const loadAvg = () => {
    fetchAvgRating(restaurantId).then(({ avg, count }) => {
      setAvg(avg);
      setCount(count);
    });
  };

  useEffect(() => {
    loadAvg();
  }, [restaurantId]);

  const handleRate = async (val: number) => {
    if (submitting) return;
    setMyRating(val);
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/restaurant-reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant: restaurantId,
          rating: val,
          review: '[Quick rating]',
          is_published: true,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        // avg refresh gara
        setTimeout(() => loadAvg(), 500);
      } else {
        setMyRating(0);
      }
    } catch {
      setMyRating(0);
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hover || myRating;

  return (
    <div onClick={(e) => e.preventDefault()}>
      {/* Average rating */}
      {count > 0 && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-amber-800">{avg.toFixed(1)}</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className="text-xs"
                style={{ color: s <= Math.round(avg) ? '#f59e0b' : '#d1d5db' }}
              >★</span>
            ))}
          </div>
          <span className="text-[10px] text-gray-400">({count} reviews)</span>
        </div>
      )}

      {/* My rating */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 mb-1">
          {submitted ? 'Your rating:' : 'Rate this place:'}
        </p>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={submitted || submitting}
              onMouseEnter={() => !submitted && setHover(star)}
              onMouseLeave={() => !submitted && setHover(0)}
              onClick={() => !submitted && handleRate(star)}
              className="text-base leading-none focus:outline-none transition-transform hover:scale-110 disabled:cursor-default"
              aria-label={`Rate ${star} stars`}
            >
              <span style={{ color: star <= displayRating ? '#f59e0b' : '#d1d5db' }}>★</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] mt-0.5 text-gray-400">
          {submitting ? 'Saving...' : submitted ? `Saved ${myRating} ★` : 'Tap to rate'}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function FeaturedRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE_URL}/api/v1/restaurant/?status=true&page_size=8`,
          { cache: 'no-store' }
        );
        if (!res.ok) { setRestaurants([]); return; }
        const data = await res.json();
        setRestaurants(data.results ?? []);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-serif text-center text-[#5D0565] mb-10">
          Featured Restaurants
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <p className="text-center text-gray-500">No restaurants available at the moment</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => {
              const photo = resolvePhoto(restaurant.photos?.[0]?.photo_url);
              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${toSlug(restaurant.name)}`}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="relative h-40 bg-gray-100">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={restaurant.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl bg-gray-50">
                        🍽️
                      </div>
                    )}
                    {restaurant.availability && !/^\d{4}-\d{2}-\d{2}/.test(restaurant.availability) && (
                      <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {restaurant.availability}
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-[#513012] text-sm leading-tight line-clamp-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">📍 {restaurant.city}</p>
                    <StarRating restaurantId={restaurant.id} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}