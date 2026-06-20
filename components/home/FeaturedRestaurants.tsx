'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Eye } from 'lucide-react';
import SectionHeader from '@/components/layout/SectionHeader';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Restaurant {
  id: number;
  name: string;
  city: string;
  status: boolean;
  availability: string;
  view_count: number;
  coverPhotoUrl?: string | null;
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function resolvePhoto(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = BASE_URL?.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function fetchCoverPhoto(restaurantId: number): Promise<string | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/photo/?type=restaurant&object_id=${restaurantId}&purpose=cover`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const photo = data.results?.[0];
    return photo?.photo_url ?? null;
  } catch {
    return null;
  }
}

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

// ── Star Rating ──────────────────────────────────────────────
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

  useEffect(() => { loadAvg(); }, [restaurantId]);

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
      if (res.ok) { setSubmitted(true); setTimeout(() => loadAvg(), 500); }
      else setMyRating(0);
    } catch { setMyRating(0); }
    finally { setSubmitting(false); }
  };

  const displayRating = hover || myRating;

  return (
    <div onClick={(e) => e.preventDefault()} className="mt-auto pt-3 border-t border-secondary/10">
      {/* Avg stars row */}
      {count > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-accent text-xs font-medium">{avg.toFixed(1)}</span>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <span key={s} className="text-xs" style={{ color: s <= Math.round(avg) ? '#cf8319' : 'rgba(255,255,255,0.19)' }}>★</span>
            ))}
          </div>
          <span className="text-[10px] text-secondary/30">({count})</span>
        </div>
      )}

      {/* Interactive rating */}
      <div>
  <p className="text-xs text-secondary/65 tracking-[0.2em] uppercase mb-1">
    {submitted ? 'Rated' : 'Rate this place'}
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
        <span
          style={{
            color: star <= displayRating
              ? '#d4b78f' // selected/hovered stars
              : '#cfcfcf', // always visible inactive stars
          }}
        >
          ★
        </span>
      </button>
    ))}
  </div>

  <p className="text-sm mt-0.5 text-secondary/60">
    {submitting
      ? 'Saving…'
      : submitted
      ? `Saved ${myRating} ★`
      : 'Tap to rate'}
  </p>
</div>
    </div>
  );
}

// ── Skeleton card ────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-[1.5rem] overflow-hidden bg-secondary/[0.04] border border-secondary/8 animate-pulse">
      <div className="h-48 bg-secondary/10" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-secondary/10 rounded-full w-3/4" />
        <div className="h-3 bg-secondary/8 rounded-full w-1/2" />
        <div className="h-3 bg-secondary/8 rounded-full w-2/3" />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function FeaturedRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantsWithPhotos = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/v1/restaurant/?status=true&page_size=8`, { cache: 'no-store' });
        if (!res.ok) { setRestaurants([]); return; }
        const data = await res.json();
        const restaurantList: Restaurant[] = data.results ?? [];
        const photosPromises = restaurantList.map(r => fetchCoverPhoto(r.id));
        const photos = await Promise.all(photosPromises);
        setRestaurants(restaurantList.map((r, i) => ({ ...r, coverPhotoUrl: photos[i] })));
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantsWithPhotos();
  }, []);

  return (
    <section className="relative  py-8 overflow-hidden">
      {/* Top gold rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        <SectionHeader
  title="Featured"
  highlight="Restaurants"
  linkText="View all"
  linkHref="/restaurants"
/>

       
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4 md:gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <p className="text-center text-secondary/30 py-10 font-light">No restaurants available at the moment</p>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5"
          >
            {restaurants.map((restaurant) => {
              const photo = resolvePhoto(restaurant.coverPhotoUrl);
              return (
                <motion.div
                  key={restaurant.id}
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } }}
                >
                  <Link
                    href={`/restaurants/${toSlug(restaurant.name)}`}
                    className="group flex flex-col rounded-[1.5rem] overflow-hidden border border-secondary/8 hover:border-accent/35 bg-secondary/[0.04] hover:bg-secondary/[0.08] transition-all duration-400 h-full"
                  >
                    {/* Image */}
                    <div className="relative h-44 sm:h-48 overflow-hidden bg-secondary/5 shrink-0">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={restaurant.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-5xl opacity-30">🍽️</span>
                        </div>
                      )}


                      {/* Availability badge */}
                      {restaurant.availability && !/^\d{4}-\d{2}-\d{2}/.test(restaurant.availability) && (
                        <span className="absolute top-3 left-3 bg-accent text-primarytext-[9px] font-medium px-2.5 py-1 rounded-full tracking-[0.15em] uppercase z-10">
                          {restaurant.availability}
                        </span>
                      )}

                      {/* View count */}
                      {restaurant.view_count > 0 && (
                        <span className="absolute top-3 right-3 bg-secondary/50 text-white text-base px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                          <Eye className="w-3 h-3" />
                          {restaurant.view_count >= 1000
                            ? `${(restaurant.view_count / 1000).toFixed(1)}k`
                            : restaurant.view_count}
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2">
                      <h3 className="font-medium text-secondary text-base sm:text-lg leading-snug line-clamp-1  ">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-1.5 ">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <p className="text-xs font-light truncate">{restaurant.city}</p>
                      </div>

                      <StarRating restaurantId={restaurant.id} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}