"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Globe, Compass, Star } from "lucide-react";

const WhyMultiCuisine = () => {
  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-[#d4b78f]" />,
      text: "Ideal for families and group dining",
    },
    {
      icon: <Globe className="w-8 h-8 text-[#d4b78f]" />,
      text: "Appeals to both local and international guests",
    },
    {
      icon: <Compass className="w-8 h-8 text-[#d4b78f]" />,
      text: "Encourages culinary exploration",
    },
    {
      icon: <Star className="w-8 h-8 text-[#d4b78f]" />,
      text: "Increases repeat visits and customer satisfaction",
    },
  ];

  return (
    <section className="py-8 md:py-12 bg-white relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-[#011659] leading-tight">
Why Choose Us           </h2>
            <p className="text-lg text-[#011659]/80 font-light leading-relaxed">
           ABC is not just a restaurant; it's a fusion of cultures through the cuisine that we serve. We specialize in serving genuine Indian, Western, and Nepalese cuisines with quality and taste that our customers have come to expect from us. We are a warm and welcoming dining destination that's perfect for any occasion.


            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-[#faf7f2] border border-[#d4b78f]/20 hover:border-[#d4b78f] transition-all duration-300 group"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <p className="text-[#011659] font-medium leading-snug">
                  {benefit.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-8 pb-8 text-sm tracking-widest uppercase font-extralight text-[#011659]"
        >
          This diversity ensures every guest finds something enjoyable, <br/> regardless of taste preference.
        </motion.p>
      </div>
    </section>
  );
};

export default WhyMultiCuisine;