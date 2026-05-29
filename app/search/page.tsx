'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Eye, Star, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const ITEMS_PER_PAGE = 12;

interface Restaurant {
  id: number;
  name: string;
  address: string;
  city: string;
  status: boolean;
  view_count: number;
  photos: { id: number; photo_url: string }[];
}

interface RatingCache {
  [key: number]: { avg: number; count: number };
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function resolvePhoto(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function StarDisplay({ avg, count }: { avg: number; count: number }) {
  if (count === 0) return <span className="text-xs text-gray-400">No ratings yet</span>;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold text-amber-700">{avg.toFixed(1)}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={11}
            className={s <= Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
          />
        ))}
      </div>
      <span className="text-[10px] text-gray-400">({count})</span>
    </div>
  );
}

function RestaurantCard({ restaurant, rating }: { restaurant: Restaurant; rating?: { avg: number; count: number } }) {
  const photo = resolvePhoto(restaurant.photos?.[0]?.photo_url);
  return (
    <Link
      href={`/restaurants/${toSlug(restaurant.name)}`}
      className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col"
    >
      <div className="relative h-44 bg-gray-100 flex-shrink-0">
        {photo ? (
          <Image
            src={photo}
            alt={restaurant.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200 bg-gradient-to-br from-amber-50 to-orange-50">
            🍽️
          </div>
        )}
        {restaurant.view_count > 0 && (
          <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <Eye size={10} />
            {restaurant.view_count >= 1000
              ? `${(restaurant.view_count / 1000).toFixed(1)}k`
              : restaurant.view_count}
          </span>
        )}
      </div>
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <h3 className="text-sm font-bold text-[#513012] line-clamp-1 group-hover:text-[#7a4a1e] transition-colors">
          {restaurant.name}
        </h3>
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin size={11} className="flex-shrink-0 text-gray-400" />
          <p className="text-xs line-clamp-1">{restaurant.city}</p>
        </div>
        {rating && <StarDisplay avg={rating.avg} count={rating.count} />}
      </div>
    </Link>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratings, setRatings] = useState<RatingCache>({});
  const [allCities, setAllCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'views' | 'name'>('default');
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch cities once, cache in sessionStorage
  useEffect(() => {
    const cached = sessionStorage.getItem('allCities');
    if (cached) {
      setAllCities(JSON.parse(cached));
      return;
    }
    fetch(`${BASE_URL}/api/v1/restaurant/?status=true&page_size=200`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const cities = [
          ...new Set(
            (data.results ?? []).map((r: Restaurant) => r.city).filter(Boolean)
          ),
        ] as string[];
        const sorted = cities.sort();
        setAllCities(sorted);
        sessionStorage.setItem('allCities', JSON.stringify(sorted));
      })
      .catch(() => {});
  }, []);

  // Sync query from URL
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setQuery(q);
    setInputValue(q);
    setCurrentPage(1);
  }, [searchParams]);

  const fetchResults = useCallback(async () => {
    if (!query.trim() && !selectedCity) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ status: 'true', page_size: '200' });
      if (query.trim()) params.set('search', query.trim());

      const res = await fetch(`${BASE_URL}/api/v1/restaurant/?${params}`, { cache: 'no-store' });
      if (!res.ok) {
        setResults([]);
        setTotalCount(0);
        return;
      }
      const data = await res.json();
      let items: Restaurant[] = data.results ?? [];

      // Client-side city filter
      if (selectedCity) {
        items = items.filter((r) =>
          r.city?.toLowerCase().includes(selectedCity.toLowerCase())
        );
      }

      // Client-side sort
      if (sortBy === 'views') items = [...items].sort((a, b) => b.view_count - a.view_count);
      if (sortBy === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name));

      // Manual pagination after filtering
      const total = items.length;
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginated = items.slice(start, start + ITEMS_PER_PAGE);

      setResults(paginated);
      setTotalCount(total);

      // Batch fetch ratings for all visible results in ONE request
      const uncachedIds = paginated.map((r) => r.id).filter((id) => ratings[id] === undefined);
      if (uncachedIds.length > 0) {
        try {
          const ratingRes = await fetch(
            `${BASE_URL}/api/v1/restaurant-reviews/?restaurant__in=${uncachedIds.join(',')}&page_size=1000`,
            { cache: 'no-store' }
          );
          if (ratingRes.ok) {
            const ratingData = await ratingRes.json();
            const reviews: { rating: number; parent: number | null; restaurant: number }[] =
              ratingData.results ?? [];

            const newRatings: RatingCache = {};
            uncachedIds.forEach((id) => {
              const topLevel = reviews.filter((rev) => rev.restaurant === id && rev.parent === null);
              if (topLevel.length === 0) {
                newRatings[id] = { avg: 0, count: 0 };
              } else {
                const avg = topLevel.reduce((s, rev) => s + rev.rating, 0) / topLevel.length;
                newRatings[id] = { avg, count: topLevel.length };
              }
            });
            setRatings((prev) => ({ ...prev, ...newRatings }));
          }
        } catch {
          // Ratings failed silently — cards still show without ratings
        }
      }
    } catch {
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentPage, selectedCity, sortBy]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    setCurrentPage(1);
    router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearSearch = () => {
    setInputValue('');
    setQuery('');
    setResults([]);
    setTotalCount(0);
    router.push('/search');
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50">
            {/* Hero search bar */}
      <div className="bg-gradient-to-br from-[#2a1505] via-[#3d1a08] to-[#1a0b02] py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-200/60 text-xs font-medium uppercase tracking-widest mb-2 text-center">
            Search
          </p>
          <h1 className="text-white text-2xl sm:text-3xl font-bold text-center mb-6">
            Find your next favourite restaurant
          </h1>

          {/* Search input */}
          <div className="relative">
            <div className="flex items-center bg-white rounded-2xl shadow-xl overflow-visible">
              <Search size={18} className="ml-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Restaurant name, cuisine, city..."
                className="flex-1 px-3 py-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
                autoFocus
              />
              {inputValue && (
                <button onClick={clearSearch} className="px-2 text-gray-300 hover:text-gray-500 transition-colors">
                  <X size={16} />
                </button>
              )}
              <button
                onClick={() => handleSearch()}
                disabled={!inputValue.trim()}
                className="m-2 px-5 py-2.5 bg-[#513012] text-white rounded-xl text-sm font-semibold hover:bg-[#3d2209] disabled:opacity-40 transition-colors flex-shrink-0"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick city filters */}
          {allCities.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCity('')}
                className={` px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !selectedCity ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                All cities
              </button>
              {allCities.slice(0, 8).map((city) => (
                <button
                  key={city}
                  onClick={() => { setSelectedCity(city); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCity === city ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Results header + filters */}
        {query && (
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              {loading ? (
                <p className="text-gray-500 text-sm">Searching...</p>
              ) : (
                <p className="text-gray-700 text-sm">
                  {totalCount > 0 ? (
                    <>
                      <span className="font-semibold text-[#513012]">{totalCount}</span>{' '}
                      result{totalCount !== 1 ? 's' : ''} for{' '}
                      <span className="font-semibold">&ldquo;{query}&rdquo;</span>
                      {selectedCity && <span className="text-gray-400"> in {selectedCity}</span>}
                    </>
                  ) : (
                    <>No results for <span className="font-semibold">&ldquo;{query}&rdquo;</span></>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); }}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#513012] cursor-pointer"
                >
                  <option value="default">Sort: Default</option>
                  <option value="views">Most viewed</option>
                  <option value="name">A – Z</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showFilters || selectedCity ? 'bg-[#513012] text-white border-[#513012]' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal size={13} />
                Filters
                {selectedCity && <span className="bg-white/20 text-white rounded-full px-1">1</span>}
              </button>
            </div>
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Filter by city</p>
              {selectedCity && (
                <button onClick={() => setSelectedCity('')} className="text-xs text-[#513012] hover:underline">
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allCities.map((city) => (
                <button
                  key={city}
                  onClick={() => { setSelectedCity(selectedCity === city ? '' : city); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedCity === city
                      ? 'bg-[#513012] text-white border-[#513012]'
                      : 'border-gray-200 text-gray-600 hover:border-[#513012] hover:text-[#513012]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!query && !selectedCity && !loading && (
          <div className="text-center py-24">
            <div className="text-7xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Search for a restaurant</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Type a restaurant name, cuisine type, or city name above to get started.
            </p>
            {allCities.length > 0 && (
              <div className="mt-8">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Browse by city</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                  {allCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setInputValue(city);
                        router.push(`/search?q=${encodeURIComponent(city)}`);
                      }}
                      className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-[#513012] hover:text-[#513012] hover:bg-amber-50 transition-colors flex items-center gap-1.5"
                    >
                      <MapPin size={12} />
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100">
                <div className="h-44 bg-gray-200" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">No results found</h2>
            <p className="text-gray-400 text-sm mb-6">
              We couldn&apos;t find any restaurants matching &ldquo;{query}&rdquo;
              {selectedCity ? ` in ${selectedCity}` : ''}.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {selectedCity && (
                <button
                  onClick={() => setSelectedCity('')}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Search all cities
                </button>
              )}
              <button
                onClick={clearSearch}
                className="px-4 py-2 rounded-xl bg-[#513012] text-white text-sm font-medium hover:bg-[#3d2209]"
              >
                Clear search
              </button>
              <Link
                href="/restaurants"
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Browse all venues
              </Link>
            </div>
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                rating={ratings[restaurant.id]}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center mt-10 gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  currentPage === i + 1
                    ? 'bg-[#513012] text-white border-[#513012]'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#513012] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}