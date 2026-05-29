'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchAndFilterBar from '@/components/SearchCityModal';



const ITEMS_PER_PAGE = 10;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Restaurant {
  id: number;
  name: string;
  address: string;
  city: string;
  status: boolean;
  view_count: number;
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

async function postRating(restaurantId: number, rating: number): Promise<boolean> {
  const alreadyRated = localStorage.getItem(`rated_${restaurantId}`);
  if (alreadyRated) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/restaurant-reviews/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant: restaurantId,
        rating,
        review: '[Quick rating]',
        is_published: true,
      }),
    });
    if (res.ok) { localStorage.setItem(`rated_${restaurantId}`, String(rating)); return true; }
    if (res.status === 429) { localStorage.setItem(`rated_${restaurantId}`, String(rating)); return false; }
    return false;
  } catch { return false; }
}

function InlineStarRating({ restaurantId }: { restaurantId: number }) {
  const [myRating, setMyRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  const loadAvg = useCallback(() => {
    fetchAvgRating(restaurantId).then(({ avg, count }) => { setAvg(avg); setCount(count); });
  }, [restaurantId]);

  useEffect(() => {
    const saved = localStorage.getItem(`rated_${restaurantId}`);
    if (saved) { setMyRating(Number(saved)); setSubmitted(true); }
    loadAvg();
  }, [loadAvg, restaurantId]);

  const handleRate = async (val: number) => {
    if (submitting || submitted) return;
    setMyRating(val);
    setSubmitting(true);
    const ok = await postRating(restaurantId, val);
    if (ok) { setSubmitted(true); setTimeout(() => loadAvg(), 500); }
    else setMyRating(0);
    setSubmitting(false);
  };

  const displayRating = hover || myRating;

  return (
    <div onClick={(e) => e.preventDefault()}>
      {count > 0 && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-amber-800">{avg.toFixed(1)}</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="text-xs" style={{ color: s <= Math.round(avg) ? '#f59e0b' : '#d1d5db' }}>★</span>
            ))}
          </div>
          <span className="text-[10px] text-gray-400">({count})</span>
        </div>
      )}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 mb-1">{submitted ? 'Your rating:' : 'Rate this place:'}</p>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star} type="button" disabled={submitted || submitting}
              onMouseEnter={() => !submitted && setHover(star)}
              onMouseLeave={() => !submitted && setHover(0)}
              onClick={() => handleRate(star)}
              className="text-base leading-none focus:outline-none transition-transform hover:scale-110 disabled:cursor-default"
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

function FloatingRateWidget({ restaurants }: { restaurants: Restaurant[] }) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedRestaurant = restaurants.find((r) => r.id === selectedId);

  useEffect(() => {
    setRating(0); setSubmitted(false); setHover(0);
    if (selectedId) {
      const saved = localStorage.getItem(`rated_${selectedId}`);
      if (saved) { setRating(Number(saved)); setSubmitted(true); }
    }
  }, [selectedId]);

  const handleSubmit = async () => {
    if (!selectedId || !rating || submitting) return;
    setSubmitting(true);
    const ok = await postRating(selectedId, rating);
    if (ok) setSubmitted(true);
    setSubmitting(false);
  };

  const handleClose = () => {
    setOpen(false); setSelectedId(null); setRating(0); setHover(0); setSubmitted(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#513012] text-white px-5 py-3 rounded-full shadow-lg hover:bg-[#3d2209] transition-all flex items-center gap-2 text-sm font-medium"
      >
        ⭐ Rate a Restaurant
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={handleClose}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            <h3 className="text-lg font-semibold text-[#513012] mb-4">Rate a Restaurant</h3>
            <select
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#513012]"
            >
              <option value="" disabled>Select a restaurant...</option>
              {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            {selectedRestaurant && (
              <>
                <p className="text-sm text-gray-500 mb-3">📍 {selectedRestaurant.city}</p>
                {submitted ? (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-[#513012] font-medium">You rated {selectedRestaurant.name}</p>
                    <div className="flex justify-center gap-1 mt-2 text-2xl">
                      {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>)}
                    </div>
                    <button onClick={() => { setSubmitted(false); setRating(0); }} className="mt-3 text-xs text-gray-400 underline">Rate again</button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-2">Your rating:</p>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button"
                          onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                          onClick={() => setRating(star)}
                          className="text-3xl leading-none focus:outline-none transition-transform hover:scale-110"
                        >
                          <span style={{ color: star <= (hover || rating) ? '#f59e0b' : '#d1d5db' }}>★</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={handleSubmit} disabled={!rating || submitting}
                      className="w-full bg-[#513012] text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#3d2209] transition-colors">
                      {submitting ? 'Saving...' : 'Submit Rating'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'most_viewed' | 'most_rated'>('default');
  const [ratingsMap, setRatingsMap] = useState<Record<number, { avg: number; count: number }>>({});
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [locationBanner, setLocationBanner] = useState('');
  const fetchedRef = useRef(false);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Build unique city list from all restaurants
  useEffect(() => {
    if (allRestaurants.length === 0) return;
    const cities = [...new Set(allRestaurants.map((r) => r.city).filter(Boolean))].sort();
    setAvailableCities(cities);
  }, [allRestaurants]);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: 'true',
        page: String(currentPage),
        page_size: String(ITEMS_PER_PAGE),
        ...(search && { search }),
      });
      const res = await fetch(`${BASE_URL}/api/v1/restaurant/?${params}`, { cache: 'no-store' });
      if (!res.ok) { setRestaurants([]); setTotalCount(0); return; }
      const data = await res.json();

      let results: Restaurant[] = data.results ?? [];
      if (selectedCity) {
        results = results.filter((r) =>
          r.city?.toLowerCase().includes(selectedCity.toLowerCase())
        );
      }

      setRestaurants(results);
      setTotalCount(selectedCity ? results.length : (data.count ?? 0));
    } catch (err) {
      console.error(err);
      setRestaurants([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedCity]);
useEffect(() => {
  if (restaurants.length === 0) return;
  restaurants.forEach((r) => {
    fetchAvgRating(r.id).then((data) => {
      setRatingsMap((prev) => ({ ...prev, [r.id]: data }));
    });
  });
}, [restaurants]);
 useEffect(() => {
  if (fetchedRef.current) return; 
  fetchedRef.current = true;
  
  const fetchAll = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/restaurant/?status=true&page_size=200`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setAllRestaurants(data.results ?? []);
    } catch { }
  };
  fetchAll();
}, []); 

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);
  // useEffect(() => { setCurrentPage(1); }, [search, selectedCity]);
useEffect(() => {
  const timer = setTimeout(() => {
    setCurrentPage(1);
  }, 400); // 400ms wait
  return () => clearTimeout(timer);
}, [search]);
const sortedRestaurants = [...restaurants].sort((a, b) => {
  if (sortBy === 'most_viewed') return b.view_count - a.view_count;
  if (sortBy === 'most_rated') {
    const aRating = ratingsMap[a.id]?.avg ?? 0;
    const bRating = ratingsMap[b.id]?.avg ?? 0;
    return bRating - aRating;
  }
  return 0;
});
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-5xl font-bold text-[#513012] text-center mb-4">
          All venues in Nepal
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Discover the best venues in Nepal
        </p>

        <SearchAndFilterBar
          search={search}
          onSearchChange={setSearch}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          onClear={() => setSelectedCity('')}
          availableCities={availableCities}
          locationBanner={locationBanner}
          onLocationBannerChange={setLocationBanner}
        />
{/* Sort bar */}
<div className="flex items-center justify-between flex-wrap gap-4 mt-6 bg-gray-100 rounded-2xl px-5 py-4">
  <div>
    <p className="text-sm text-gray-600">
      Showing <span className="font-semibold text-[#513012]">{totalCount}</span> venues in Nepal
    </p>
    <p className="text-xs text-gray-400 mt-0.5">
      {sortBy === 'default' && 'Default order'}
      {sortBy === 'most_viewed' && 'Sorted by most viewed'}
      {sortBy === 'most_rated' && 'Sorted by top rated'}
    </p>
  </div>

  <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
    {[
      { key: 'default',     label: 'Default',      icon: '↕' },
      { key: 'most_viewed', label: 'Most viewed',  icon: '👁' },
      { key: 'most_rated',  label: 'Top rated',    icon: '★' },
    ].map((opt) => (
      <button
        key={opt.key}
        onClick={() => setSortBy(opt.key as typeof sortBy)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          sortBy === opt.key
            ? 'bg-[#513012] text-white'
            : 'text-gray-500 hover:text-[#513012] hover:bg-orange-50'
        }`}
      >
        <span>{opt.icon}</span>
        {opt.label}
      </button>
    ))}
  </div>
</div>
        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-5xl mb-4">🍽️</p>
            <p className="text-gray-500">
              {selectedCity
                ? `No restaurants found in ${selectedCity}.`
                : 'No restaurants found.'}
            </p>
            {selectedCity && (
              <button onClick={() => setSelectedCity('')} className="mt-3 text-sm text-[#513012] underline">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {sortedRestaurants.map((restaurant) => {
              const photo = resolvePhoto(restaurant.photos?.[0]?.photo_url);
              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${toSlug(restaurant.name)}`}
                  className="group bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="relative h-40 bg-gray-100">
                    {photo ? (
                      <Image
                        src={photo} alt={restaurant.name} fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">🍽️</div>
                    )}
                    {restaurant.view_count > 0 && (
                      <span className="absolute top-2 right-2 bg-black/50 text-white text-base font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        👀 {restaurant.view_count >= 1000
                          ? `${(restaurant.view_count / 1000).toFixed(1)}k`
                          : restaurant.view_count}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-[#513012] line-clamp-1">{restaurant.name}</h3>
                    <p className="text-gray-500 text-xs mt-1">📍 {restaurant.city}</p>
                    <InlineStarRating restaurantId={restaurant.id} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2 flex-wrap">
            <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border disabled:opacity-50">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border ${currentPage === i + 1 ? 'bg-[#513012] text-white' : 'bg-white'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      <FloatingRateWidget restaurants={allRestaurants} />

   </div>
  );
}