"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Coffee, Pizza, MapPin, Star } from "lucide-react";
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
  icon: React.ReactNode;
  staticPhoto?: string;
}

const MOODS: MoodCard[] = [
  {
    query: "coffee",
    headline: "Some Conversations Need the Right Cup",
    sub: "Cafés worth lingering in",
    cta: "Find a café",
    icon: <Coffee className="w-6 h-6" />,
    staticPhoto: "/coffee.jpg",
  },
  {
    query: "pizza",
    headline: "Every Great Evening Starts with a Slice",
    sub: "The best pizzas, ranked",
    cta: "See pizza spots",
    icon: <Pizza className="w-6 h-6" />,
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
  avgRating: number;
}> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/menu/search/?search=${encodeURIComponent(query)}&page_size=50`,
      { cache: "no-store" }
    );
    if (!res.ok) return { photo: null, topRestaurant: "", city: "", count: 0, slug: "", avgRating: 0 };
    const data = await res.json();

    const items: MenuItem[] = (data.results ?? []).filter(
      (m: MenuItem) =>
        m.status && m.name.toLowerCase().includes(query.toLowerCase())
    );

    if (!items.length) return { photo: null, topRestaurant: "", city: "", count: 0, slug: "", avgRating: 0 };

    const top = [...items].sort(
      (a, b) => parseFloat(b.rating_average) - parseFloat(a.rating_average)
    )[0];

    let name = "", city = "", slug = "";
    let rPhoto: string | null = null;
    let avgRating = parseFloat(top.rating_average) || 0;
    
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
      avgRating,
    };
  } catch {
    return { photo: null, topRestaurant: "", city: "", count: 0, slug: "", avgRating: 0 };
  }
}

// ── Star Rating Display ──────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="w-4 h-4"
            style={{
              fill: star <= Math.round(rating) ? '#FFB703' : 'rgba(255,255,255,0.2)',
              color: star <= Math.round(rating) ? '#FFB703' : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm text-white/80 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ── Mood Card ─────────────────────────────────────────────
function MoodCard({
  mood,
  index,
}: {
  mood: MoodCard;
  index: number;
}) {
  const [photo, setPhoto] = useState<string | null>(mood.staticPhoto ?? null);
  const [meta, setMeta] = useState({ 
    topRestaurant: "", 
    city: "", 
    count: 0, 
    slug: "",
    avgRating: 0 
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchMoodData(mood.query).then((d) => {
      setPhoto(d.photo || mood.staticPhoto || null);
      setMeta({
        topRestaurant: d.topRestaurant,
        city: d.city,
        count: d.count,
        slug: d.slug,
        avgRating: d.avgRating,
      });
      setLoaded(true);
    });
  }, [mood.query, mood.staticPhoto]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className="relative flex-1 min-h-[500px] h-[65vh] max-h-[600px] rounded-3xl overflow-hidden shadow-2xl group"
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden bg-primary-dark">
        {photo && (
          <div className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105">
            <img
              src={photo}
              alt={mood.query}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-black/70 " />
        
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
      </div>

      {/* Glowing accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-8 sm:p-10">
        {/* Top section */}
        <div className="flex items-start justify-between">
          {/* Mood icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-2xl" />
            <div className="relative w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-accent shadow-lg">
              {mood.icon}
            </div>
          </div>
          
          {/* Badge */}
          {loaded && meta.count > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full border bg-white/5 backdrop-blur-sm border-white/10 text-white/80"
            >
              {meta.count} {meta.count === 1 ? "place" : "places"}
            </motion.span>
          )}
        </div>

        {/* Bottom content */}
        <div className="space-y-5">
          {/* Sub label */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-0.5 bg-accent/50" />
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-white/50">
              {mood.sub}
            </p>
          </div>

          {/* Headline */}
          <h3 className="text-3xl sm:text-4xl lg:text-4xl font-serif font-bold text-white leading-tight max-w-md">
            {mood.headline}
          </h3>

          {/* Restaurant info */}
          {loaded && meta.topRestaurant && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2.5"
            >
              <div className="flex items-center gap-2.5 text-sm text-white/60">
                <span className="font-medium text-white/90">{meta.topRestaurant}</span>
                
              </div>
              {meta.avgRating > 0 && (
                <RatingStars rating={meta.avgRating} />
              )}
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            className="pt-2"
          >
            <Link
              href={`/menusearch?q=${encodeURIComponent(mood.query)}`}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-accent to-accent/80 text-primary-dark shadow-lg shadow-accent/20 hover:shadow-accent/40 group/btn"
            >
              <span>{mood.cta}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function MoodCollections() {
  return (
    <section className="py-20 bg-[#faf7f0] overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-12">
          <SectionHeader
            title="Find the Right Place,"
            highlight="Right Now"
            subtitle="Discover curated collections of the best dining experiences"
            withAnimation={false}
            withDivider={false}
          />
        </div>

        {/* Cards Grid - 2 columns, no scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {MOODS.map((mood, i) => (
            <MoodCard key={mood.query} mood={mood} index={i} />
          ))}
        </div>

      
      </div>
    </section>
  );
}