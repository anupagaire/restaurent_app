"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Utensils } from "lucide-react";

interface Restaurant {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
  status: string;
}

interface TestimonialsSection {
  title: string;
  description: string;
  restaurants: Restaurant[];
}

interface Props {
  data: TestimonialsSection | null;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0 },
};

const Testimonials = ({ data }: Props) => {
  if (!data) return null;

  return (
    <section className="relative py-6 md:py-12 bg-white overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="text-center mb-12 space-y-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-serif text-[#5D0565]">
            {data.title}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-[#011659]/60 max-w-xl mx-auto">
            {data.description}
          </motion.p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {data.restaurants.map((item) => (
            <motion.div key={item.id} variants={cardVariants} className="flex flex-col relative rounded-[2rem] p-8 md:p-10 bg-[#faf7f2] border border-[#d4b78f]/30 shadow-lg hover:shadow-[0_20px_50px_rgba(212,183,143,0.15)] transition-all duration-300 h-full group">
              <div className="absolute top-8 right-8 text-[#d4b78f]/20 group-hover:text-[#d4b78f]/30 transition-colors">
                <Utensils size={40} />
              </div>
              <div className="flex flex-col h-full space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative w-[60px] h-[60px]">
                    <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="rounded-full object-cover border-2 border-[#d4b78f] shadow-sm group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-[#011659] leading-tight">{item.name}</h4>
                    <p className="text-[10px] text-green-600 uppercase tracking-[0.2em] font-bold mt-1">{item.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  <span className="text-xs text-gray-500 ml-2">{item.rating}</span>
                </div>
                <p className="text-[#011659]/80 text-base leading-relaxed line-clamp-5 italic">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;