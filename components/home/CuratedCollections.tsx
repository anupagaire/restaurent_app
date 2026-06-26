"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const POPULAR_SEARCHES = ["Momo", "Chowmein", "Pasta", "Coffee", "Newari Khaja", "Pizza"];

const STATS = [
  { value: "500+", label: "Restaurants" },
  { value: "12K+", label: "Happy Diners" },
  { value: "40+", label: "Cuisines" },
];

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [entered, setEntered] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/menusearch?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const animClass = (delay = "") =>
    `transition-all duration-700 ease-out ${delay} ${
      entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
    }`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&family=Outfit:wght@300;400;500&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-outfit { font-family: 'Outfit', sans-serif; }
        @keyframes scrollPulse {
          0%,100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(0.5); opacity: 1; }
        }
        .animate-scroll-pulse { animation: scrollPulse 2s ease-in-out infinite; }
        @keyframes grain {
          0%,100% { transform: translate(0,0); }
          10% { transform: translate(-2%,-3%); }
          30% { transform: translate(3%,-1%); }
          50% { transform: translate(-1%,3%); }
          70% { transform: translate(2%,1%); }
          90% { transform: translate(-3%,2%); }
        }
      `}</style>

      <section
        ref={heroRef}
        className="relative w-full overflow-hidden flex flex-col items-center justify-center font-outfit"
        style={{ height: "100svh", minHeight: "640px" }}
      >
        {/* Background image with parallax */}
        <div
          className="absolute inset-0 z-0 md:-inset-y-20 md:inset-x-0 will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.35}px)` }}
        >
          <img
            src="/bg.png"
            alt="Best Restaurants in Nepal"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }}
          />
        </div>

        {/* Base overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(14,6,2,0.35) 0%, rgba(14,6,2,0.55) 55%, rgba(14,6,2,0.65) 90%, rgba(14,6,2,0.75) 100%)",
          }}
        />

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 0% 50%, rgba(155,35,53,0.18) 0%, transparent 55%), radial-gradient(ellipse at 100% 50%, rgba(201,151,58,0.12) 0%, transparent 55%)",
          }}
        />

        {/* Grain texture */}
        <div
          className="absolute inset-0 z-30 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />

        {/* Top fade blur */}
        <div className="absolute top-0 left-0 right-0 h-10 z-40 pointer-events-none backdrop-blur-sm" />

        {/* Decorative frame */}
        <div
          className="absolute inset-5 z-40 pointer-events-none"
          style={{ border: "1px solid rgba(201,151,58,0.22)" }}
        >
          {/* Inner frame */}
          <div
            className="absolute inset-[6px]"
            style={{ border: "1px solid rgba(201,151,58,0.1)" }}
          />
          {/* Top-left corner */}
          <div
            className="absolute -top-px -left-px w-8 h-8"
            style={{ borderTop: "2px solid #C9973A", borderLeft: "2px solid #C9973A" }}
          />
          {/* Top-right corner */}
          <div
            className="absolute -top-px -right-px w-8 h-8"
            style={{ borderTop: "2px solid #C9973A", borderRight: "2px solid #C9973A" }}
          />
          {/* Bottom-left corner */}
          <div
            className="absolute -bottom-px -left-px w-8 h-8"
            style={{ borderBottom: "2px solid #C9973A", borderLeft: "2px solid #C9973A" }}
          />
          {/* Bottom-right corner */}
          <div
            className="absolute -bottom-px -right-px w-8 h-8"
            style={{ borderBottom: "2px solid #C9973A", borderRight: "2px solid #C9973A" }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-50 flex flex-col items-center text-center px-5 w-full max-w-[860px]">

          {/* Eyebrow */}
          <p className={`${animClass("delay-75")} flex items-center gap-3 font-outfit text-[11px] font-normal tracking-[0.32em] uppercase mb-[18px]`}
            style={{ color: "#C9973A" }}>
            <span className="inline-block w-7 h-px opacity-60" style={{ background: "#C9973A" }} />
            Kathmandu · Pokhara · Beyond
            <span className="inline-block w-7 h-px opacity-60" style={{ background: "#C9973A" }} />
          </p>

          {/* Headline */}
          <h1
            className={`${animClass("delay-150")} font-cormorant font-semibold  leading-[0.95] tracking-[-0.01em] mb-0`}
            style={{ fontSize: "clamp(48px, 8vw, 96px)", color: "#F2E8D5" }}
          >
            Nepal&apos;s{" "}
            <em className="not-italic font-light text-accent " style={{  fontStyle: "italic" }}>
              Finest
            </em>
            <br />
            Restaurants
          </h1>

          {/* Gold rule */}
          <div className={`${animClass("delay-200")} flex items-center gap-[14px] my-[22px]`}>
            <span
              className="flex-1 h-px"
              style={{ maxWidth: 120, background: "linear-gradient(90deg, transparent, rgba(201,151,58,0.5))" }}
            />
            <span
              className="w-[6px] h-[6px] rotate-45"
              style={{ background: "#C9973A" }}
            />
            <span
              className="flex-1 h-px"
              style={{ maxWidth: 120, background: "linear-gradient(90deg, rgba(201,151,58,0.5), transparent)" }}
            />
          </div>

          {/* Subtitle */}
          <p
            className={`${animClass("delay-300")} font-outfit font-light tracking-[0.04em] leading-[1.65] max-w-[480px] mb-9`}
            style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "rgba(242,232,213,0.65)" }}
          >
            Discover, compare menus &amp; book tables at the best restaurants
            across Nepal — from soulful dal bhat to world cuisine.
          </p>

          {/* Search */}
          <div className={`${animClass("delay-[400ms]")} w-full max-w-[560px] mb-7`}>
            <form onSubmit={handleSearch}>
              <div
                className="flex items-center rounded-sm overflow-hidden backdrop-blur-xl transition-colors"
                style={{
                  background: "rgba(242,232,213,0.08)",
                  border: "1px solid rgba(201,151,58,0.35)",
                }}
              >
                <div className="px-4 flex-shrink-0" style={{ color: "rgba(201,151,58,0.7)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M16.5 16.5L21 21" strokeLinecap="round" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a dish — momo, thakali, sekuwa…"
                  className="flex-1 bg-transparent border-none outline-none font-outfit font-light tracking-[0.04em] text-sm py-4"
                  style={{ color: "#F2E8D5" }}
                />
                <button
                  type="submit"
                  className="flex-shrink-0 border-none px-7 h-[54px] cursor-pointer font-outfit text-[11px] font-medium tracking-[0.2em] uppercase transition-colors hover:opacity-90"
                  style={{ background: "#C9973A", color: "#1A0D06" }}
                >
                  Search
                </button>
              </div>
            </form>

            {/* Pills */}
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {POPULAR_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  className="font-outfit text-[11px] font-normal tracking-[0.1em] px-[14px] py-[5px] rounded-sm cursor-pointer transition-all"
                  style={{
                    color: "rgba(242,232,213,0.5)",
                    border: "1px solid rgba(242,232,213,0.12)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = "#E8B85A";
                    (e.target as HTMLButtonElement).style.borderColor = "rgba(201,151,58,0.4)";
                    (e.target as HTMLButtonElement).style.background = "rgba(201,151,58,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = "rgba(242,232,213,0.5)";
                    (e.target as HTMLButtonElement).style.borderColor = "rgba(242,232,213,0.12)";
                    (e.target as HTMLButtonElement).style.background = "transparent";
                  }}
                  onClick={() => {
                    setQuery(tag);
                    window.location.href = `/menusearch?q=${encodeURIComponent(tag)}`;
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className={`${animClass("delay-500")} flex gap-4 flex-wrap justify-center mt-2 max-sm:flex-col max-sm:items-center`}>
            <Link
              href="/restaurants"
              className="inline-flex items-center gap-[10px] font-outfit text-[12px] font-medium tracking-[0.22em] uppercase px-[38px] py-[15px] rounded-sm transition-all hover:-translate-y-0.5 hover:opacity-90"
              style={{ background: "#C9973A", color: "#1A0D06" }}
            >
              Browse Restaurants
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/menusearch"
              className="inline-flex items-center gap-[10px] font-outfit text-[12px] font-normal tracking-[0.22em] uppercase px-[18px] py-[2px] rounded-sm transition-all hover:-translate-y-0.5 max-sm:w-full max-sm:justify-center"
              style={{
                border: "1px solid rgba(242,232,213,0.3)",
                color: "#F2E8D5",
                background: "transparent",
              }}
            >
              Compare Menus
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center transition-opacity duration-700 delay-700 ${entered ? "opacity-100" : "opacity-0"}`}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="text-center px-9 max-sm:px-5 relative"
            >
              {i > 0 && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-7"
                  style={{ background: "rgba(201,151,58,0.3)" }}
                />
              )}
              <span
                className="font-cormorant font-semibold text-[28px] leading-none block"
                style={{ color: "#E8B85A" }}
              >
                {s.value}
              </span>
              <span
                className="font-outfit font-light text-[10px] tracking-[0.25em] uppercase block mt-1"
                style={{ color: "rgba(242,232,213,0.4)" }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-[38px] right-11 z-50 flex-col items-center gap-2 transition-opacity duration-700 delay-1000 hidden sm:flex ${entered ? "opacity-100" : "opacity-0"}`}
        >
          <span
            className="font-outfit text-[9px] tracking-[0.3em] uppercase"
            style={{ color: "rgba(201,151,58,0.5)", writingMode: "vertical-rl" }}
          >
            Scroll
          </span>
          <span
            className="w-px h-10 animate-scroll-pulse"
            style={{ background: "linear-gradient(to bottom, rgba(201,151,58,0.5), transparent)" }}
          />
        </div>
      </section>
    </>
  );
}