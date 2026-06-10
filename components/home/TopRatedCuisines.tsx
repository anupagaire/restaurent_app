"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionHeader from '@/components/layout/SectionHeader';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const CUISINES = [
  { label: "Momo",     emoji: "🥟", query: "momo",     tagline: "Best Momo in Town" },
  { label: "Pizza",    emoji: "🍕", query: "pizza",    tagline: "Best Pizza Near You" },
  { label: "Burger",   emoji: "🍔", query: "burger",   tagline: "Top Burgers Ranked" },
  { label: "Chowmein", emoji: "🍜", query: "chowmein", tagline: "Best Chowmein Spots" },
  { label: "Thali",    emoji: "🍱", query: "thali",    tagline: "Best Thali Deals" },
  { label: "Sekuwa",   emoji: "🍢", query: "sekuwa",   tagline: "Top Sekuwa Places" },
];

interface TopItem {
  id: number;
  name: string;
  price: number;
  rating: number;
  ratingCount: number;
  restaurantName: string;
  restaurantCity: string;
  photo: string | null;
  restaurantSlug: string;
}

function resolvePhoto(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = BASE_URL?.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function fetchTopForCuisine(query: string): Promise<TopItem | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/menu/search/?search=${encodeURIComponent(query)}&page_size=50`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();

    const menus = (data.results ?? []).filter(
      (m: any) =>
        m.status &&
        m.name.toLowerCase().includes(query.toLowerCase()) &&
        parseFloat(m.rating_average) > 0
    );
    if (!menus.length) return null;

    // pick highest rated
    const top = menus.sort(
      (a: any, b: any) => parseFloat(b.rating_average) - parseFloat(a.rating_average)
    )[0];

    // fetch restaurant info
    let restaurantName = `Restaurant #${top.restaurant}`;
    let restaurantCity = "";
    let restaurantSlug = "";
    let coverPhoto: string | null = null;

    try {
      const rRes = await fetch(`${BASE_URL}/api/v1/restaurant/${top.restaurant}/`, {
        cache: "no-store",
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        restaurantName = rData.name ?? restaurantName;
        restaurantCity = rData.city ?? "";
        restaurantSlug = toSlug(rData.name ?? "");
        coverPhoto = resolvePhoto(rData.cover_photo?.photo_url);
      }
    } catch {}

    const menuPhoto = resolvePhoto(top.photos?.[0]?.photo_url);

    return {
      id: top.id,
      name: top.name,
      price: parseFloat(top.price) || 0,
      rating: parseFloat(top.rating_average) || 0,
      ratingCount: top.rating_count ?? 0,
      restaurantName,
      restaurantCity,
      photo: menuPhoto ?? coverPhoto,
      restaurantSlug,
    };
  } catch {
    return null;
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className="text-xs"
          style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#e5e7eb" }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function CuisineCard({
  cuisine,
}: {
  cuisine: (typeof CUISINES)[number];
}) {
  const [item, setItem] = useState<TopItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopForCuisine(cuisine.query).then((result) => {
      setItem(result);
      setLoading(false);
    });
  }, [cuisine.query]);

  return (
    <Link
      href={`/menusearch?q=${encodeURIComponent(cuisine.query)}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm hover:shadow-lg hover:border-[#513012]/30 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Top photo area */}
      <div className="relative h-36 w-full bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-amber-100/60" />
        ) : item?.photo ? (
          <Image
            src={item.photo}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-5xl">
            {cuisine.emoji}
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Rank badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#513012] px-2.5 py-1 text-[10px] font-bold text-amber-200 shadow">
          🏆 #{1} {cuisine.label}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-amber-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-amber-100" />
          </div>
        ) : item ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#513012]/60">
              {cuisine.tagline}
            </p>
            <p className="font-semibold text-[#1a0a00] text-sm leading-tight line-clamp-1 group-hover:text-[#513012] transition-colors">
              {item.name}
            </p>
            <p className="text-xs text-gray-400 line-clamp-1">
              📍 {item.restaurantName}
              {item.restaurantCity ? `, ${item.restaurantCity}` : ""}
            </p>
            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                <Stars rating={item.rating} />
                <span className="text-[10px] text-gray-400">
                  {item.rating.toFixed(1)} ({item.ratingCount})
                </span>
              </div>
              <span className="text-xs font-bold text-[#513012]">
                Rs. {item.price.toLocaleString()}
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#513012]/60">
              {cuisine.tagline}
            </p>
            <p className="text-xs text-gray-400">Tap to explore {cuisine.label} options</p>
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-amber-50 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs text-gray-400">See all {cuisine.label}</span>
        <span className="text-xs font-semibold text-[#513012] group-hover:translate-x-1 transition-transform inline-block">
          →
        </span>
      </div>
    </Link>
  );
}

export default function TopRatedCuisines() {
  return (
    <section className="px-6 py-14 bg-[#fdf8f3]">
      <div className="max-w-5xl mx-auto">



<SectionHeader
  badge="🏆 Crowd Favourites"
  title="Top Rated"
  highlight="by Cuisine"
  subtitle="The highest-rated dish in each category — based on real reviews."
  linkText="Explore all"
  linkHref="/menusearch"
/>


        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CUISINES.map((cuisine) => (
            <CuisineCard key={cuisine.query} cuisine={cuisine} />
          ))}
        </div>
      </div>
    </section>
  );
}