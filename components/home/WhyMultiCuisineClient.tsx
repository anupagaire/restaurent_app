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

interface Props {
  initialData: AboutSectionsData;
}

export default function WhyMultiCuisineClient({ initialData }: Props) {
  const data = initialData;
  const c = data?.commitment_section;
  const w = data?.why_choose_us_section;
  
  if (!c || !w) return null;

  // Safe images array with fallback
  const images = c.images.length > 0 
    ? c.images 
    : FALLBACK_IMAGES.map((img, i) => ({ image: img, alt: `Gallery ${i}`, id: i }));

  return (
    <>
   
      <section className="relative  bg-[#faf7f0] overflow-hidden py-2 lg:py-8">
        {/* Decorative Background Blurs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-28 items-center">
          
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mb-6"
            >
              <SectionHeader
                title={c.title}
                highlight={c.highlight_text}
                withDivider={false}
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base lg:text-lg  font-light leading-relaxed mb-6 ql-content break-words"
              dangerouslySetInnerHTML={{ __html: c.description }}
            />

            {/* Experience Points - New Elegant Circular List Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mb-2"
            >
              <p className="text-accent text-xs tracking-[0.3em] uppercase mb-8 font-medium">
                {c.experience_title}
              </p>
              <div className="space-y-6">
                {c.experience_points.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-start gap-5 group"
                  >
                    {/* Circular Number Badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full border border-accent/30 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                      <span className="text-accent text-xs font-semibold group-hover:text-white transition-colors">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-primary/80 text-base font-light leading-relaxed pt-2 break-words">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Bottom text */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-xs tracking-[0.25em] uppercase font-light text-primary/50 ql-content break-words"
              dangerouslySetInnerHTML={{ __html: c.bottom_text }}
            />
          </div>

          {/* RIGHT: Circular Images Composition (Desktop) */}
          <div className="order-1 lg:order-2 relative hidden lg:flex justify-center items-center min-h-[700px]">
            {/* Decorative background rings */}
            <div className="absolute w-[600px] h-[600px] border border-accent/10 rounded-full animate-[spin_60s_linear_infinite]" />
            <div className="absolute w-[480px] h-[480px] border border-dashed border-accent/20 rounded-full" />
            
            {/* Main Large Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative w-85 h-85 rounded-full overflow-hidden shadow-2xl border-8 border-white z-10"
            >
              <Image src={images[0].image} fill className="object-cover" alt={images[0].alt ?? 'Main Ambiance'} priority />
            </motion.div>

            {/* Small Circle 1 (Top Right) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute top-8 right-8 w-54 h-44 rounded-full overflow-hidden shadow-xl border-4 border-white z-30"
            >
              <Image src={images[1].image} fill className="object-cover" alt={images[1].alt ?? 'Gallery 1'} />
            </motion.div>

            {/* Small Circle 2 (Bottom Left) */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute bottom-8 left-8 w-46 h-36 rounded-full overflow-hidden shadow-xl border-4 border-white z-30"
            >
              <Image src={images[2].image} fill className="object-cover" alt={images[2].alt ?? 'Gallery 2'} />
            </motion.div>
            
            {/* Small Circle 3 (Middle Left) */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="absolute top-1/2 -translate-y-1/2 -left-6 w-28 h-38 rounded-full overflow-hidden shadow-lg border-4 border-white z-10"
            >
              <Image src={images[3].image} fill className="object-cover" alt={images[3].alt ?? 'Gallery 3'} />
            </motion.div>
          </div>
        </div>

        {/* Mobile Circular Images (Horizontal Scroll) */}
        <div className="flex lg:hidden gap-6 px-6 mt-12 overflow-x-auto scrollbar-hide pb-4">
          {images.map((img, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative shrink-0 w-56 h-46 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-white shadow-xl"
            >
              <Image src={img.image} fill className="object-cover" alt={img.alt ?? 'Gallery'} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className=" relative overflow-hidden py-2 ">

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 lg:mb-2 items-end">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-light text-primary tracking-tight leading-tight break-words"
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
                className="text-base lg:text-lg text-primary/70 font-light leading-relaxed ql-content break-words"
                dangerouslySetInnerHTML={{ __html: w.description }}
              />
            </motion.div>
          </div>

          {/* Benefits Grid - New Elegant Card Design */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {w.benefits.map((benefit, index) => {
              const Icon = iconMap[benefit.icon] ?? Star;
              return (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative p-1 lg:p-4 bg-white rounded-2xl border border-primary/5 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 overflow-hidden"
                >
                

                  <div className="relative z-10">
                    {/* Circular Icon Badge */}
                    <div className="w-12 h-12 rounded-full  border border-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:border-accent transition-all duration-300 group-hover:scale-110">
                      <Icon className="w-7 h-7 text-accent group-hover:text-white transition-colors duration-300" />
                    </div>
                
                    <p className="text-primary/80 font-light text-lg leading-relaxed break-words">
                      {benefit.text}
                    </p>
                    
                
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 lg:mt-24 text-center max-w-3xl mx-auto text-xs tracking-[0.3em] uppercase font-light text-primary/50 ql-content break-words"
            dangerouslySetInnerHTML={{ __html: w.bottom_text }}
          />
        </div>
      </section>
    </>
  );
}