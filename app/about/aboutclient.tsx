"use client";

import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Image from "next/image";
import Head from "next/head";
import { motion, Variants } from "framer-motion";
import SectionHeader from "@/components/layout/SectionHeader";

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ;
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

const responsiveVibes = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1536 }, items: 4 },
  desktop:           { breakpoint: { max: 1536, min: 1024 }, items: 3 },
  tablet:            { breakpoint: { max: 1024, min: 640  }, items: 2 },
  mobile:            { breakpoint: { max: 640,  min: 0    }, items: 1 },
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-accent/20 rounded ${className}`} />;
}

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

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-[#fdf9f4] space-y-12 p-8">
      <Skeleton className="h-[55vh] w-full rounded-none" />
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-12">
        <Skeleton className="h-[420px] w-full rounded-[2rem]" />
        <div className="space-y-5 pt-8">
          <Skeleton className="h-8 w-2/3 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-5/6 rounded-full" />
          <Skeleton className="h-4 w-4/5 rounded-full" />
        </div>
      </div>
    </div>
  );

  // ── Error ──
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf9f4]">
      <p className="text-red-400 text-center font-light">{error || "Content unavailable."}</p>
    </div>
  );

  const { hero, introSection, visionSection, vibes, features } = data;

  return (
    <>
      {/* SEO Meta */}
      <Head>
        <title>{hero.title} | About Us</title>
        <meta name="description" content={hero.subtitle} />
        <meta property="og:title" content={hero.title} />
        <meta property="og:description" content={hero.subtitle} />
        {hero.image && <meta property="og:image" content={hero.image} />}
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="min-h-screen w-full bg-[#fdf9f4] text-[#271302] font-light overflow-x-hidden">

        {/* ═══════════════════════════════════════
            HERO — full-bleed cinematic
        ═══════════════════════════════════════ */}
        <section
          aria-label={`${hero.title} hero banner`}
          className="relative h-[60vh] md:h-[72vh] w-full overflow-hidden"
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={hero.image}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
              alt={hero.title}
            />
          </div>

          {/* Layered overlay: rich warm gradient */}
          {hero.overlay !== false && (
            <div className="absolute inset-0 bg-gradient-to-b from-primary/75 via-secondary/35 to-[#fdf9f4]" />
          )}

          {/* Gold corner accent lines */}
          <div aria-hidden="true" className="absolute top-8 left-8 w-20 h-20 border-l border-t border-accent/60 pointer-events-none" />
          <div aria-hidden="true" className="absolute bottom-0 right-8 w-20 h-20 border-r border-b border-accent/40 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 pt-20 pb-16">

            {/* Label pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-accent/40 bg-accent/10 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-accent text-xs tracking-[0.4em] uppercase font-light">
                Our Story
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
              className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[1.0] tracking-tight drop-shadow-lg"
            >
              {hero.title}
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-16 h-px bg-accent my-6 origin-left"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-white/80 text-lg md:text-xl font-light italic max-w-2xl leading-relaxed"
            >
              &ldquo;{hero.subtitle}&rdquo;
            </motion.p>
          </div>
        </section>

   
        <section
          aria-labelledby="intro-heading"
          className="relative py-2  bg-white overflow-hidden"
        >
         
          <div className="relative z-10 max-w-8xl mx-auto px-6 ">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
             
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                className="lg:col-span-5 order-2 lg:order-1"
              >
                {/* Decorative frame */}
                <div className="relative">
                  {/* Offset box behind image */}
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-4 -right-4 w-full h-full rounded-[2rem] border border-accent/30 pointer-events-none"
                  />
                  <div className="relative h-[420px] md:h-[560px] rounded-[3rem] overflow-hidden shadow-[0_30px_80px_rgba(59,28,50,0.12)]">
                    <Image
                      src={introSection.image}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      alt={introSection.heading}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Gap */}
              <div className="lg:col-span-1 hidden lg:block" />

              {/* Text — col 7–12 */}
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="lg:col-span-6 order-1 lg:order-2 space-y-8"
              >
                <SectionHeader
                  title={introSection.heading.split("Restaurant Platform")[0]}
                  highlight={introSection.heading.includes("Restaurant Platform") ? "Restaurant Platform" : undefined}
                  subtitle={introSection.subHeading}
                  withDivider={false}
            
                />

                <div className="w-12 h-px bg-accent/60" />

                <motion.div variants={fadeUp} className="space-y-5">
                  {introSection.paragraphs.map((p, i) => (
                    <p key={i} className="text-lg text-[#271302]/65 font-light leading-relaxed">
                      {p}
                    </p>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            VISION — two-column with gold divider
        ═══════════════════════════════════════ */}
        <section
          aria-labelledby="vision-heading"
          className="relative py-2 md:py-8 bg-[#fdf9f4] overflow-hidden"
        >
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

              {/* Left column */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="pr-0 lg:pr-16 pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-accent/25"
              >
                {/* ✅ SectionHeader for vision left */}
                <SectionHeader
                  title={visionSection.left.title}
                />
                <div className="space-y-4">
                  {visionSection.left.content.map((line, i) => (
                    <p key={i} className="text-base md:text-lg text-[#271302]/60 font-light leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>

              {/* Right column */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                className="pt-12 lg:pt-0 lg:pl-16"
              >
                {/* ✅ SectionHeader for vision right */}
                <SectionHeader
                  title={visionSection.right.title}
                  // withAnimation={false}
                  // withDivider={false}
                />
                <div className="space-y-4">
                  {visionSection.right.content.map((line, i) => (
                    <p key={i} className="text-base md:text-lg text-[#271302]/60 font-light leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            VIBES CAROUSEL — warm immersive strip
        ═══════════════════════════════════════ */}
        {vibes.images && vibes.images.length > 0 && (
          <section
            aria-labelledby="vibes-heading"
            className="py-2 bg-white overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-14">
              {/* ✅ SectionHeader for vibes */}
              <SectionHeader
                title={vibes.title.includes("Restaurant") ? vibes.title.split("Restaurant")[0] : vibes.title}
                highlight={vibes.title.includes("Restaurant") ? "Restaurant" : undefined}
                withAnimation={false}
                withDivider={false}
                titleColor="text-[#271302]"
                highlightColor="text-accent"
                titleClassName="text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight"
              />
            </div>

            {/* Full-width carousel */}
            <div className="px-6 md:px-12">
              <Carousel
                responsive={responsiveVibes}
                infinite
                autoPlay
                autoPlaySpeed={3200}
                keyBoardControl
                customTransition="transform 600ms cubic-bezier(0.4,0,0.2,1)"
                transitionDuration={600}
                containerClass="carousel-container"
                removeArrowOnDeviceType={["tablet", "mobile"]}
                itemClass="px-2"
              >
                {vibes.images.map((src, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-[1.5rem] group cursor-pointer h-[380px] md:h-[440px]"
                  >
                    <img
                      src={src}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      alt={`${vibes.title} ${index + 1}`}
                      loading="lazy"
                    />
                    {/* Warm vignette on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    {/* Bottom gold line reveal */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                  </div>
                ))}
              </Carousel>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            FEATURES — editorial bento grid
        ═══════════════════════════════════════ */}
        {features && features.length > 0 && (
          <section
            aria-labelledby="features-heading"
            className="relative py-2 md:py-8 bg-[#fdf9f4] overflow-hidden"
          >

            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">

              {/* ✅ SectionHeader for features */}
              <SectionHeader
                title="Everything you need,"
                highlight="in one place"
                withAnimation={false}
                withDivider={false}
                titleColor="text-[#271302]"
                highlightColor="text-accent"
                titleClassName="text-4xl md:text-5xl font-light leading-tight mb-14 max-w-xl"
              />

              {/* Feature cards grid */}
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {features.map((feature, index) => (
                  <motion.article
                    key={index}
                    variants={fadeUp}
                    className="group relative flex flex-col rounded-[1.75rem] bg-white border border-accent/15 hover:border-accent/40 p-8 md:p-10 transition-all duration-500 overflow-hidden"
                  >
                    {/* Corner accent */}
                    <div
                      aria-hidden="true"
                      className="absolute top-0 right-0 w-20 h-20 rounded-bl-[4rem] bg-accent/5 group-hover:bg-accent/12 transition-colors duration-500"
                    />

                    {/* Index number */}
                    <span
                      aria-hidden="true"
                      className="absolute top-7 right-8 text-5xl font-black text-[#271302]/5 group-hover:text-accent/12 transition-colors duration-500 select-none leading-none"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Feature image / icon */}
                    <div className="mb-6 w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden group-hover:bg-accent/18 transition-colors duration-400">
                      {feature.image ? (
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <span className="text-2xl">🍽️</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-medium text-[#271302] mb-3 leading-snug">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[#271302]/55 text-base font-light leading-relaxed flex-1">
                      {feature.description}
                    </p>

                    {/* Bottom animated line */}
                    <div className="mt-6 h-px w-0 group-hover:w-full bg-accent/50 transition-all duration-500 ease-out" />
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </section>
        )}

      </main>
    </>
  );
}