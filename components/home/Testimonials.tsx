"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Harry Ghali",
    text:
      "Very good indian food all over in Hong Kong which is located in Sai ying pun water street.We had a group party of 6 people. The service was perfect given by friendly waiters as well as the chefs.The chef in this restaurant has experience of more than 15 years that's why food is so delicious, they have draught beer, we enjoyed chicken chilly, chapate, pakora, tandoori and garlic naan, lamb shekh kebab, butter chicken, lamb curry every single dish was full of flavour and perfect. The music on the background was decent. Also they have pizza, burger, spaghetti. So, it is 70% indian and 30% Western. We really enjoyed a lot that day on rajdoot. I would like to recommend every brother and sisters to have a try on this restaurant which you will never forget.",
    img: "/harry.png",
  },
  {
    id: 2,
    name: "Andrew Kwok",
    text:
      "Been here twice now, and it's safe to say I will be their new regular customer: Their butter chicken and beef curry are so good! Not to mention as someone who doesn't handle spiciness well, their mild spicy is the perfect amount of heat I can take! But their cheese naan just goes so well with their options! They do have naan included on as their main options but I tried them once and now I can't resist adding them from now on. Their mango lassi also washes down the spice so nice. Next time I'll definitely try to dine in 😋. Their servers are very nice too. Definitely recommend to try them out!! Price per person: $100–150, Food: 5, Service: 5, Atmosphere: 5, Noise level: Quiet, easy to talk",
    img: "/unnamed.png",
  },
  {
    id: 3,
    name: "Colin Squire",
    text:
      "In town for the weekend between supplier visits in south Asia and China mainland and wanted to get dinner close to the hotel, we dropped in the restaurant on Saturday for a drink and to check out the atmosphere, after a couple of beers we decided to go back on Sunday evening for dinner. We were not disappointed, the food was very good, and it comes with great service, we  would definitely recommend this restaurant to our colleagues and go back ourselves when in this part of HK and in need of good Indian food. Meal type: Dinner Price per person: $1–50. Food: 5, Service: 5, Atmosphere: 5, Noise level: Quiet, easy to talk,  Seating type: Indoor dining area",
    img: "/colin.png",
  },
];

const Testimonials = () => {
  return (
    <section className="relative py-6 md:py-12 bg-white overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="text-center mb-12 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-[#011659]"
          >
            What Our Guest Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#011659]/60 max-w-xl mx-auto"
          >
            Experience authentic flavors through the stories of our wonderful diners.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {testimonials.map((item, index) => {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex flex-col relative rounded-[2rem] p-8 md:p-10 bg-[#faf7f2] border border-[#d4b78f]/30 shadow-lg hover:shadow-[0_20px_50px_rgba(212,183,143,0.15)] transition-all duration-300 h-full group"
              >
                {/* Decorative Quote Icon */}
                <div className="absolute top-8 right-8 text-[#d4b78f]/20 group-hover:text-[#d4b78f]/30 transition-colors">
                  <Quote size={48} fill="currentColor" />
                </div>

                <div className="flex flex-col h-full space-y-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        src={item.img}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover border-2 border-[#d4b78f] shadow-sm"
                      />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl text-[#011659] leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-amber-600 uppercase tracking-[0.2em] font-bold mt-1">
                        Verified Member
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Star Rating */}
                    <div className="flex gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>

                    <p className="font-sans text-[#011659]/80 text-base leading-relaxed line-clamp-6 italic">
                      &ldquo;{item.text}&rdquo;
                    </p>
                  </div>

                 
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;