"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function AdBanner() {
  const [ads, setAds] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/illustration/?page_size=1000`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        // Paginated response handle garne
        const allAds = data.results || data;

        // No "enabled" field exists on the API yet — existence of the
        // banner IS the on/off switch. Delete it in admin to hide it.
        setAds(allAds);
      } catch (err) {
        console.error("Failed to fetch ads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % ads.length);
  }, [ads.length]);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + ads.length) % ads.length);
  };

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [ads.length, next]);

  if (loading) {
    return <div className="w-full h-50 bg-gray-100 animate-pulse rounded-lg" />;
  }

  // Active ad chaina bhaye kei nadekhauune
  if (!ads.length) return null;

  // Single active ad bhaye direct image dekhauune
  if (ads.length === 1) {
    const ad = ads[0];
    const Wrapper = ad.external_link ? Link : "div";
    return (
      <Wrapper
        href={ad.external_link || "#"}
        target={ad.external_link ? "_blank" : undefined}
        rel={ad.external_link ? "noopener noreferrer" : undefined}
        className="block w-full relative overflow-hidden rounded-lg"
      >
        <Image
          src={`${ad.image}${ad.image.includes("?") ? "&" : "?"}v=${encodeURIComponent(ad.updated_on || ad.id)}`}
          alt={ad.alt || "Advertisement"}
          width={800}
          height={100}
        
            className="w-full h-32 md:h-44 lg:h-160 object-cover"

          priority
        />
      </Wrapper>
    );
  }

  // Multiple active ads bhaye slider dekhauune
  return (
    <div className="relative w-full overflow-hidden rounded-lg group">
      <div className="relative w-full">
        {ads.map((a, i) => {
          const Wrapper = a.external_link ? Link : "div";
          return (
            <div
              key={a.id}
              className={`transition-opacity duration-500 ${
                i === current ? "opacity-100" : "opacity-0 absolute inset-0"
              }`}
            >
              <Wrapper
                href={a.external_link || "#"}
                target={a.external_link ? "_blank" : undefined}
                rel={a.external_link ? "noopener noreferrer" : undefined}
                className="block w-full"
              >
                <Image
                  src={`${a.image}${a.image.includes("?") ? "&" : "?"}v=${encodeURIComponent(a.updated_on || a.id)}`}
                  alt={a.alt || "Advertisement"}
                  width={800}
                  height={100}
                    className="w-full h-32 md:h-44 lg:h-160 object-cover"

                  priority={i === 0}
                />
              </Wrapper>
            </div>
          );
        })}
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next"
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {ads.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-white scale-125" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}