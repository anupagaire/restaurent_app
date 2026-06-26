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
  if (count === 0) return <span className="text-xs text-secondary">No ratings yet</span>;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold text-accent">{avg.toFixed(1)}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={11}
            className={s <= Math.round(avg) ? 'text-accent fill-accent' : 'text-gray-200 fill-gray-200'}
          />
        ))}
      </div>
      <span className="text-[10px] text-secondary">({count})</span>
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
          <Image src={photo} alt={restaurant.name} fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200 bg-gradient-to-br from-accent to-accent-50">
            🍽️
          </div>
        )}
        {restaurant.view_count > 0 && (
          <span className="absolute top-2 right-2 bg-secondary/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <Eye size={10} />
            {restaurant.view_count >= 1000 ? `${(restaurant.view_count / 1000).toFixed(1)}k` : restaurant.view_count}
          </span>
        )}
      </div>
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <h3 className="text-sm font-bold text-secondary line-clamp-1 group-hover:text-[#7a4a1e] transition-colors">
          {restaurant.name}
        </h3>
        <div className="flex items-center gap-1 text-secondary">
          <MapPin size={11} className="flex-shrink-0 text-secondary" />
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
const cityScrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratings, setRatings] = useState<RatingCache>({});
  const [allCities, setAllCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'views' | 'name'>('default');
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch cities
  useEffect(() => {
    const cached = sessionStorage.getItem('allCities');
    if (cached) { setAllCities(JSON.parse(cached)); return; }
    fetch(`${BASE_URL}/api/v1/restaurant/?status=true&page_size=200`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const cities = [...new Set((data.results ?? []).map((r: Restaurant) => r.city).filter(Boolean))] as string[];
        const sorted = cities.sort();
        setAllCities(sorted);
        sessionStorage.setItem('allCities', JSON.stringify(sorted));
      })
      .catch(() => {});
  }, []);

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
      if (!res.ok) { setResults([]); setTotalCount(0); return; }
      const data = await res.json();
      let items: Restaurant[] = data.results ?? [];

      if (selectedCity) {
        items = items.filter((r) => r.city?.toLowerCase().includes(selectedCity.toLowerCase()));
      }
      if (sortBy === 'views') items = [...items].sort((a, b) => b.view_count - a.view_count);
      if (sortBy === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name));

      const total = items.length;
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginated = items.slice(start, start + ITEMS_PER_PAGE);
      setResults(paginated);
      setTotalCount(total);

      const uncachedIds = paginated.map((r) => r.id).filter((id) => ratings[id] === undefined);
      if (uncachedIds.length > 0) {
        try {
          const ratingRes = await fetch(
            `${BASE_URL}/api/v1/restaurant-reviews/?restaurant__in=${uncachedIds.join(',')}&page_size=1000`,
            { cache: 'no-store' }
          );
          if (ratingRes.ok) {
            const ratingData = await ratingRes.json();
            const reviews: { rating: number; parent: number | null; restaurant: number }[] = ratingData.results ?? [];
            const newRatings: RatingCache = {};
            uncachedIds.forEach((id) => {
              const topLevel = reviews.filter((rev) => rev.restaurant === id && rev.parent === null);
              newRatings[id] = topLevel.length === 0
                ? { avg: 0, count: 0 }
                : { avg: topLevel.reduce((s, rev) => s + rev.rating, 0) / topLevel.length, count: topLevel.length };
            });
            setRatings((prev) => ({ ...prev, ...newRatings }));
          }
        } catch {}
      }
    } catch {
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentPage, selectedCity, sortBy]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleSearch = () => {
    if (!inputValue.trim()) return;
    setCurrentPage(1);
    router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
  };

  const clearSearch = () => {
    setInputValue('');
    setQuery('');
    setResults([]);
    setTotalCount(0);
    router.push('/search');
    inputRef.current?.focus();
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setNearMeLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const detectedCity = data.address?.city || data.address?.town || data.address?.village;
          if (!detectedCity) return;
          const match = allCities.find(
            (c) =>
              c.toLowerCase().includes(detectedCity.toLowerCase()) ||
              detectedCity.toLowerCase().includes(c.toLowerCase())
          );
          if (match) { setSelectedCity(match); setCurrentPage(1); }
        } finally {
          setNearMeLoading(false);
        }
      },
      () => setNearMeLoading(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-secondary via-[#3d1a08] to-[#1a0b02] py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3 text-center">
            🍽️ Discover Nepal&apos;s Best
          </p>
          <h1 className="text-white text-3xl sm:text-4xl font-bold text-center mb-2 leading-tight">
            Find Your Next<br />
            <span className="text-accent">Favourite Restaurant</span>
          </h1>
          <p className="text-white text-sm text-center mb-8">
            Search across hundreds of venues in Nepal
          </p>

          {/* Search bar */}
          <div className="flex items-center bg-white rounded-2xl shadow-2xl p-2 gap-2">
            <Search size={18} className="ml-2 text-secondary flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Restaurant name, cuisine, city..."
              className="flex-1 px-2 py-2.5 text-sm text-gray-800 outline-none placeholder:text-secondary bg-transparent"
              autoFocus
            />
            {inputValue && (
              <button onClick={clearSearch} className="text-gray-300 hover:text-secondary p-1 transition-colors">
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={!inputValue.trim()}
              className="px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-semibold hover:bg-[#3d2209] disabled:opacity-40 transition-colors flex-shrink-0"
            >
              Search
            </button>
          </div>

          {/* City pills */}
         {/* City pills — arrows सहित */}
{allCities.length > 0 && (
  <div className="relative mt-4">
    {/* Left fade */}
    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-secondary to-transparent z-10 pointer-events-none" />
    {/* Right fade */}
    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1a0b02] to-transparent z-10 pointer-events-none" />

    <div
      ref={cityScrollRef}
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* All */}
      <button
        onClick={() => { setSelectedCity(''); setCurrentPage(1); }}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
          !selectedCity ? ' text-white' : 'bg-white/10 text-white '
        }`}
      >
        All
      </button>

      {/* Near Me */}
      <button
        onClick={handleNearMe}
        disabled={nearMeLoading}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-accent0/20 text-accent border border-accent/30 hover:bg-accent/30 transition-all disabled:opacity-60"
      >
        <MapPin size={11} className={nearMeLoading ? 'animate-pulse' : ''} />
        {nearMeLoading ? 'Detecting...' : 'Near Me'}
      </button>

      {/* Cities */}
      {allCities.map((city) => (
        <button
          key={city}
          onClick={() => { setSelectedCity(city); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
            selectedCity === city
              ? 'bg-accent text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          {city}
        </button>
      ))}
    </div>
  </div>
)}

          {/* Active city badge */}
          {selectedCity && (
            <div className="flex justify-center mt-3">
              <span className="flex items-center gap-2 bg-accent/20 border border-accent/30 text-white text-xs px-3 py-1.5 rounded-full">
                <MapPin size={11} />
                Showing in <strong>{selectedCity}</strong>
                <button onClick={() => setSelectedCity('')} className="hover:text-white transition-colors">
                  <X size={11} />
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Results header + filters */}
        {(query || selectedCity) && (
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              {loading ? (
                <p className="text-secondary text-sm">Searching...</p>
              ) : (
                <p className="text-gray-700 text-sm">
                  {totalCount > 0 ? (
                    <>
                      <span className="font-semibold text-secondary">{totalCount}</span>{' '}
                      result{totalCount !== 1 ? 's' : ''}
                      {query && <> for <span className="font-semibold">&ldquo;{query}&rdquo;</span></>}
                      {selectedCity && <span className="text-secondary"> in {selectedCity}</span>}
                    </>
                  ) : (
                    <>No results{query && <> for <span className="font-semibold">&ldquo;{query}&rdquo;</span></>}</>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); }}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
                >
                  <option value="default">Sort: Default</option>
                  <option value="views">Most viewed</option>
                  <option value="name">A – Z</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showFilters || selectedCity
                    ? 'bg-secondary text-white border-secondary'
                    : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal size={13} />
                Filters
                {selectedCity && <span className="bg-white/20 text-white rounded-full px-1.5 text-[10px]">1</span>}
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
                <button onClick={() => setSelectedCity('')} className="text-xs text-secondary hover:underline">
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
                      ? 'bg-secondary text-white border-secondary'
                      : 'border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
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
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Search for a restaurant</h2>
            <p className="text-secondary text-sm max-w-sm mx-auto mb-8">
              Type a restaurant name, cuisine type, or city name above to get started.
            </p>
            {allCities.length > 0 && (
              <>
                <p className="text-xs text-secondary uppercase tracking-widest mb-4">Or browse by city</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                  {allCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => { setSelectedCity(city); setCurrentPage(1); }}
                      className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-secondary hover:text-secondary hover:bg-accent transition-colors flex items-center gap-1.5"
                    >
                      <MapPin size={12} />
                      {city}
                    </button>
                  ))}
                </div>
              </>
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
        {!loading && (query || selectedCity) && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">No results found</h2>
            <p className="text-secondary text-sm mb-6">
              {query && <>No restaurants matching &ldquo;{query}&rdquo;</>}
              {selectedCity && <> in {selectedCity}</>}.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {selectedCity && (
                <button onClick={() => setSelectedCity('')}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                  Search all cities
                </button>
              )}
              <button onClick={clearSearch}
                className="px-4 py-2 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-[#3d2209]">
                Clear search
              </button>
              <Link href="/restaurants"
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Browse all venues
              </Link>
            </div>
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} rating={ratings[restaurant.id]} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center mt-10 gap-2 flex-wrap">
            <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  currentPage === i + 1
                    ? 'bg-secondary text-white border-secondary'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">
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
          <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-secondary text-sm">Loading...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}