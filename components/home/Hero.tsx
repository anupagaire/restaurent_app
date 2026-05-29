
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HeroSection: React.FC = () => {

 const slides = [
  {
    src: "/7.jpg",
    alt: "Restaurant",
    title: "Welcome to Our Venue",
    link: "/restaurants",
  },
  {
    src: "/food11.jpg",
    alt: "Restaurant",
    title: "Experience the Best Cuisine",
    link: "/about",
  },
];

  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);


  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentImage((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentImage((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => handleNext(), 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, handleNext]);

  const kenBurnsVariants: Variants = {
    initial: { scale: 1, x: 0, y: 0 },
    animate: { scale: 1.1, x: [0, -20, 0], y: [0, -10, 0], transition: { duration: 4, ease: "easeInOut" } },
  };

  const slideVariants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 1000 : -1000, opacity: 0 }),
    center: { x: 0, opacity: 1, zIndex: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 1000 : -1000, opacity: 0, zIndex: 0 }),
  };

  const TextReveal: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
    const letters = text.split("");

    const container: Variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: delay } },
    };

    const child: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 200 } },
    };

    return (
      <motion.span variants={container} initial="hidden" animate="visible" className="inline-block">
        {letters.map((letter, index) => (
          <motion.span key={index} variants={child} className="inline-block">
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </motion.span>
    );
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-[40vh] md:h-[75vh] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentImage}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.5 } }}
          className="absolute inset-0"
        >
          <motion.div variants={kenBurnsVariants} initial="initial" animate="animate" className="relative w-full h-full">
            <Image src={slides[currentImage].src} alt={slides[currentImage].alt} fill className="object-cover" priority={currentImage === 0} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
<div className="absolute inset-0 flex flex-col justify-center items-start px-6 md:px-20 z-10 text-white">
  
 <h1 className="text-2xl md:text-5xl font-bold mb-4 drop-shadow-lg">
  <TextReveal text={slides[currentImage].title} />
</h1>

  <a
    href={slides[currentImage].link}
    className="bg-white text-black px-5 py-2 md:px-6 md:py-3 rounded-full font-medium hover:bg-gray-200 transition"
  >
    Explore Now
  </a>

</div>
 

      <motion.button onClick={handlePrev} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 hover:backdrop-blur-md p-2 md:p-4 rounded-full">
        <ChevronLeft className="w-4 h-4 text-white" />
      </motion.button>
      <motion.button onClick={handleNext} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 hover:backdrop-blur-md p-2 md:p-4 rounded-full">
        <ChevronRight className="w-4 h-4 text-white" />
      </motion.button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:hidden">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentImage ? 1 : -1);
              setCurrentImage(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${index === currentImage ? "bg-white w-6" : "bg-white/50"}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default HeroSection;
