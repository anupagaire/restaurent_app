'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, LocateFixed, X, Search } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Restaurant {
  id: number;
  name: string;
  city: string;
  photos: { id: number; photo_url: string }[];
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function CityPickerModal({
  cities,
  selectedCity,
  onSelect,
  onClear,
  detecting,
  onDetect,
  open,
  onClose,
   onOpen, 
}: {
  cities: string[];
  selectedCity: string;
  onSelect: (city: string) => void;
  onClear: () => void;
  detecting: boolean;
  onDetect: () => void;
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = cities.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Trigger button — shown on the page */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={onDetect}
          disabled={detecting}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#513012] text-black text-sm font-medium hover:bg-[#513012] hover:text-white transition-all disabled:opacity-60"
        >
          <LocateFixed size={14} className={detecting ? 'animate-spin' : ''} />
          {detecting ? 'Detecting...' : 'Near Me'}
        </button>

        <button
          onClick={onOpen}  
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-black text-sm font-medium hover:border-[#513012] hover:text-[#513012] transition-all"
        >
          <MapPin size={14} />
          {selectedCity ? selectedCity : 'Select City'}
          {selectedCity && (
            <span
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="ml-1 text-gray-400 hover:text-red-500"
            >
              <X size={12} />
            </span>
          )}
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#513012]">
                Select a City
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Search input */}
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]"
              />
            </div>

            {/* City grid — scrollable */}
            <div className="overflow-y-auto flex-1">
              <button
                onClick={() => { onClear(); onClose(); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm mb-2 transition-all
                  ${!selectedCity
                    ? 'bg-[#513012] text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-50'}`}
              >
                🌐 All Cities
              </button>

              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">No city found</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filtered.map((city) => (
                    <button
                      key={city}
                      onClick={() => { onSelect(city); onClose(); setQuery(''); }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all
                        ${selectedCity === city
                          ? 'bg-[#513012] text-white border-[#513012] font-medium'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#513012] hover:text-[#513012]'}`}
                    >
                      <MapPin size={12} />
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) setRecent(JSON.parse(saved));
  }, []);

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/restaurant/?status=true&search=${encodeURIComponent(query)}&page_size=6`,
          { cache: 'no-store' }
        );
        if (!res.ok) { setResults([]); return; }
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const saveRecent = (term: string) => {
    const updated = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const handleSelect = (restaurant: Restaurant) => {
    saveRecent(restaurant.name);
    onClose();
    router.push(`/restaurants/${toSlug(restaurant.name)}`);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    saveRecent(query);
    onClose();
    router.push(`/restaurants?search=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search size={20} className="text-[#513012] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search restaurants, cuisines, cities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-base text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 transition">
              <X size={18} />
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition ml-1">
            <kbd className="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-400">ESC</kbd>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#513012] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Search results */}
          {!loading && results.length > 0 && (
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 px-2 mb-2">Restaurants</p>
              {results.map((r) => {
                const photo = resolvePhoto(r.photos?.[0]?.photo_url);
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition text-left group"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {photo ? (
                        <Image src={photo} alt={r.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#513012] transition">{r.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {r.city}
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-[#513012] transition text-xs">→</span>
                  </button>
                );
              })}

              {/* View all results */}
              <button
                onClick={handleSearch}
                className="w-full mt-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 hover:border-[#513012] hover:text-[#513012] transition flex items-center justify-center gap-2"
              >
                <Search size={13} />
                View all results for &quot;{query}&quot;
              </button>
            </div>
          )}

       
          {!loading && query && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">🍽️</p>
              <p className="text-gray-500 text-sm">No restaurants found for &quot;{query}&quot;</p>
              <p className="text-gray-400 text-xs mt-1">Try a different name or city</p>
            </div>
          )}

          {/* Empty state — show recent + trending */}
          {!query && (
            <div className="p-4 space-y-5">
              {recent.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Recent Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-[#513012]/10 hover:text-[#513012] transition"
                      >
                        <Search size={11} />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                  <TrendingUp size={11} /> Popular Searches
                </p>
              
              </div>

              <p className="text-center text-xs text-gray-300 pb-2">
                Press Enter to search all restaurants
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}