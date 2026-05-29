"use client";

import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";


const features = [
  {
    image: "/features1.png",
    title: "Multi-Restaurant Access",
    description:
      "Explore and access multiple restaurants from a single platform without switching apps or websites.",
  },
  {
    image: "/features2.png",
    title: "QR Code Ordering",
    description:
      "Scan, browse, and order instantly with our smart QR-based menu system.",
  },
  {
    image: "/features3.png",
    title: "Easy Restaurant Management",
    description:
      "Restaurants can manage menus, track orders, and operate efficiently in real time.",
  },
];

const vibes = Array.from({ length: 7 }, (_, i) => i + 1);

const responsiveVibes = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1536 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 1536, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 640 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
  },
};

const About = () => {
  return (
    <div className="min-h-screen w-full bg-[#faf7f2] text-[#011659] font-light">

      <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src="/7.jpg"
                  fill
                  priority
                  className="object-cover"
                  alt="Restaurant restaurant ambiance"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-16">
                <div className="flex flex-col items-center">
                  <h1 className="text-4xl md:text-6xl font-serif text-white tracking-[0.1em] drop-shadow-xl uppercase">
Smart Dining Starts Here                  </h1>
                  <div className="w-20 h-1 bg-amber-500 mt-6 mb-4 rounded-full"></div>
                  <p className="text-gray-200 text-lg md:text-xl italic font-light tracking-wide">
                    &quot;Discover, order, and explore multiple restaurants — all from one seamless platform.&quot;
                  </p>
                </div>
              </div>
            </section>

      <section className="py-8 md:py-12 bg-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative h-[400px] md:h-[600px] w-full z-10 rounded-tl-[2.5rem] rounded-br-[2.5rem] overflow-hidden shadow-2xl shadow-[#8c6d46]/10 border border-[#e5d3b8]/20">
                <Image
                  src="/5.jpg"
                  fill
                  className="object-cover"
                  alt="Restaurant Interior"
                />
              </div>
             
            </motion.div>

            <div className="order-1 lg:order-2 space-y-10 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6"
              >                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#011659] leading-[1.15]">
                  Welcome to <br />
                  <span className=" font-serif text-[#d4b78f]">Restaurant Platform</span>
                </h2>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="space-y-6 text-lg text-[#011659]/80 font-light leading-relaxed"
              >
                <p>
                  Restaurant is a modern multi-restaurant platform designed to transform the way people dine and how restaurants operate. Instead of being limited to a single location, our platform connects multiple restaurants in one place, making it easier for customers to explore, choose, and order effortlessly.             </p>
                   <h2 className="text-2xl font-medium text-[#011659] mb-4">The Restaurant Experience</h2>
                <p>With our smart QR-based system, each restaurant can generate its own digital menu, allowing customers to scan, browse, and place orders instantly — no waiting, no confusion.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

<section className="py-12 bg-white text-black">
  <div className="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-24">
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: { transition: { staggerChildren: 0.3 } },
        hidden: {},
      }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
    >
      {/* Our Vision */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
        }}
        className="flex flex-col justify-center space-y-6 text-left"
      >
        <h2 className="text-4xl md:text-5xl font-light text-[#011659] leading-tight">
The Digital Dining Experience        </h2>
        <p className="text-lg md:text-xl text-[#011659]/80 font-light leading-relaxed">
          We are not just building a website — we are creating a complete digital ecosystem for restaurants and customers.

For customers, it means:
• Discover multiple restaurants in one platform  
• View menus instantly through QR codes  
• Place orders quickly and seamlessly  

For restaurants, it means:
• Manage menus digitally  
• Generate QR-based ordering systems  
• Receive and manage orders in real time  
        </p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
        }}
        className="flex flex-col justify-center space-y-6 text-left"
      >
        <h2 className="text-4xl md:text-5xl font-light text-[#011659] leading-tight">
          What We Stand For
        </h2>
        <p>
          Innovation. Simplicity. Efficiency.

We believe technology should make things easier — not more complicated. That’s why our platform is built to be intuitive for both restaurant owners and customers.


        </p>
        <p>
        From QR-based menus to seamless ordering systems, every feature is designed to enhance speed, reduce friction, and improve the overall dining journey.
        </p>
      </motion.div>
    </motion.div>
  </div>
</section>
      

      <section className="py-8 md:py-12 bg-[#faf7f2]">
        <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-12">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-light text-[#011659]">
                Vibes at <span className=" font-serif text-[#d4b78f]">Restaurant</span>
              </h2> 
          </div>
            
            <div className="w-full">
              <Carousel
                responsive={responsiveVibes}
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={3000}
                keyBoardControl={true}
                customTransition="transform 500ms ease-in-out"
                transitionDuration={500}
                containerClass="carousel-container"
                removeArrowOnDeviceType={["tablet", "mobile"]}
                itemClass="px-2"
              >
                {vibes.map((number, index) => (
                  <div 
                    key={index}
                    className="relative overflow-hidden rounded-2xl group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500 h-[400px] w-full"
                  >
                    <Image 
                      src={`/${number}.jpg`} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      alt="Restaurant Ambience" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
                  </div>
                ))}
              </Carousel>
            </div>
        </div>
      </section>

       <section className="w-full py-8 md:py-12 relative overflow-hidden bg-[#faf7f2]">
            <div className="hidden lg:block absolute -right-20 -top-5 opacity-10">
              <Image
                src="/decoration2.png"
                alt=""
                width={400}
                height={400}
              />
            </div>
      
            <div className="hidden lg:block absolute -left-28 -bottom-16 opacity-10">
              <Image
                src="/decoration1.png"
                alt=""
                width={400}
                height={400}
              />
            </div>
      
            <div className="w-full max-w-screen-xl mx-auto px-4">      
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group flex flex-col items-center p-10 rounded-xl bg-white/10 backdrop-blur border border-[#e5d3b8] shadow-md hover:shadow-xl hover:translate-y-[-4px] hover:bg-white/20 transition-all duration-300"
                  >
                   <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"> 
                      <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#f5e9d6] to-white shadow-inner">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          width={80}
                          height={80} 
                          className="object-contain"
                        />
                      </div>
                    </div>
      
                    <h2 className="text-xl md:text-2xl font-medium text-[#d4b78f] mb-3 tracking-wide">
                      {feature.title}
                    </h2>
                    <p className="text-gray-500 text-center leading-relaxed max-w-sm">
                      {feature.description}
                    </p>
      
                  </div>
                ))}
              </div>
            </div>
          </section>
    </div>
  );
};

export default About;