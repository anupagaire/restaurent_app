"use client";

import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { motion, Variants } from "framer-motion";
import SectionHeader from "@/components/layout/SectionHeader";
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.25, 0.1, 0.25, 1], // cubic-bezier
    },
  },
};
interface Restaurant {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
  status: string;
}

interface Props {
  data: any;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const Testimonials = ({ data }: Props) => {
  React.useEffect(() => {
    console.log("📦 FULL DATA:", data);
  }, [data]);

  if (!data) return null;

  const section = data.testimonials_section || data;
  const title = section.title || "What Our Guests Say";
  const description = section.description || "";

  let restaurants = section.restaurants || section.testimonials || [];

  if (data.testimonial && Array.isArray(data.testimonial) && restaurants.length > 0) {
    restaurants = restaurants.map((restaurant: Restaurant, index: number) => ({
      ...restaurant,
      image: data.testimonial[index] || restaurant.image || "/placeholder.png",
    }));
  }

  return (
    <section className="relative text-black py-2 md:py-8 overflow-hidden">

  {/* Giant ghost quote mark watermark */}
  <div
    aria-hidden="true"
    className="absolute -top-8 -left-4 text-[28vw] font-black leading-none select-none pointer-events-none"
    style={{ color: "rgba(212,183,143,0.06)", fontFamily: "Georgia, serif", lineHeight: 1 }}
  >
    &quot;
  </div>
  <div
    aria-hidden="true"
    className="absolute -bottom-8 -right-4 text-[28vw] font-black leading-none select-none pointer-events-none rotate-180"
    style={{ color: "rgba(212,183,143,0.06)", fontFamily: "Georgia, serif", lineHeight: 1 }}
  >
    &quot;
  </div>

  <div className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-16">

    {/* ── HEADER ── ✅ SectionHeader properly use गर्ने */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mb-16 md:mb-20"
    >
      <SectionHeader
        badge="Guest Stories"
        title={title}
        highlight="Testimonials"
        subtitle="Join hundreds of restaurants across Nepal already using our platform to take orders, manage menus, and connect with customers — all from one simple dashboard."
        withAnimation={false}
        withDivider={true}
        // ✅ Light background को लागि colors
        titleColor="text-black"
        highlightColor="text-[#d4b78f]"
        subtitleColor="text-black/45"
        badgeBgColor="bg-[#d4b78f]/20"
        badgeTextColor="text-black/70"
        dividerColor="bg-[#d4b78f]/15"
        // ✅ Custom sizing
        titleClassName="text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight"
        subtitleClassName="text-lg font-light leading-relaxed"
      />
    </motion.div>

    {/* ── CARDS ── */}
    {restaurants.length > 0 ? (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {restaurants.map((item: Restaurant, index: number) => (
          <motion.div
            key={item.id || index}
            variants={cardVariants}
            className="group relative flex flex-col rounded-[1.75rem] border border-black/8 bg-black/[0.04] hover:bg-black/[0.08] hover:border-[#d4b78f]/30 transition-all duration-500 overflow-hidden p-8"
          >
            {/* Decorative index number */}
            <span
              aria-hidden="true"
              className="absolute top-6 right-8 text-6xl font-black leading-none text-black/[0.04] group-hover:text-black/10 transition-colors duration-500 select-none"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Open quote */}
            <div className="mb-5">
              <span
                className="text-5xl leading-none font-serif"
                aria-hidden="true"
              >
                &quot;
              </span>
            </div>

            {/* Review text */}
            <p className="text-base font-light leading-relaxed italic flex-1 mb-8 line-clamp-5">
              {item.description}
            </p>

            {/* Stars */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  fill={i < Math.round(item.rating || 5) ? "currentColor" : "none"}
                  className={
                    i < Math.round(item.rating || 5)
                      ? "text-black"
                      : "text-black/15"
                  }
                />
              ))}
              <span className="text-xs text-black/30 ml-2 font-light">
                {(item.rating || 5).toFixed(1)}
              </span>
            </div>

            {/* Thin separator */}
            <div className="w-full h-px bg-black/8 mb-6" />

            {/* Author row */}
            <div className="flex items-center gap-4">
              <div className="relative w-11 h-11 shrink-0">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name || "Guest"}
                  fill
                  className="rounded-full object-cover ring-1 ring-[#d4b78f]/30 group-hover:ring-[#d4b78f]/60 transition-all duration-500"
                />
              </div>
              <div>
                <p className="font-medium text-base leading-tight">
                  {item.name || "Happy Guest"}
                </p>
                {item.status && (
                  <p className="text-[10px] uppercase tracking-[0.25em] font-light mt-0.5">
                    {item.status}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom animated gold line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-[#d4b78f]/50 transition-all duration-500 ease-out rounded-b-[1.75rem]" />
          </motion.div>
        ))}
      </motion.div>
    ) : (
      <div className="text-center py-10 font-light">
        No testimonials available
      </div>
    )}
  </div>
</section>
  );
};

export default Testimonials;