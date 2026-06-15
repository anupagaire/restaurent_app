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
      className="relative bg-[#fdf9f4] py-8 overflow-hidden"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-5">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 md:mb-16 lg:mb-2"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-light text-primaryleading-tight tracking-tight">
              {title || 'How It Works'}
            </h2>
            <div
              className="text-base sm:text-lg text-primary/55 font-light leading-relaxed self-end ql-content"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </motion.div>

        {/* ── STEPS ── */}
        <div className="relative">

          {/* Vertical connector line (desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute left-[2.35rem] top-10 bottom-10 w-px bg-accent/20"
          />

          {/* Animated fill line */}
          <motion.div
            aria-hidden="true"
            className="hidden lg:block absolute left-[2.35rem] top-10 w-px bg-accent/50 origin-top"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ height: 'calc(100% - 5rem)' }}
          />

          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon] ?? QrCode;
              const isLast = index === steps.length - 1;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: index * 0.18, ease: 'easeOut' }}
                  className="group relative flex flex-col lg:flex-row gap-6 lg:gap-10"
                >
                  {/* ── LEFT: Step number + icon bubble ── */}
                  <div className="flex lg:flex-col items-center lg:items-center gap-4 lg:gap-0 shrink-0">

                    {/* Step number badge */}
                    <div className="relative z-10 w-16 h-16  rounded-2xl bg-primaryflex flex-col items-center justify-center shrink-0 group-hover:bg-accent transition-colors duration-500">
                      <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-light group-hover:text-primary/60 transition-colors duration-500">
                        Step
                      </span>
                      <span className="text-2xl sm:text-[28px] font-secondary text-white group-hover:text-primarytransition-colors duration-500 leading-none">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Mobile connector (vertical line between steps) */}
                    {!isLast && (
                      <div
                        aria-hidden="true"
                        className="lg:hidden w-px h-8 sm:h-10 bg-accent/30 ml-[2.1rem]"
                      />
                    )}
                  </div>

                  {/* ── RIGHT: Card ── */}
                  <div className="flex-1 bg-white rounded-2xl border border-accent/15 p-6 sm:p-7 md:p-9 hover:border-accent/40 transition-all duration-400 group-hover:shadow-[0_0_0_1px_rgba(212,183,143,0.25)] relative overflow-hidden">

                    {/* Subtle corner accent */}
                    <div
                      aria-hidden="true"
                      className="absolute top-0 right-0 w-24 h-24 rounded-bl-[4rem]  group-hover:bg-accent/10 transition-colors duration-500"
                    />

                    <div className="flex items-start gap-5 relative z-10">
                      {/* Icon circle */}
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-accent/12 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-400">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl sm:text-2xl font-medium text-primarymb-3 leading-snug">
                          {step.title}
                        </h3>
                        <div
                          className="text-base text-primary/55 font-light leading-relaxed ql-content"
                          dangerouslySetInnerHTML={{ __html: step.description }}
                        />
                      </div>
                    </div>

                    {/* Bottom animated underline */}
                    <div className="mt-6 h-px w-0 group-hover:w-full bg-accent/40 transition-all duration-500 ease-out" />
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