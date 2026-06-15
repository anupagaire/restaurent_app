"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionHeader from '@/components/layout/SectionHeader';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface MenuItem {
  id: number;
  restaurant: number;
  name: string;
  price: string;
  rating_average: string;
  rating_count: number;
  photos: { photo_url: string }[];
  status: boolean;
}

interface RestaurantInfo {
  id: number;
  name: string;
  city: string;
  cover_photo: { photo_url: string } | null;
  seo: { slug: string };
}

interface MoodCard {
  query: string;
  headline: string;
  sub: string;
  cta: string;
  fallbackGradient: string;
  accentLight: string;
  accentDark: string;
  staticPhoto?: string;
}

const MOODS: MoodCard[] = [
  {
    query: "coffee",
    headline: "Some Conversations Need the Right Cup",
    sub: "Cafés worth lingering in",
    cta: "Find a café",
    fallbackGradient: "from-stone-900 via-amber-950 to-stone-800",
    accentLight: "#fde68a",
    accentDark: "#92400e",
    staticPhoto: "/coffee.jpg",

  },
  {
    query: "pizza",
    headline: "Every Great Evening Starts with a Slice",
    sub: "The best pizzas, ranked",
    cta: "See pizza spots",
    fallbackGradient: "from-red-950 via-orange-950 to-stone-900",
    accentLight: "#fed7aa",
    accentDark: "#9a3412",
        staticPhoto: "/pizza.jpg",

  },
];

function resolvePhoto(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = BASE_URL?.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function fetchMoodData(query: string): Promise<{
  photo: string | null;
  topRestaurant: string;
  city: string;
  count: number;
  slug: string;
}> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/menu/search/?search=${encodeURIComponent(query)}&page_size=50`,
      { cache: "no-store" }
    );
    if (!res.ok) return { photo: null, topRestaurant: "", city: "", count: 0, slug: "" };
    const data = await res.json();

    const items: MenuItem[] = (data.results ?? []).filter(
      (m: MenuItem) =>
        m.status && m.name.toLowerCase().includes(query.toLowerCase())
    );

    if (!items.length) return { photo: null, topRestaurant: "", city: "", count: 0, slug: "" };

    const top = [...items].sort(
      (a, b) => parseFloat(b.rating_average) - parseFloat(a.rating_average)
    )[0];

    // get restaurant info
    let name = "", city = "", slug = "";
    let rPhoto: string | null = null;
    try {
      const rRes = await fetch(`${BASE_URL}/api/v1/restaurant/${top.restaurant}/`, {
        cache: "no-store",
      });
      if (rRes.ok) {
        const r: RestaurantInfo = await rRes.json();
        name = r.name;
        city = r.city;
        slug = r.seo?.slug ?? toSlug(r.name);
        rPhoto = resolvePhoto(r.cover_photo?.photo_url);
      }
    } catch {}

    const menuPhoto = resolvePhoto(top.photos?.[0]?.photo_url);
    const uniqueRestaurants = new Set(items.map((i) => i.restaurant)).size;

    return {
      photo: menuPhoto ?? rPhoto,
      topRestaurant: name,
      city,
      count: uniqueRestaurants,
      slug,
    };
  } catch {
    return { photo: null, topRestaurant: "", city: "", count: 0, slug: "" };
  }
}

// ── Single cinematic card ────────────────────────────────────────────────────
function CinematicCard({
  mood,
  index,
}: {
  mood: MoodCard;
  index: number;
}) {
  const [photo, setPhoto] = useState<string | null>(mood.staticPhoto ?? null);

  const [meta, setMeta] = useState({ topRestaurant: "", city: "", count: 0, slug: "" });
  const [loaded, setLoaded] = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Parallax
  useEffect(() => {
    const handleScroll = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      setScrollY(center * 0.15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

useEffect(() => {
  fetchMoodData(mood.query).then((d) => {
    setPhoto(d.photo || mood.staticPhoto || null);

    setMeta({
      topRestaurant: d.topRestaurant,
      city: d.city,
      count: d.count,
      slug: d.slug,
    });

    setLoaded(true);
  });
}, [mood.query, mood.staticPhoto]);

  return (
    <div
      ref={cardRef}
      className="relative flex-shrink-0 w-[85vw] sm:w-[60vw] lg:w-[45vw] h-[70vh] min-h-[480px] max-h-[640px] rounded-3xl overflow-hidden shadow-2xl"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Background layer with parallax */}
      <div
        className="absolute inset-[-10%] w-[120%] h-[120%]"
        style={{ transform: `translateY(${scrollY}px)` }}
      >
        {photo && (
         
          <img
  src={photo}
  alt={mood.query}
  className="absolute inset-0 w-full h-full object-cover"
/>
        )}

<div
  className={`absolute inset-0 bg-gradient-to-br ${mood.fallbackGradient} opacity-60`}
/>
        {/* Bottom text gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/30 to-transparent" />
      </div>

      {/* Skeleton shimmer */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-800 to-stone-700" />
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-8 sm:p-10">
        {/* Top badge */}
        <div className="self-start">
          {loaded && meta.count > 0 && (
            <span
              className="text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
              style={{ background: `${mood.accentLight}22`, color: mood.accentLight, border: `1px solid ${mood.accentLight}44` }}
            >
              {meta.count} {meta.count === 1 ? "restaurant" : "restaurants"}
            </span>
          )}
        </div>

        {/* Bottom content */}
        <div className="space-y-4">
          {/* Sub label */}
          <p
            className="text-xs font-bold tracking-[0.25em] uppercase"
            style={{ color: mood.accentLight, opacity: 0.8 }}
          >
            {mood.sub}
          </p>

          {/* Big headline */}
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight max-w-xs">
            {mood.headline}
          </h3>

          {/* Top restaurant hint */}
          {loaded && meta.topRestaurant && (
            <p className="text-sm text-white/50">
              Top pick: <span className="text-white/80 font-medium">{meta.topRestaurant}</span>
              {meta.city ? `, ${meta.city}` : ""}
            </p>
          )}

          {/* CTA */}
          <Link
            href={`/menusearch?q=${encodeURIComponent(mood.query)}`}
            className="inline-flex items-center gap-2.5 mt-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 hover:gap-4 hover:shadow-lg active:scale-95"
            style={{
              background: mood.accentLight,
              color: mood.accentDark,
            }}
          >
            {mood.cta}
            <span className="text-base">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function MoodCollections() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <section className="py-16 bg-[#0f0a06] overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 mb-8 flex items-end justify-between">
          <SectionHeader
  title="Find the Right Place,"
  highlight="Right Now"
    titleClassName="bg-white bg-clip-text text-transparent font-bold"
subtitleClassName="text-white"
  subtitle="Discover what we offer to make your dining experience unforgettable."
  withAnimation={false}
  withDivider={false}
/>
      
        {/* Arrow controls */}
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full border border-white/20 text-white/60 hover:border-accent/60 hover:text-accent transition-all flex items-center justify-center text-sm"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full border border-white/20 text-white/60 hover:border-accent/60 hover:text-accent transition-all flex items-center justify-center text-sm"
          >
            →
          </button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-5 px-6 overflow-x-auto scroll-smooth pb-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          paddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))",
        }}
      >
        {MOODS.map((mood, i) => (
          <CinematicCard key={mood.query} mood={mood} index={i} />
        ))}

        {/* End spacer */}
        <div className="flex-shrink-0 w-6" />
      </div>

      {/* Scroll hint */}
      <div className="flex justify-center mt-6 gap-1.5">
        {MOODS.map((m, i) => (
          <div
            key={m.query}
            className="w-1.5 h-1.5 rounded-full bg-white/20"
          />
        ))}
      </div>
    </section>
  );
}