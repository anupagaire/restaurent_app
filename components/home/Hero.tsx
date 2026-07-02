"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";


const POPULAR_SEARCHES = ["Momo", "Chowmein", "Pasta", "Coffee", "Newari Khaja", "Pizza"];


export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [entered, setEntered] = useState(false);
  const heroRef = useRef(null);

  // Parallax
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Entrance animation trigger
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600&family=Outfit:wght@300;400;500&display=swap');

        :root {
          --cream:   #F2E8D5;
          --gold:    #C9973A;
          --gold-lt: #E8B85A;
          --red:     #9B2335;
          --ink:     #1A0D06;
          --mist:    rgba(242,232,213,0.08);
        }

        .hero {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 640px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
        }

        /* ── Background image with parallax ── */
        .hero__bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          transform: translateY(calc(var(--scroll) * 0.35px));
          will-change: transform;
        }
        .hero__bg img {
          object-position: center 60%;
        }
@media (min-width: 769px) {
  .hero__bg {
    inset: -80px 0;
  }
}
        /* ── Layered overlays ── */
        .hero__overlay-base {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
    to bottom,
    rgba(14,6,2,0.35) 0%,
    rgba(14,6,2,0.55) 55%,
    rgba(14,6,2,0.65) 90%,
    rgba(14,6,2,0.75) 100%
  );
        }

        /* Warm vignette sides */
        .hero__overlay-vignette {
          position: absolute;
          inset: 0;
          z-index: 2;
          background:
            radial-gradient(ellipse at 0% 50%, rgba(155,35,53,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 100% 50%, rgba(201,151,58,0.12) 0%, transparent 55%);
        }

        /* Grain texture */
        .hero__grain {
          position: absolute;
          inset: 0;
          z-index: 3;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        /* ── Decorative border frame ── */
        .hero__frame {
          position: absolute;
          inset: 20px;
          z-index: 4;
          border: 1px solid rgba(201,151,58,0.22);
          pointer-events: none;
        }
        .hero__frame::before {
          content: '';
          position: absolute;
          inset: 6px;
          border: 1px solid rgba(201,151,58,0.1);
        }
        /* Corner ornaments */
        .hero__frame::after {
          content: '';
          position: absolute;
          top: -1px; left: -1px;
          width: 32px; height: 32px;
          border-top: 2px solid var(--gold);
          border-left: 2px solid var(--gold);
        }
        .corner-br, .corner-tl-r, .corner-bl {
          position: absolute;
          width: 32px; height: 32px;
          pointer-events: none;
        }
        .corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid var(--gold); border-right: 2px solid var(--gold); }
        .corner-tl-r { top: -1px; right: -1px; border-top: 2px solid var(--gold); border-right: 2px solid var(--gold); }
        .corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid var(--gold); border-left: 2px solid var(--gold); }

        /* ── Content ── */
        .hero__content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 1px;
          width: 100%;
          max-width: 860px;
        }

        /* ── Entrance animations ── */
        .anim {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1);
        }
        .anim.in { opacity: 1; transform: translateY(0); }

        /* ── Eyebrow ── */
        .hero__eyebrow {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition-delay: 0.05s;
        }
        .hero__eyebrow span { display: inline-block; width: 28px; height: 1px; background: var(--gold); opacity: 0.6; }

        /* ── Headline ── */
        .hero__headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(48px, 8vw, 96px);
          font-weight: 600;
          line-height: 0.95;
          color: var(--cream);
          letter-spacing: -0.01em;
          margin-bottom: 0;
          transition-delay: 0.15s;
        }
        .hero__headline em {
          font-style: italic;
          font-weight: 300;
          color: var(--gold-lt);
        }

        /* ── Gold rule + sub ── */
        .hero__rule {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 22px 0 18px;
          transition-delay: 0.25s;
        }
        .hero__rule::before, .hero__rule::after {
          content: '';
          flex: 1;
          max-width: 120px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,151,58,0.5));
        }
        .hero__rule::after { background: linear-gradient(90deg, rgba(201,151,58,0.5), transparent); }
        .hero__rule-diamond {
          width: 6px; height: 6px;
          background: var(--gold);
          transform: rotate(45deg);
        }

        .hero__sub {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(13px, 1.6vw, 16px);
          font-weight: 300;
          color: rgba(242,232,213,0.65);
          letter-spacing: 0.04em;
          max-width: 480px;
          line-height: 1.65;
          margin-bottom: 36px;
          transition-delay: 0.3s;
        }

        /* ── Search bar ── */
        .hero__search-wrap {
          width: 100%;
          max-width: 560px;
          margin-bottom: 28px;
          transition-delay: 0.4s;
        }
        .hero__search {
          display: flex;
          align-items: center;
          background: rgba(242,232,213,0.08);
          border: 1px solid rgba(201,151,58,0.35);
          border-radius: 3px;
          overflow: hidden;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: border-color 0.3s;
        }
        .hero__search:focus-within {
          border-color: rgba(201,151,58,0.7);
          background: rgba(242,232,213,0.12);
        }
        .hero__search-icon {
          padding: 0 16px;
          color: rgba(201,151,58,0.7);
          font-size: 18px;
          flex-shrink: 0;
        }
        .hero__search input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cream);
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.04em;
          padding: 16px 0;
        }
        .hero__search input::placeholder { color: rgba(242,232,213,0.35); }
        .hero__search-btn {
          background: #E63946;
          padding: 0 28px;
          height: 54px;
          cursor: pointer;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: white;
          transition: background 0.25s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .hero__search-btn:hover { background: var(--gold-lt); }

        /* Quick pills */
        .hero__pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 12px;
        }
        .hero__pill {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: rgba(242,232,213,0.5);
          padding: 5px 14px;
          border: 1px solid rgba(242,232,213,0.12);
          border-radius: 2px;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          background: transparent;
        }
        .hero__pill:hover {
          color: var(--gold-lt);
          border-color: rgba(201,151,58,0.4);
          background: rgba(201,151,58,0.06);
        }

        /* ── CTA buttons ── */
        .hero__ctas {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
          transition-delay: 0.5s;
        }
        .hero__btn-primary {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: white;
          background: #E63946;
          border: none;
          padding: 15px 38px;
          border-radius: 2px;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: background 0.25s, transform 0.2s;
        }
        .hero__btn-primary:hover { background: primary; transform: translateY(-2px); }
        .hero__btn-primary svg { width: 14px; height: 14px; }

        .hero__btn-secondary {
          
          
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: border-color 0.25s, background 0.25s, transform 0.2s;
        }
        .hero__btn-secondary:hover {
          border-color: rgba(242,232,213,0.6);
          background: rgba(242,232,213,0.06);
          transform: translateY(-2px);
        }

      

        /* Scroll indicator */
        .hero__scroll {
          position: absolute;
          bottom: 38px;
          right: 44px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.9s ease 0.9s;
        }
        .hero__scroll.in { opacity: 1; }
        .hero__scroll span {
          font-family: 'Outfit', sans-serif;
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(201,151,58,0.5);
          writing-mode: vertical-rl;
        }
        .hero__scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(201,151,58,0.5), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%,100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(0.5); opacity: 1; }
        }

        @media (max-width: 600px) {
          .hero__frame { inset: 10px; }
          .hero__stat { padding: 0 20px; }
          .hero__scroll { display: none; }
          .hero__ctas { flex-direction: column; align-items: center; }
          .hero__btn-primary, .hero__btn-secondary { width: 100%; justify-content: center; }
        }
          
      `}</style>

      <section
        className="hero"
        ref={heroRef}
        style={{ "--scroll": String(scrollY) } as React.CSSProperties}
      >
    
        <div className="hero__bg">
          <Image
  src="/bg.png"
  alt="Best Restaurants in Nepal"
  fill
  priority
  style={{ objectFit: "cover" }}
/>

 <img
    src="/bg1.jpg"
    alt="Best Restaurants in Nepal"
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />

        </div>

        {/* ── Overlays ── */}
        <div className="hero__overlay-base" />
        <div className="hero__overlay-vignette" />
        <div className="hero__grain" />
{/* <div className="hero__top-fade" /> */}
        {/* ── Decorative frame ── */}
        <div className="hero__frame" aria-hidden="true">
          <div className="corner-br" />
          <div className="corner-tl-r" />
          <div className="corner-bl" />
        </div>

        {/* ── Main content ── */}
        <div className="hero__content">

          <p className={`hero__eyebrow anim${entered ? " in" : ""}`}>
            <span />
            Kathmandu · Pokhara · Beyond
            <span />
          </p>

          <h1 className={`hero__headline anim${entered ? " in" : ""}`}>
            Nepal&apos;s <em>Finest</em><br />
            Restaurants
          </h1>

          <div className={`hero__rule anim${entered ? " in" : ""}`}>
            <div className="hero__rule-diamond" />
          </div>

          <p className={`hero__sub anim${entered ? " in" : ""}`}>
            Discover, compare menus &amp; book tables at the best restaurants
            across Nepal — from soulful dal bhat to world cuisine.
          </p>

          {/* Search */}
          <div className={`hero__search-wrap anim${entered ? " in" : ""}`}>
            <form onSubmit={handleSearch}>
              <div className="hero__search">
                <div className="hero__search-icon">
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
                />
                <button type="submit" className="hero__search-btn font-bold">Search</button>
              </div>
            </form>

            <div className="hero__pills">
              {POPULAR_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  className="hero__pill"
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
          <div className={`hero__ctas anim${entered ? " in" : ""}`}>
            <Link href="/restaurants" className="hero__btn-primary">
              Browse Restaurants
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/menusearch" className="hero__btn-secondary border border-[rgba(242,232,213,0.3)] px-[18px] py-[2px] rounded-sm cursor-pointer no-underline text-xs font-normal tracking-[0.22em] uppercase text-[var(--cream)] bg-transparent">
              Compare Menus
            </Link>
          </div>
        </div>

       
      </section>
    </>
  );
}