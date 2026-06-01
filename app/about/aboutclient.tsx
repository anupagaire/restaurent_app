"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────
interface HeroData {
  title: string;
  subtitle: string;
  image: string;
  overlay?: boolean;
}

interface IntroData {
  heading: string;
  subHeading: string;
  paragraphs: string[];
  image: string;
}

interface VisionSide {
  title: string;
  content: string[];
}

interface VisionData {
  left: VisionSide;
  right: VisionSide;
}

interface VibesData {
  title: string;
  images: string[];
}

interface Feature {
  title: string;
  description: string;
  image?: string;
}

interface AboutContent {
  hero: HeroData;
  introSection: IntroData;
  visionSection: VisionData;
  vibes: VibesData;
  features: Feature[];
}

// ── Carousel config ────────────────────────────────────────
const responsiveVibes = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1536 }, items: 4 },
  desktop:           { breakpoint: { max: 1536, min: 1024 }, items: 3 },
  tablet:            { breakpoint: { max: 1024, min: 640  }, items: 2 },
  mobile:            { breakpoint: { max: 640,  min: 0    }, items: 1 },
};

// ── Skeleton ───────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ── Main Component ─────────────────────────────────────────
export default function About() {
  const [data, setData]       = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/website-content/about-page/`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to fetch about page (${res.status})`);
        const json = await res.json();
        // API wraps content in aboutPageContent key
        setData(json.aboutPageContent ?? json);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load page content.");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // ── Loading State ──
  if (loading) return (
    <div className="min-h-screen w-full bg-[#faf7f2] space-y-12 p-8">
      <Skeleton className="h-[40vh] w-full rounded-none" />
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-12">
        <Skeleton className="h-[400px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );

  // ── Error State ──
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
      <p className="text-red-500 text-center">{error || "Content unavailable."}</p>
    </div>
  );

  const { hero, introSection, visionSection, vibes, features } = data;

  return (
    <div className="min-h-screen w-full bg-[#faf7f2] text-[#011659] font-light">

      {/* ── HERO ── */}
      <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={hero.image}
            className="w-full h-full object-cover"
            alt={hero.title}
          />
          {hero.overlay !== false && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
          )}
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-16">
          <h1 className="text-4xl md:text-6xl font-serif text-white tracking-[0.1em] drop-shadow-xl uppercase">
            {hero.title}
          </h1>
          <div className="w-20 h-1 bg-amber-500 mt-6 mb-4 rounded-full" />
          <p className="text-gray-200 text-lg md:text-xl italic font-light tracking-wide max-w-2xl">
            &quot;{hero.subtitle}&quot;
          </p>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="py-8 md:py-12 bg-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative h-[400px] md:h-[600px] w-full z-10 rounded-tl-[2.5rem] rounded-br-[2.5rem] overflow-hidden shadow-2xl shadow-[#8c6d46]/10 border border-[#e5d3b8]/20">
                <img
                  src={introSection.image}
                  className="w-full h-full object-cover"
                  alt="Restaurant Interior"
                />
              </div>
            </motion.div>

            <div className="order-1 lg:order-2 space-y-10 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6"
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#011659] leading-[1.15]">
                  {introSection.heading.split("Restaurant Platform")[0]}
                  <br />
                  <span className="font-serif text-[#d4b78f]">
                    {introSection.heading.includes("Restaurant Platform")
                      ? "Restaurant Platform"
                      : ""}
                  </span>
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="space-y-6 text-lg text-[#011659]/80 font-light leading-relaxed"
              >
                {introSection.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {introSection.subHeading && (
                  <h2 className="text-2xl font-medium text-[#011659]">
                    {introSection.subHeading}
                  </h2>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION ── */}
      <section className="py-12 bg-white text-black">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.3 } }, hidden: {} }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
          >
            {/* Left */}
            <motion.div
              variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="flex flex-col justify-center space-y-6 text-left"
            >
              <h2 className="text-4xl md:text-5xl font-light text-[#011659] leading-tight">
                {visionSection.left.title}
              </h2>
              <div className="space-y-2 text-lg text-[#011659]/80 font-light leading-relaxed">
                {visionSection.left.content.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </motion.div>

            {/* Right */}
            <motion.div
              variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="flex flex-col justify-center space-y-6 text-left"
            >
              <h2 className="text-4xl md:text-5xl font-light text-[#011659] leading-tight">
                {visionSection.right.title}
              </h2>
              <div className="space-y-4 text-lg text-[#011659]/80 font-light leading-relaxed">
                {visionSection.right.content.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── VIBES CAROUSEL ── */}
      {vibes.images && vibes.images.length > 0 && (
        <section className="py-8 md:py-12 bg-[#faf7f2]">
          <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-12">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-light text-[#011659]">
                {vibes.title.includes("Restaurant") ? (
                  <>
                    {vibes.title.split("Restaurant")[0]}
                    <span className="font-serif text-[#d4b78f]">Restaurant</span>
                    {vibes.title.split("Restaurant")[1]}
                  </>
                ) : vibes.title}
              </h2>
            </div>
            <div className="w-full">
              <Carousel
                responsive={responsiveVibes}
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={3000}
                keyBoardControl={true}
                customTransition="transform 500ms ease-in-out"
                transitionDuration={500}
                containerClass="carousel-container"
                removeArrowOnDeviceType={["tablet", "mobile"]}
                itemClass="px-2"
              >
                {vibes.images.map((src, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-2xl group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500 h-[400px] w-full"
                  >
                    <img
                      src={src}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      alt={`Vibe ${index + 1}`}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      {features && features.length > 0 && (
        <section className="w-full py-8 md:py-12 relative overflow-hidden bg-[#faf7f2]">
          <div className="w-full max-w-screen-xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group flex flex-col items-center p-10 rounded-xl bg-white/10 backdrop-blur border border-[#e5d3b8] shadow-md hover:shadow-xl hover:translate-y-[-4px] hover:bg-white/20 transition-all duration-300"
                >
                  <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#f5e9d6] to-white shadow-inner overflow-hidden">
                      {feature.image ? (
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-20 h-20 object-contain"
                        />
                      ) : (
                        <span className="text-4xl">🍽️</span>
                      )}
                    </div>
                  </div>
                  <h2 className="text-xl md:text-2xl font-medium text-[#d4b78f] mb-3 tracking-wide text-center">
                    {feature.title}
                  </h2>
                  <p className="text-gray-500 text-center leading-relaxed max-w-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}