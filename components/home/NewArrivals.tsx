'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import SectionHeader from '@/components/layout/SectionHeader';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface NewRestaurant {
  id: number;
  name: string;
  city: string;
  address: string;
  created_on: string;
  cover_photo: { photo_url: string; alt: string } | null;
  menus_count: number;
  categories_count: number;
  seo: { slug: string };
}
function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
function resolvePhoto(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = BASE_URL?.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

function daysAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="flex-shrink-0 w-52 rounded-2xl overflow-hidden bg-secondary/[0.04] border border-secondary/8 animate-pulse">
      <div className="h-36 bg-secondary/10" />
      <div className="p-4 space-y-2">
        <div className="h-3.5 bg-secondary/10 rounded-full w-3/4" />
        <div className="h-3 bg-secondary/8 rounded-full w-1/2" />
        <div className="h-3 bg-secondary/6 rounded-full w-2/3" />
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function ArrivalCard({ r, index }: { r: NewRestaurant; index: number }) {
  const photo = resolvePhoto(r.cover_photo?.photo_url);
const slug = toSlug(r.name);
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
      className="shrink-0 w-52"
    >
      <Link
        href={`/restaurants/${slug}`}
        className="group flex flex-col rounded-2xl overflow-hidden border border-secondary/8 hover:border-accent/50 bg-secondary/[0.03] hover:bg-secondary/[0.06] transition-all duration-300 h-full"
      >
        {/* Image */}
        <div className="relative h-36 overflow-hidden bg-secondary/5 shrink-0">
          {photo ? (
            <Image
              src={photo}
              alt={r.name}
              fill
              sizes="208px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-4xl opacity-20">🍽️</span>
            </div>
          )}

          {/* NEW badge */}
          <span
            className="absolute top-2.5 bg-accent text-white left-2.5 flex items-center gap-1 text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-1 rounded-full z-10"
          >
            <Sparkles size={8} />
            New
          </span>

         
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-1.5">
          <h3 className=" text-black font-bold text-base leading-snug line-clamp-1 group-hover:text-accent transition-colors">
            {r.name}
          </h3>
          <div className="flex items-center gap-1 text-secondary">
            <MapPin size={10} className="shrink-0" />
            <p className="text-xs truncate">{r.city}</p>
          </div>

          
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function NewArrivals() {
  const [restaurants, setRestaurants] = useState<NewRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch30Days = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/restaurant/?status=true&ordering=-created_on&page_size=8`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        const all: NewRestaurant[] = data.results ?? [];

        // Keep only restaurants joined in last 30 days
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const recent = all.filter(r => new Date(r.created_on).getTime() > cutoff);

        // If fewer than 2 recent ones, show latest 4 regardless of date
        setRestaurants(recent.length >= 2 ? recent : all.slice(0, 4));
      } catch (err) {
        console.error('NewArrivals fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch30Days();
  }, []);

  // Don't render section if no data
  if (!loading && restaurants.length === 0) return null;

  return (
    <section className="relative py-10 overflow-hidden">
      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
<SectionHeader
  badge="  Just Launched"
  title="New"
  highlight=" Arrivals"
  subtitle=" Fresh additions to our platform. Explore the latest restaurants that have joined our community in the past month."
  linkText="  View all"
  linkHref="/restaurants"
  withDivider={false}
/>
       
        {/* Horizontal scroll strip */}
        <div
          className="flex gap-4 overflow-x-auto pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? [...Array(4)].map((_, i) => <Skeleton key={i} />)
            : restaurants.map((r, i) => (
                <ArrivalCard key={r.id} r={r} index={i} />
              ))}
        </div>

        {/* Mobile: view all link */}
        <div className="mt-4 sm:hidden text-center">
          <Link
            href="/restaurants"
            className="text-xs text-secondary/35 hover:text-accent transition-colors"
          >
            View all restaurants →
          </Link>
        </div>

        {/* Bottom rule */}
        <div className="mt-8 w-full h-px bg-accent/12" />
      </div>
    </section>
  );
}