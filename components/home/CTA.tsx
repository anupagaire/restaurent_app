'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Star, 
  BarChart2, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  
  Sparkles,
  ChevronRight
} from 'lucide-react';
import SectionHeader from '@/components/layout/SectionHeader';

const BENEFITS = [
  {
    icon: <QrCode className="w-5 h-5" />,
    title: 'QR Menu — No App Needed',
    desc: 'Customers scan, browse, and order directly from their phone.',
    gradient: 'from-amber-500/10 to-amber-600/5',
    border: 'hover:border-amber-500/30',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: 'Digital Menu in Minutes',
    desc: 'Add your menu items, photos, and categories in one place.',
    gradient: 'from-blue-500/10 to-blue-600/5',
    border: 'hover:border-blue-500/30',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: 'Reviews & Ratings',
    desc: 'Build trust with real customer feedback on your profile.',
    gradient: 'from-yellow-500/10 to-yellow-600/5',
    border: 'hover:border-yellow-500/30',
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-600',
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: 'Order Management',
    desc: 'Track table and online orders from a single dashboard.',
    gradient: 'from-green-500/10 to-green-600/5',
    border: 'hover:border-green-500/30',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-600',
  },
];

const CHECKLIST = [
  { icon: '💰', text: 'Free to list your restaurant' },
  { icon: '📱', text: 'No hardware required' },
  { icon: '📲', text: 'Works on any smartphone' },
  { icon: '⚡', text: 'Setup in under 10 minutes' },
];

export default function ListYourRestaurant() {
  return (
    <section className="relative overflow-hidden py-2 sm:py-8 bg-[#faf7f0]">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        {/* Soft gradient glow */}
        {/* <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" /> */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_#0D1B2A_1px,_transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          
          <SectionHeader
  title="Grow your restaurant"
  highlight="with us"
 subtitle=" Join hundreds of restaurants across Nepal already using our platform
              to take orders, manage menus, and connect with customers — all from
              one simple dashboard."
            
/>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* ── LEFT: Features ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            {/* Checklist */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-primary/40 tracking-wider uppercase mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-primary/10" />
                ✦ Why choose us
              </p>
              {CHECKLIST.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-primary/70 group-hover:text-primary/90 transition-colors duration-300 text-sm">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Featured restaurants */}
            
{/* Bottom CTA card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="sm:col-span-2 relative rounded-2xl p-5 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/10 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary/90">
                      Ready to get started?
                    </p>
                    <p className="text-xs font-light text-primary/40">
                      Join 500+ restaurants already on the platform
                    </p>
                  </div>
                </div>
                
              
              </div>
            </motion.div>
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <Link
                href="/register-restaurant"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 bg-secondary text-white shadow-md shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5"
              >
                List Your Restaurant
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3  bg-primary  text-white rounded-full text-sm font-medium transition-all duration-300 border border-primary/10 text-primary/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5"
              >
                Talk to us first
              </Link>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Benefits Grid ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
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
                whileHover={{ 
                  y: -4,
                  transition: { duration: 0.2 }
                }}
                className={`group relative rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 bg-white border border-primary/5 shadow-sm hover:shadow-md ${b.border}`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${b.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.iconBg} border border-primary/5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={b.iconColor}>
                      {b.icon}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <p className="text-sm font-semibold text-primary/90 group-hover:text-primary transition-colors duration-300">
                    {b.title}
                  </p>
                  <p className="text-xs font-light leading-relaxed text-primary/40 group-hover:text-primary/60 transition-colors duration-300 mt-1">
                    {b.desc}
                  </p>
                </div>

                <div className="relative mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight className="w-4 h-4 text-accent" />
                </div>
              </motion.div>
            ))}

            
          </motion.div>
        </div>
      </div>
    </section>
  );
}