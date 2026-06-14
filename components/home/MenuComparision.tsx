'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, MapPin, X } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const HOME_LIMIT = 6;
const PAGE_SIZE = 12;

// ─── Types ───────────────────────────────────────────────────────────────────
interface MenuSearchResult {
  id: number;
  restaurant: number;
  name: string;
  description: string;
  price: string;
  status: boolean;
  rating_average: string;
  rating_count: number;
  photos: { id: number; photo_url: string; alt: string }[];
}

interface RestaurantInfo {
  id: number;
  name: string;
  city: string;
  cover_photo: { photo_url: string; alt: string } | null;
}

interface EnrichedResult extends MenuSearchResult {
  restaurantName: string;
  restaurantCity: string;
  restaurantPhoto: string | null;
  restaurantSlug: string;
  ratingNum: number;
  priceNum: number;
}

export interface CartableItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category?: string;
}

type SortKey = 'rating' | 'price_low' | 'price_high';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function resolvePhoto(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = BASE_URL?.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ─── Restaurant cache ─────────────────────────────────────────────────────────
const restaurantCache: Record<number, RestaurantInfo> = {};

async function getRestaurantInfo(id: number): Promise<RestaurantInfo | null> {
  if (restaurantCache[id]) return restaurantCache[id];
  try {
    const res = await fetch(`${BASE_URL}/api/v1/restaurant/${id}/`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const info: RestaurantInfo = {
      id: data.id,
      name: data.name,
      city: data.city,
      cover_photo: data.cover_photo ?? null,
    };
    restaurantCache[id] = info;
    return info;
  } catch {
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className="text-sm" style={{ color: s <= Math.round(rating) ? '#f59e0b' : '#e5e7eb' }}>
            ★
          </span>
        ))}
      </div>
      {count > 0 && (
        <span className="text-[10px] text-gray-400">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? 'bg-secondary text-white border-secondary'
          : 'bg-white border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Menu Card ────────────────────────────────────────────────────────────────
function MenuCard({
  r,
  rank,
  qty,
  onAdd,
  onUpdateQty,
}: {
  r: EnrichedResult;
  rank: number;
  qty: number;
  onAdd: () => void;
  onUpdateQty: (delta: number) => void;
}) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-secondary/20 transition-all group">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          rank === 0
            ? 'bg-amber-400 text-white'
            : rank === 1
            ? 'bg-gray-300 text-gray-700'
            : rank === 2
            ? 'bg-amber-700 text-white'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
      </div>

      <Link href={`/restaurants/${r.restaurantSlug}`} className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
        {r.restaurantPhoto ? (
          <Image src={r.restaurantPhoto} alt={r.restaurantName} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
      </Link>

      <Link href={`/restaurants/${r.restaurantSlug}`} className="flex-1 min-w-0">
        <p className="font-semibold text-secondary text-sm group-hover:underline truncate">{r.restaurantName}</p>
        <p className="text-xs text-gray-400 mb-1">
          📍 {r.restaurantCity} · <span className="text-secondary font-medium">{r.name}</span>
        </p>
        {r.description && <p className="text-xs text-gray-400 truncate">{r.description}</p>}
        <div className="mt-1">
          {r.rating_count > 0 ? (
            <StarRow rating={r.ratingNum} count={r.rating_count} />
          ) : (
            <span className="text-[10px] text-gray-400">No ratings yet</span>
          )}
        </div>
      </Link>

      <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
        <p className="text-sm font-bold text-gray-800">Rs. {r.priceNum.toLocaleString()}</p>

        {qty === 0 ? (
          <button
            onClick={onAdd}
            className="px-4 py-1.5 rounded-xl text-xs font-bold border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all"
          >
            ADD
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-2 py-1">
            <button onClick={() => onUpdateQty(-1)} className="w-5 h-5 flex items-center justify-center text-white">
              <Minus size={11} />
            </button>
            <span className="text-white font-bold text-sm w-4 text-center">{qty}</span>
            <button onClick={() => onUpdateQty(1)} className="w-5 h-5 flex items-center justify-center text-white">
              <Plus size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const QUICK_SEARCHES = ['Momo', 'Chowmein', 'Pizza', 'Burger', 'Thali', 'Sekuwa', 'Buff', 'Pasta'];

interface MenuComparisonProps {
  isHomePage?: boolean;
  initialQuery?: string;
  getQty?: (itemId: number) => number;
  onAdd?: (item: CartableItem) => void;
  onUpdateQty?: (itemId: number, delta: number) => void;
  
  // --- City Filtering Props ---
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  availableCities?: string[];
}

export default function MenuComparison({
  isHomePage = true,
  initialQuery = '',
  getQty,
  onAdd,
  onUpdateQty,
  selectedCity: externalSelectedCity,
  onCityChange: externalOnCityChange,
  availableCities: externalAvailableCities = [],
}: MenuComparisonProps) {
  const [internalSelectedCity, setInternalSelectedCity] = useState('');
  const [internalAvailableCities, setInternalAvailableCities] = useState<string[]>([]);

  // Use external props if provided, otherwise fallback to internal state
  const selectedCity = externalSelectedCity !== undefined ? externalSelectedCity : internalSelectedCity;
  const onCityChange = externalOnCityChange || setInternalSelectedCity;
  const availableCities = externalAvailableCities.length > 0 ? externalAvailableCities : internalAvailableCities;

  const [query, setQuery] = useState(initialQuery);
  const [rawResults, setRawResults] = useState<EnrichedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState('');
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [page, setPage] = useState(1);

  // Fetch available cities if not provided externally
  useEffect(() => {
    if (externalAvailableCities.length === 0 && internalAvailableCities.length === 0) {
      const fetchCities = async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/v1/restaurant/?status=true&page_size=200`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            const cities = [...new Set((data.results ?? []).map((r: any) => r.city).filter(Boolean))].sort();
            setInternalAvailableCities(cities as string[]);
          }
        } catch {
          // ignore
        }
      };
      fetchCities();
    }
  }, [externalAvailableCities.length, internalAvailableCities.length]);

  // Filter raw results by selected city dynamically (no re-fetch needed)
  const allResults = useMemo(() => {
    if (!selectedCity) return rawResults;
    return rawResults.filter((r) => r.restaurantCity.toLowerCase() === selectedCity.toLowerCase());
  }, [rawResults, selectedCity]);

  const sorted = [...allResults].sort((a, b) => {
    if (sortBy === 'price_low') return a.priceNum - b.priceNum;
    if (sortBy === 'price_high') return b.priceNum - a.priceNum;
    return b.ratingNum - a.ratingNum;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = isHomePage
    ? sorted.slice(0, HOME_LIMIT)
    : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fetchResults = useCallback(async (term: string) => {
    setLoading(true);
    setError('');
    setRawResults([]);
    setSearched(term);
    setPage(1);

    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/menu/search/?search=${encodeURIComponent(term)}&page_size=200`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      const menus: MenuSearchResult[] = (data.results ?? []).filter(
        (m: MenuSearchResult) => m.status && m.name.toLowerCase().includes(term.toLowerCase())
      );

      if (menus.length === 0) { setLoading(false); return; }

      const uniqueIds = [...new Set(menus.map((m) => m.restaurant))];
      const infos = await Promise.all(uniqueIds.map(getRestaurantInfo));
      const restaurantMap: Record<number, RestaurantInfo> = {};
      infos.forEach((info) => { if (info) restaurantMap[info.id] = info; });

      const enriched: EnrichedResult[] = menus.map((m) => {
        const rInfo = restaurantMap[m.restaurant];
        const ratingNum = parseFloat(m.rating_average) || 0;
        const priceNum = parseFloat(m.price) || 0;
        const menuPhoto = resolvePhoto(m.photos?.[0]?.photo_url);
        const coverPhoto = resolvePhoto(rInfo?.cover_photo?.photo_url);
        return {
          ...m,
          restaurantName: rInfo?.name ?? `Restaurant #${m.restaurant}`,
          restaurantCity: rInfo?.city ?? '',
          restaurantPhoto: menuPhoto ?? coverPhoto,
          restaurantSlug: rInfo ? toSlug(rInfo.name) : '',
          ratingNum,
          priceNum,
        };
      });

      setRawResults(enriched);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
useEffect(() => {
  if (initialQuery.trim()) {
    fetchResults(initialQuery.trim());
  }
}, [initialQuery, fetchResults]);
  const handleSearch = (term?: string) => {
    const t = (term ?? query).trim();
    if (!t) return;
    fetchResults(t);
  };

  const handleQuick = (term: string) => {
    setQuery(term);
    fetchResults(term);
  };

  return (
    <section id="compare" className={`px-6 bg-[#fdf8f3] ${isHomePage ? 'py-16' : 'py-8'}`}>
      <div className="max-w-4xl mx-auto">

        {isHomePage && (
          <div className="text-center mb-10">
            <span className="inline-block bg-secondary/10 text-secondary text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
              Menu Finder
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#1a0a00] mb-3">
              Find the Best <span className="text-secondary italic">Dish</span> Near You
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Search any dish and compare it across restaurants — ranked by rating or price.
            </p>
          </div>
        )}

        {/* City Filter UI */}
        {availableCities.length > 0 && (
          <div className="flex justify-center mb-4">
            {selectedCity ? (
              <span className="bg-secondary/10 text-secondary text-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                <MapPin size={13} />
                Showing menus in <strong>{selectedCity}</strong>
                <button
                  onClick={() => onCityChange('')}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X size={13} />
                </button>
              </span>
            ) : (
              <select
                value=""
                onChange={(e) => onCityChange(e.target.value)}
                className="bg-white border border-gray-200 text-sm text-gray-600 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer hover:border-secondary transition-colors"
              >
                <option value="" disabled>📍 Filter by City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search a dish... e.g. Momo, Pizza, Thali"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 shadow-sm"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-secondary text-white px-6 py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-40 hover:bg-[#3d2209] transition-colors shadow-sm whitespace-nowrap"
          >
            {loading ? '...' : 'Compare'}
          </button>
        </div>

        {/* Quick searches */}
        <div className="flex flex-wrap gap-2 mb-6">
          {QUICK_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => handleQuick(term)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary transition-colors"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Sort controls */}
        {allResults.length > 0 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Sort by:</span>
            <SortButton active={sortBy === 'rating'} onClick={() => { setSortBy('rating'); setPage(1); }}>
              ⭐ Top Rated
            </SortButton>
            <SortButton active={sortBy === 'price_low'} onClick={() => { setSortBy('price_low'); setPage(1); }}>
              💰 Price: Low to High
            </SortButton>
            <SortButton active={sortBy === 'price_high'} onClick={() => { setSortBy('price_high'); setPage(1); }}>
              💰 Price: High to Low
            </SortButton>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
            <p className="text-center text-xs text-gray-400 mt-2">Searching across all restaurants...</p>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-center text-red-400 text-sm py-8">{error}</p>}

        {/* No results */}
        {!loading && searched && allResults.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-500 text-sm">
              {selectedCity 
                ? `No restaurants in ${selectedCity} serve `
                : `No restaurants serve `}
              <strong>&quot;{searched}&quot;</strong> right now.
            </p>
            {selectedCity && (
              <button 
                onClick={() => onCityChange('')} 
                className="mt-3 text-sm text-secondary underline hover:text-[#3d2209]"
              >
                Clear city filter to see all results
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && paginated.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              {isHomePage ? (
                <>
                  Showing top{' '}
                  <span className="font-semibold text-secondary">{Math.min(HOME_LIMIT, sorted.length)}</span> of{' '}
                  <span className="font-semibold text-secondary">{sorted.length}</span> results for{' '}
                  <span className="font-semibold">&quot;{searched}&quot;</span>
                  {selectedCity && <span> in <strong>{selectedCity}</strong></span>}
                </>
              ) : (
                <>
                  <span className="font-semibold text-secondary">{sorted.length}</span> results for{' '}
                  <span className="font-semibold">&quot;{searched}&quot;</span>
                  {selectedCity && <span> in <strong>{selectedCity}</strong></span>}
                </>
              )}
            </p>

            <div className="space-y-3">
              {paginated.map((r, i) => (
                <MenuCard
                  key={`${r.id}-${i}`}
                  r={r}
                  rank={isHomePage ? i : (page - 1) * PAGE_SIZE + i}
                  qty={getQty ? getQty(r.id) : 0}
                  onAdd={() =>
                    onAdd?.({
                      id: r.id,
                      name: r.name,
                      description: r.description,
                      price: r.priceNum,
                      image: r.restaurantPhoto,
                      category: r.restaurantName,
                    })
                  }
                  onUpdateQty={(delta) => onUpdateQty?.(r.id, delta)}
                />
              ))}
            </div>

            {/* Home: See all */}
            {isHomePage && sorted.length > HOME_LIMIT && (
              <Link
                href={`/menu-search?q=${encodeURIComponent(searched)}${selectedCity ? `&city=${encodeURIComponent(selectedCity)}` : ''}`}
                className="flex items-center justify-center gap-2 mt-5 py-3 rounded-2xl border-2 border-secondary text-secondary text-sm font-semibold hover:bg-secondary hover:text-white transition-colors"
              >
                See all {sorted.length} results for &quot;{searched}&quot; →
              </Link>
            )}

            {/* Full page: Pagination */}
            {!isHomePage && totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      page === i + 1
                        ? 'bg-secondary text-white border-secondary'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}