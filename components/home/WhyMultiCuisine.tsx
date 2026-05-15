"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Globe, Compass, Star } from "lucide-react";
import Image from "next/image";
const WhyMultiCuisine = () => {
  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-[#d4b78f]" />,
      text: "Perfect for customers who want quick, hassle-free ordering",
    },
    {
      icon: <Globe className="w-8 h-8 text-[#d4b78f]" />,
      text: "Appeals to both local and international guests",
    },
    {
      icon: <Compass className="w-8 h-8 text-[#d4b78f]" />,
      text: "Suitable for both local users and international visitors",
    },
    {
      icon: <Star className="w-8 h-8 text-[#d4b78f]" />,
      text: "Increases repeat visits and customer satisfaction",
    },
  ];

  return (
<>
      <section className="text-black px-6 py-8 md:py-12 lg:px-20 relative">
        <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-10 z-10">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-4"
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#011659] leading-[1.15]">
                  Our Commitment<br /> 
                  <span className=" font-serif text-[#d4b78f]">to You</span>
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-[#011659]/80 font-light leading-relaxed"
              >
               

                We are committed to simplifying the dining experience through smart and reliable technology. Our platform is designed to connect customers and restaurants seamlessly, making ordering faster, easier, and more efficient.

                From discovering restaurants to placing orders through QR-based menus, our goal is to create a system that users can trust and rely on every day.   
              
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-6 pt-6"
              >
                <h3 className="text-[#011659] text-xl font-medium italic">
How We Deliver a Better Experience                </h3>
                <div className="grid grid-cols-1 gap-4 ">
                  {[
                    "Seamless QR-based digital menu system",
                    "Easy access to multiple restaurants in one platform",
                    "Fast and reliable order processing",
                   "User-friendly interface for both customers and restaurant owners"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-2 h-2 rounded-full bg-[#d4b78f] group-hover:scale-150 transition-transform duration-300"></div>
                      <span className="text-lg font-light text-[#011659]/70">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.6 }}
                className="pt-8 text-sm tracking-widest uppercase font-extralight text-[#011659]/40"
              >
                We focus on building a platform that is simple, efficient, and scalable. Whether you are a customer exploring dining options or a restaurant managing orders, our system is designed to make the entire process smooth and hassle-free.
              </motion.p>
          </div>

            <div className="lg:col-span-1 hidden lg:block"></div>
            <div className="lg:col-span-6 relative h-[400px] md:h-[500px] lg:h-[600px] w-full">
                 <div className="relative h-full w-full p-4 flex flex-col items-center justify-center gap-3 ">
                  <div className="flex gap-3 w-full h-1/2 items-end">
                    <div className="relative overflow-hidden h-full w-[55%] bg-gray-400 rounded-tr-[100px] rounded-bl-[100px]">
                      <Image 
                        src="/2.jpg"
                        fill
                        className="object-cover"
                          sizes="(max-width: 768px) 100vw, 200px"

                        alt="Restaurant Kitchen Area"
                      />
                    </div>
                    <div className="relative overflow-hidden h-2/3 w-[45%] bg-gray-400 rounded-tl-[50px] rounded-br-[50px]">
                      <Image 
                        src="/4.jpg"
                        fill
                        sizes="(max-width: 768px) 100vw, 200px"
                        className="object-cover"
                        alt="Restaurant sitting area"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 w-full h-1/2 items-start">
                    <div className="relative overflow-hidden h-2/3 w-[45%] bg-gray-400 rounded-tl-[50px] rounded-br-[50px]">
                      <Image 
                        src="/3.jpg"
                        fill
                        className="object-cover"
                          sizes="(max-width: 768px) 100vw, 200px"

                        alt="Restaurant Dining area"
                      />
                    </div>
                    <div className="relative overflow-hidden h-full w-[55%] bg-gray-400 rounded-tr-[100px] rounded-bl-[100px]">
                      <Image 
                        src="/1.jpg"
                        fill
                        className="object-cover"
                        alt="Restaurant Ambiance"
                          sizes="(max-width: 768px) 100vw, 200px"

   
                      />
                    </div>
                  </div>
                 </div>  
            </div>
        </div>
      </section>

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
           Our platform is more than just a restaurant website — it’s a complete digital solution that connects multiple restaurants with customers in one place. We simplify how people discover menus, place orders, and experience dining through smart QR-based technology.

We empower restaurants to manage their menus and orders effortlessly, while giving customers a smooth and modern way to explore and order.
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
    </>
  );
};

export default WhyMultiCuisine;