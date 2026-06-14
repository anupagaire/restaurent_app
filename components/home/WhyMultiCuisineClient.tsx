'use client';

import { motion } from 'framer-motion';
import { Users, Globe, Compass, Star, LucideIcon } from 'lucide-react';
import Image from 'next/image';
import SectionHeader from '@/components/layout/SectionHeader';
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  globe: Globe,
  compass: Compass,
  star: Star,
};

interface Benefit { id: number; icon: string; text: string; }
interface ImgItem { id: number; alt: string; image: string; }

// Export the interface so the Server Component can use it
export interface AboutSectionsData {
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

const FALLBACK_IMAGES = ['/2.jpg', '/4.jpg', '/3.jpg', '/1.jpg'];

// Receive the data as props instead of fetching it
interface Props {
  initialData: AboutSectionsData;
}

export default function WhyMultiCuisineClient({ initialData }: Props) {
  // No more useState or useEffect!
  const data = initialData;
  const c = data?.commitment_section;
  const w = data?.why_choose_us_section;
  
  if (!c || !w) return null;

  return (
    <>
     
<section 
  style={{ background: 'linear-gradient(135deg, #1a0d02 0%, #2d1606 50%, #1a0d02 100%)' }}
  className="relative text-white overflow-hidden"
>
  <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-2 min-h-screen">

    {/* LEFT — Text column */}
    <div className="flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-10 py-2 w-full min-w-0">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-2 "
      >
        <SectionHeader
          title={c.title}
          highlight={c.highlight_text}
          withDivider={false}
          titleColor="text-white"
        />
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-sm sm:text-base lg:text-lg text-white/60 font-light leading-relaxed mb-1 ql-content break-words overflow-hidden"
        dangerouslySetInnerHTML={{ __html: c.description }}
      />

      {/* Experience points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="mb-1"
      >
        <p className="text-[#d4b78f] text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-6 font-light break-words">
          {c.experience_title}
        </p>
        <div className="space-y-0 border-t border-white/10">
          {c.experience_points.map((item, i) => (
            <div
              key={i}
              className="group flex items-start sm:items-center gap-4 sm:gap-6 py-4 border-b border-white/10 hover:border-primary/40 transition-colors duration-300"
            >
              <span className="text-[#d4b78f]/40 text-xs font-light w-6 shrink-0 group-hover:text-[#d4b78f] transition-colors duration-300 mt-0.5 sm:mt-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-white/70 text-sm sm:text-base font-light group-hover:text-white transition-colors duration-300 break-words min-w-0">
                {item}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase font-light text-white/25 ql-content break-words overflow-hidden"
        dangerouslySetInnerHTML={{ __html: c.bottom_text }}
      />
    </div>

    {/* RIGHT — Sticky image strip (desktop only) */}
    <div className="relative hidden lg:block">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={c.images[0]?.image || FALLBACK_IMAGES[0]}
            fill
            className="object-cover"
            sizes="50vw"
            alt={c.images[0]?.alt ?? 'Restaurant ambiance in Nepal'}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(26,13,2,0.95) 0%, rgba(26,13,2,0.65) 35%, rgba(26,13,2,0.15) 70%, transparent 100%)",
            }}
          />               
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(0deg, rgba(59,28,50,0.9) 0%, rgba(81,48,18,0.5) 40%, transparent 80%)',
  }}
          />
        </div>

        <div className="absolute bottom-10 right-6 flex flex-col gap-3 z-10">
          {[1, 2, 3].map((idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative w-32 h-24 overflow-hidden rounded-sm border border-white/20 hover:border-primary/60 transition-all duration-500 hover:scale-105"
            >
              <Image
                src={c.images[idx]?.image || FALLBACK_IMAGES[idx]}
                fill
                className="object-cover"
                sizes="128px"
                alt={c.images[idx]?.alt ?? 'Foodie Nepal restaurant gallery'} 
              />
            </motion.div>
          ))}
        </div>

        <div className="absolute top-10 right-6 z-10 flex flex-col items-end gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-px transition-all duration-300 ${i === 0 ? 'w-8 bg-[#d4b78f]' : 'w-3 bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>

    {/* MOBILE — image row */}
    <div className="flex lg:hidden gap-2 px-6 pb-12 overflow-x-auto scrollbar-hide">
      {(c.images.length
        ? c.images
        : FALLBACK_IMAGES.map((img, i) => ({ image: img, alt: '', id: i }))
      ).map((img, i) => (
        <div key={i} className="relative shrink-0 w-36 h-24 sm:w-44 sm:h-28 overflow-hidden rounded-lg">
          <Image
            src={typeof img === 'string' ? img : img.image || FALLBACK_IMAGES[i]}
            fill
            className="object-cover"
            sizes="176px"
            alt={typeof img === 'string' ? 'Gallery image' : img.alt ?? 'Gallery image'}
          />
        </div>
      ))}
    </div>
  </div>
</section>

      {/* WHY CHOOSE US */}
   
<section className="bg-[#faf7f0] relative overflow-hidden py-8">
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-24">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-8 lg:mb-10"
          >
            <div className="h-px w-12 bg-[#d4b78f]/50" />
          </motion.div>

          {/* Title + description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 mb-2 lg:mb-6">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-[#011659] leading-tight tracking-tight break-words"
            >
              {w.title}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col justify-end"
            >
              <div
                className="text-sm sm:text-base lg:text-lg text-[#011659]/60 font-light leading-relaxed ql-content break-words"
                dangerouslySetInnerHTML={{ __html: w.description }}
              />
            </motion.div>
          </div>

          <div className="w-full h-px bg-[#d4b78f]/30 mb-2 lg:mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#d4b78f]/20">
            {w.benefits.map((benefit, index) => {
              const Icon = iconMap[benefit.icon] ?? Star;
              return (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-[#faf7f0] hover:bg-[#011659] transition-all duration-500 p-6 sm:p-8 md:p-10 flex flex-col gap-5"
                >
                  <div className="flex items-start justify-between">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#d4b78f] transition-colors duration-300" />
                    <span className="text-[#011659]/20 text-2xl sm:text-3xl font-black group-hover:text-white/10 transition-colors duration-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-[#011659] group-hover:text-white font-light text-sm sm:text-base leading-relaxed transition-colors duration-500 break-words">
                    {benefit.text}
                  </p>
                  <div className="h-px w-0 group-hover:w-full bg-[#d4b78f] transition-all duration-500 ease-out mt-auto" />
                </motion.div>
              );
            })}
          </div>

          {/* Bottom text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 lg:mt-16 pt-8 border-t border-[#d4b78f]/20 text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase font-light text-[#011659]/40 ql-content break-words"
            dangerouslySetInnerHTML={{ __html: w.bottom_text }}
          />
        </div>
      </section>
    </>
  );
}