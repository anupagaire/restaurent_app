'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { QrCode, Star, BarChart2, Smartphone, CheckCircle2 } from 'lucide-react';
import SectionHeader from '@/components/layout/SectionHeader';
const BENEFITS = [
  {
    icon: <QrCode size={20} />,
    title: 'QR Menu — No App Needed',
    desc: 'Customers scan, browse, and order directly from their phone.',
  },
  {
    icon: <Smartphone size={20} />,
    title: 'Digital Menu in Minutes',
    desc: 'Add your menu items, photos, and categories in one place.',
  },
  {
    icon: <Star size={20} />,
    title: 'Reviews & Ratings',
    desc: 'Build trust with real customer feedback on your profile.',
  },
  {
    icon: <BarChart2 size={20} />,
    title: 'Order Management',
    desc: 'Track table and online orders from a single dashboard.',
  },
];

const CHECKLIST = [
  'Free to list your restaurant',
  'No hardware required',
  'Works on any smartphone',
  'Setup in under 10 minutes',
];

export default function ListYourRestaurant() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28"
      style={{ background: 'linear-gradient(135deg, #1a0d02 0%, #2d1606 50%, #1a0d02 100%)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,183,143,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Top gold rule */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(212,183,143,0.5), transparent)' }}
      />
      {/* Bottom gold rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(212,183,143,0.3), transparent)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT: Pitch ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            
<SectionHeader
badge="For Restaurant Owners"
  title="Grow your restaurant"
  highlight="with us"
 subtitle=" Join hundreds of restaurants across Nepal already using our platform
              to take orders, manage menus, and connect with customers — all from
              one simple dashboard."
                titleClassName="text-white"
  subtitleClassName="text-white"
  withAnimation={false}
  withDivider={false}
/>
            
            <ul className="space-y-3 mb-10">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2
                    size={16}
                    className="shrink-0"
                    style={{ color: '#d4b78f' }}
                  />
                  <span className="text-sm font-light" style={{ color: 'rgba(253,246,236,0.75)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register-restaurant"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: '#d4b78f', color: '#1a0800' }}
              >
                List Your Restaurant →
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-light transition-all duration-300 hover:opacity-80"
                style={{
                  border: '1px solid rgba(212,183,143,0.35)',
                  color: 'rgba(253,246,236,0.65)',
                }}
              >
                Talk to us first
              </Link>
            </div>
          </motion.div>

          {/* ── RIGHT: Benefits grid ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-300"
                style={{
                  background: 'rgba(212,183,143,0.06)',
                  border: '1px solid rgba(212,183,143,0.12)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(212,183,143,0.11)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,183,143,0.25)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(212,183,143,0.06)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,183,143,0.12)';
                }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(212,183,143,0.15)', color: '#d4b78f' }}
                >
                  {b.icon}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#fdf6ec' }}>
                    {b.title}
                  </p>
                  <p className="text-xs font-light leading-relaxed"
                    style={{ color: 'rgba(253,246,236,0.45)' }}
                  >
                    {b.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Social proof strip */}
            <div
              className="sm:col-span-2 rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{
                background: 'rgba(212,183,143,0.08)',
                border: '1px solid rgba(212,183,143,0.14)',
              }}
            >
              {/* Avatar cluster */}
              <div className="flex -space-x-2 shrink-0">
                {['H', 'E', 'C', 'Y'].map((letter, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-[#1a0d02]"
                    style={{
                      background: `hsl(${20 + i * 15}, 45%, ${28 + i * 5}%)`,
                      color: '#d4b78f',
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'rgba(253,246,236,0.8)' }}>
                  Restaurants already on the platform
                </p>
                <p className="text-[10px] font-light" style={{ color: 'rgba(253,246,236,0.35)' }}>
                  Kathmandu · Bhaktapur · Janakpur and more
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}