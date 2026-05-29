'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Compass, Star, LucideIcon } from 'lucide-react';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  globe: Globe,
  compass: Compass,
  star: Star,
};

interface Benefit { id: number; icon: string; text: string; }
interface ImgItem { id: number; alt: string; image: string; }

interface AboutSectionsData {
  commitment_section: {
    title: string;
    highlight_text: string;
    description: string;
    experience_title: string;
    experience_points: string[];
    bottom_text: string;
    images: ImgItem[];
  };
  why_choose_us_section: {
    title: string;
    description: string;
    benefits: Benefit[];
    bottom_text: string;
  };
}

// Fallback images when API returns empty string
const FALLBACK_IMAGES = ['/2.jpg', '/4.jpg', '/3.jpg', '/1.jpg'];

export default function WhyMultiCuisine() {
  const [data, setData] = useState<AboutSectionsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${BASE_URL}/api/v1/website-content/about-sections/`);
      setData(await res.json());
    };
    fetchData();
  }, []);

  if (!data) return null;

const c = data?.commitment_section;
const w = data?.why_choose_us_section;

if (!c || !w) return null;
  return (
    <>
      {/* ── COMMITMENT SECTION ── */}
      <section className="text-black px-6 py-8 md:py-12 lg:px-20 relative">
        <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-10 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-4"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#011659] leading-[1.15]">
                {c.title}<br />
                <span className="font-serif text-[#d4b78f]">{c.highlight_text}</span>
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-[#011659]/80 font-light leading-relaxed"
            >
              {c.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6 pt-6"
            >
              <h3 className="text-[#011659] text-xl font-medium italic">{c.experience_title}</h3>
              <div className="grid grid-cols-1 gap-4">
                {c.experience_points.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-2 h-2 rounded-full bg-[#d4b78f] group-hover:scale-150 transition-transform duration-300" />
                    <span className="text-lg font-light text-[#011659]/70">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 1, delay: 0.6 }}
              className="pt-8 text-sm tracking-widest uppercase font-extralight text-[#011659]/40"
            >
              {c.bottom_text}
            </motion.p>
          </div>

          <div className="lg:col-span-1 hidden lg:block" />

          <div className="lg:col-span-6 relative h-[400px] md:h-[500px] lg:h-[600px] w-full">
            <div className="relative h-full w-full p-4 flex flex-col items-center justify-center gap-3">
              <div className="flex gap-3 w-full h-1/2 items-end">
                <div className="relative overflow-hidden h-full w-[55%] bg-gray-400 rounded-tr-[100px] rounded-bl-[100px]">
                  <Image src={c.images[0]?.image || FALLBACK_IMAGES[0]} fill className="object-cover" sizes="(max-width: 768px) 100vw, 200px" alt={c.images[0]?.alt ?? ''} />
                </div>
                <div className="relative overflow-hidden h-2/3 w-[45%] bg-gray-400 rounded-tl-[50px] rounded-br-[50px]">
                  <Image src={c.images[1]?.image || FALLBACK_IMAGES[1]} fill sizes="(max-width: 768px) 100vw, 200px" className="object-cover" alt={c.images[1]?.alt ?? ''} />
                </div>
              </div>
              <div className="flex gap-3 w-full h-1/2 items-start">
                <div className="relative overflow-hidden h-2/3 w-[45%] bg-gray-400 rounded-tl-[50px] rounded-br-[50px]">
                  <Image src={c.images[2]?.image || FALLBACK_IMAGES[2]} fill className="object-cover" sizes="(max-width: 768px) 100vw, 200px" alt={c.images[2]?.alt ?? ''} />
                </div>
                <div className="relative overflow-hidden h-full w-[55%] bg-gray-400 rounded-tr-[100px] rounded-bl-[100px]">
                  <Image src={c.images[3]?.image || FALLBACK_IMAGES[3]} fill className="object-cover" alt={c.images[3]?.alt ?? ''} sizes="(max-width: 768px) 100vw, 200px" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-8 md:py-12 bg-white relative overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-[#011659] leading-tight">{w.title}</h2>
              <p className="text-lg text-[#011659]/80 font-light leading-relaxed">{w.description}</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {w.benefits.map((benefit, index) => {
                const Icon = iconMap[benefit.icon] ?? Star;
                return (
                  <motion.div
                    key={benefit.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-8 rounded-2xl bg-[#faf7f2] border border-[#d4b78f]/20 hover:border-[#d4b78f] transition-all duration-300 group"
                  >
                    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-[#d4b78f]" />
                    </div>
                    <p className="text-[#011659] font-medium leading-snug">{benefit.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-8 pb-8 text-sm tracking-widest uppercase font-extralight text-[#011659]"
          >
            {w.bottom_text}
          </motion.p>
        </div>
      </section>
    </>
  );
}