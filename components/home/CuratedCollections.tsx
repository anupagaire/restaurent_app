"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Restaurant {
  id: number;
  name: string;
  city: string;
  amenities: string;
  cover_photo: { photo_url: string; alt: string } | null;
  menus_count: number;
  view_count: number;
  created_on: string;
  status: boolean;
  seo: { slug: string };
}

interface Collection {
  id: string;
  label: string;
  tagline: string;
  description: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  filter: (restaurants: Restaurant[]) => Restaurant[];
  href: string;
}

const COLLECTIONS: Collection[] = [
  {
    id: "trending",
    label: "Trending Now",
    tagline: "Most visited this week",
    description: "These spots are buzzing — see what everyone's talking about.",
    emoji: "🔥",
    gradient: "from-orange-600 via-rose-500 to-pink-600",
    accentColor: "#f97316",
    filter: (r) => [...r].sort((a, b) => b.view_count - a.view_count),
    href: "/restaurants?ordering=-view_count",
  },
  {
    id: "wifi",
    label: "Free WiFi",
    tagline: "Work & dine",
    description: "Your laptop is welcome here.",
    emoji: "📶",
    gradient: "from-blue-600 via-indigo-500 to-violet-600",
    accentColor: "#6366f1",
    filter: (r) =>
      r.filter(
        (x) =>
          x.amenities?.toLowerCase().includes("wifi") ||
          x.amenities?.toLowerCase().includes("wofi")
      ),
    href: "/restaurants?amenities=wifi",
  },
  {
    id: "big-menu",
    label: "Biggest Menus",
    tagline: "Spoilt for choice",
    description: "Can't decide? More options means something for everyone.",
    emoji: "🍽️",
    gradient: "from-emerald-600 via-teal-500 to-cyan-600",
    accentColor: "#10b981",
    filter: (r) => [...r].sort((a, b) => b.menus_count - a.menus_count),
    href: "/restaurants?ordering=-menus_count",
  },
  {
    id: "parking",
    label: "Has Parking",
    tagline: "Drive & dine",
    description: "No parking stress. Just good food.",
    emoji: "🅿️",
    gradient: "from-violet-600 via-purple-500 to-fuchsia-600",
    accentColor: "#8b5cf6",
    filter: (r) =>
      r.filter((x) => x.amenities?.toLowerCase().includes("parking")),
    href: "/restaurants?amenities=parking",
  },
  {
    id: "new",
    label: "Newly Added",
    tagline: "Fresh spots",
    description: "Be the first to explore the newest places in town.",
    emoji: "🆕",
    gradient: "from-pink-600 via-rose-500 to-orange-500",
    accentColor: "#ec4899",
    filter: (r) =>
      [...r].sort(
        (a, b) =>
          new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
      ),
    href: "/restaurants?ordering=-created_on",
  },
  {
    id: "kathmandu",
    label: "In Kathmandu",
    tagline: "Capital's finest",
    description: "The best of Nepal's food capital, all in one place.",
    emoji: "📍",
    gradient: "from-amber-600 via-yellow-500 to-orange-400",
    accentColor: "#f59e0b",
    filter: (r) =>
      r.filter((x) => x.city?.toLowerCase() === "kathmandu"),
    href: "/restaurants?city=Kathmandu",
  },
];

function resolvePhoto(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = BASE_URL?.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ── Small card (5 of them) ────────────────────────────────────────────────────
function SmallCard({
  collection,
  restaurants,
  loading,
}: {
  collection: Collection;
  restaurants: Restaurant[];
  loading: boolean;
}) {
  const filtered = collection.filter(restaurants);
  const count = filtered.length;
  const top = filtered[0];
  const photo = resolvePhoto(top?.cover_photo?.photo_url);

  return (
    <Link
      href={collection.href}
      className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col min-h-[200px]"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {!loading && photo ? (
          <Image
            src={photo}
            alt={collection.label}
            fill
            className="object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500"
            sizes="300px"
          />
        ) : null}
        <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-90`} />
      </div>

      {/* Content */}
      <div className="relative flex flex-col h-full p-5 justify-between">
        <div>
          <span className="text-3xl">{collection.emoji}</span>
          {!loading && (
            <span className="ml-2 text-[10px] font-bold text-white/70 bg-white/20 px-2 py-0.5 rounded-full">
              {count} places
            </span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
            {collection.tagline}
          </p>
          <p className="text-base font-bold text-white leading-tight">
            {collection.label}
          </p>
          <p className="text-xs text-white/60 mt-1 line-clamp-2">
            {collection.description}
          </p>

          <div className="mt-3 flex items-center gap-1 text-white/80 text-xs font-semibold group-hover:text-white transition-colors">
            Explore
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl" />
      )}
    </Link>
  );
}

// ── Big featured card ─────────────────────────────────────────────────────────
function BigCard({
  collection,
  restaurants,
  loading,
}: {
  collection: Collection;
  restaurants: Restaurant[];
  loading: boolean;
}) {
  const filtered = collection.filter(restaurants);
  const count = filtered.length;
  const top3 = filtered.slice(0, 3);

  return (
    <Link
      href={collection.href}
      className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col min-h-[420px] lg:min-h-full"
    >
      {/* Background images stacked */}
      <div className="absolute inset-0">
        {!loading && top3.map((r, i) => {
          const photo = resolvePhoto(r.cover_photo?.photo_url);
          if (!photo) return null;
          return (
            <Image
              key={r.id}
              src={photo}
              alt={r.name}
              fill
              className="object-cover transition-all duration-700"
              style={{
                opacity: i === 0 ? 0.5 : i === 1 ? 0.2 : 0.1,
                transform: `scale(${1 + i * 0.05})`,
              }}
              sizes="600px"
            />
          );
        })}
        <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient}`}
          style={{ opacity: top3.length > 0 ? 0.75 : 1 }}
        />
        {/* Bottom dark fade for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col h-full p-7 justify-between">
        {/* Top */}
        <div className="flex items-start justify-between">
          <span className="text-5xl drop-shadow-lg">{collection.emoji}</span>
          {!loading && (
            <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {count} {count === 1 ? "place" : "places"}
            </span>
          )}
        </div>

        {/* Bottom text */}
        <div>
          <p className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-2">
            {collection.tagline}
          </p>
          <h3 className="text-3xl font-bold text-white leading-tight mb-3">
            {collection.label}
          </h3>
          <p className="text-sm text-white/75 leading-relaxed mb-5 max-w-xs">
            {collection.description}
          </p>

          {/* Restaurant name previews */}
          {!loading && top3.length > 0 && (
            <div className="flex flex-col gap-1 mb-5">
              {top3.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                  <span className="text-xs text-white/70 line-clamp-1">{r.name}, {r.city}</span>
                </div>
              ))}
            </div>
          )}

          <div className="inline-flex items-center gap-2 bg-white text-secondary text-sm font-bold px-5 py-2.5 rounded-xl group-hover:bg-amber-50 transition-colors">
            Browse collection
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl" />
      )}
    </Link>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CuratedCollections() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/restaurant/?status=true&page_size=200`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => setRestaurants(d.results ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = COLLECTIONS;

  return (
    <section className="px-6 py-14 bg-[#fdf8f3]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <span className="inline-block bg-secondary/10 text-secondary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3">
              ✨ Curated For You
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-[#1a0a00] leading-tight">
              Browse by <span className="text-secondary italic">Collection</span>
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Handpicked restaurants for every mood and occasion.
            </p>
          </div>
          <Link
            href="/restaurants"
            className="shrink-0 text-sm font-semibold text-secondary border border-secondary/30 rounded-xl px-4 py-2 hover:bg-secondary hover:text-white transition-all"
          >
            All restaurants →
          </Link>
        </div>

        {/* Magazine layout: 1 big + 5 small */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Big featured card — takes 1 col on mobile, 1 col on lg */}
          <div className="lg:col-span-1 lg:row-span-2">
            <BigCard collection={featured} restaurants={restaurants} loading={loading} />
          </div>

          {/* 5 small cards in 2x col grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {rest.map((c) => (
              <SmallCard key={c.id} collection={c} restaurants={restaurants} loading={loading} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}