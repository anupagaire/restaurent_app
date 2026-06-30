'use client';
import { useEffect, useState } from 'react';
import { QrCode, Menu, UtensilsCrossed, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Step {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface HowItWorksData {
  how_it_works_section: {
    title: string;
    description: string;
    steps: Step[];
  };
}

const iconMap: Record<string, LucideIcon> = {
  qr_code: QrCode,
  menu: Menu,
  utensils_crossed: UtensilsCrossed,
};

export default function HowItWorks() {
  const [data, setData] = useState<HowItWorksData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${BASE_URL}/api/v1/website-content/how-it-works/`);
      const json = await res.json();
      setData(json);
    };
    fetchData();
  }, []);

  if (!data?.how_it_works_section) return null;

  const { title, description, steps } = data.how_it_works_section;

  return (
    <section
      aria-label="How to find and order from restaurants in Nepal"
      className="relative py-4 bg-[#faf7f0] lg:py-2 overflow-hidden"
    >
      <div className="relative z-10  max-w-6xl mx-auto px-5">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-10 lg:mb-14 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-primary leading-tight tracking-tight mb-4">
            {title || 'How It Works'}
          </h2>
          <div
            className="text-sm sm:text-base text-primary/60 font-light leading-relaxed ql-content"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </motion.div>

        <div className="relative">
          
          {/* Horizontal connector line (desktop only) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-[3.75rem] left-[16.66%] right-[16.66%] h-px bg-accent/15 z-0"
          />
          <motion.div
            aria-hidden="true"
            className="hidden md:block absolute top-[3.75rem] left-[16.66%] h-px bg-accent/40 origin-left z-0"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ width: '66.66%' }}
          />

          {/* Grid: 3 columns on md+, single column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 relative z-10">
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon] ?? QrCode;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Step number circle */}
                  <div className="relative mb-5">
                    <div className="w-20 h-20 rounded-full bg-white border border-accent/20 flex items-center justify-center group-hover:border-accent/40 group-hover:shadow-lg transition-all duration-500">
                      <div className="w-14 h-14 rounded-full bg-primary flex flex-col items-center justify-center group-hover:bg-accent transition-colors duration-500">
                        <span className="text-[7px] tracking-[0.2em] text-white uppercase font-light group-hover: transition-colors duration-500 leading-none">
                          Step
                        </span>
                        <span className="text-lg font-secondary text-white group-hover: transition-colors duration-500 leading-none mt-0.5">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Small icon badge */}
                    <div className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-full bg-[#fdf9f4] border border-accent/20 flex items-center justify-center group-hover:bg-accent/70 group-hover:border-accent transition-all duration-400 shadow-sm">
                      <Icon className="w-4 h-4 text-accent group-hover:text-white transition-colors duration-400" />
                    </div>
                  </div>

                  {/* Compact Card */}
                  <div className="flex-1 bg-white rounded-xl border border-accent/10 p-5 hover:border-accent/30 hover:shadow-md transition-all duration-400 w-full">
                    <h3 className="text-base sm:text-lg font-bold  mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <div
                      className="text-xs sm:text-sm text-primary font-medium leading-relaxed ql-content"
                      dangerouslySetInnerHTML={{ __html: step.description }}
                    />
                    
                    {/* Bottom animated line */}
                    <div className="mt-4 h-px w-8 group-hover:w-full bg-accent/40 transition-all duration-500 ease-out mx-auto" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}