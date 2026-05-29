'use client';

import { useState } from 'react';
import { MapPin, LocateFixed, X, Search } from 'lucide-react';

interface SearchAndFilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  onClear: () => void;
  availableCities: string[];
  locationBanner?: string;
  onLocationBannerChange?: (banner: string) => void;
}

// Reverse geocode lat/lng → city name using free OpenStreetMap Nominatim API
async function getCityFromCoords(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      null
    );
  } catch {
    return null;
  }
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
      <div className="flex items-center justify-center gap-3">
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
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="ml-1 text-gray-400 hover:text-red-500"
            >
              <X size={12} />
            </span>
          )}
        </button>
      </div>

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
              <h3 className="text-lg font-semibold text-[#513012]">Select a City</h3>
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
                onClick={() => {
                  onClear();
                  onClose();
                }}
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
                      onClick={() => {
                        onSelect(city);
                        onClose();
                        setQuery('');
                      }}
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

export default function SearchAndFilterBar({
  search,
  onSearchChange,
  selectedCity,
  onCityChange,
  onClear,
  availableCities,
  locationBanner = '',
  onLocationBannerChange,
}: SearchAndFilterBarProps) {
  const [detecting, setDetecting] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);

  // ── Detect user location ──
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await getCityFromCoords(pos.coords.latitude, pos.coords.longitude);
        setDetecting(false);
        if (!city) {
          alert('Could not detect your city. Please select manually.');
          return;
        }
        // Try to match detected city with available cities (fuzzy)
        const match = availableCities.find(
          (c) =>
            c.toLowerCase().includes(city.toLowerCase()) ||
            city.toLowerCase().includes(c.toLowerCase())
        );
        if (match) {
          onCityChange(match);
          onLocationBannerChange?.(`📍 Showing restaurants near ${match}`);
        } else {
          onLocationBannerChange?.(
            `📍 No restaurants found near ${city}. Showing all.`
          );
          onClear();
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          alert(
            'Location permission denied. Please allow location access and try again.'
          );
        } else {
          alert('Could not get your location. Please select a city manually.');
        }
      }
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search venues..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full max-w-md px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#513012]"
        />
      </div>

      {/* City picker and location detection */}
      {availableCities.length > 0 && (
        <div className="flex justify-center mb-8">
          <CityPickerModal
            cities={availableCities}
            selectedCity={selectedCity}
            onSelect={(city) => {
              onCityChange(city);
              onLocationBannerChange?.('');
            }}
            onClear={() => {
              onClear();
              onLocationBannerChange?.('');
            }}
            detecting={detecting}
            onDetect={handleDetectLocation}
            open={cityModalOpen}
            onClose={() => setCityModalOpen(false)}
            onOpen={() => setCityModalOpen(true)}
          />
        </div>
      )}

      {/* Location banner */}
      {locationBanner && (
        <div className="flex items-center justify-center mb-6">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2 rounded-full flex items-center gap-2">
            {locationBanner}
            <button
              onClick={() => onLocationBannerChange?.('')}
              className="ml-1 text-amber-500 hover:text-amber-700"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Active filter tag */}
      {selectedCity && !locationBanner && (
        <div className="flex justify-center mb-6">
          <span className="bg-[#513012]/10 text-[#513012] text-sm px-4 py-1.5 rounded-full flex items-center gap-2">
            <MapPin size={13} />
            Showing restaurants in <strong>{selectedCity}</strong>
            <button
              onClick={() => onClear()}
              className="ml-1 hover:text-red-500"
            >
              <X size={13} />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}