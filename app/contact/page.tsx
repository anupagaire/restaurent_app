"use client";

import Navbar from "@/components/layout/Navbar";
import { Mail, PhoneCall } from "lucide-react";
import Image from "next/image";
import Footer from "@/components/layout/Footer";

import React from "react";

const Contact = () => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[30vh] lg:min-h-[50vh] w-full">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/food.jpg"
            fill
            priority
            className="object-cover"
            alt="Platform contact"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="relative mx-auto max-w-screen-md w-full min-h-[50vh] flex flex-col justify-center items-center text-white text-center px-4 pt-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-lg italic max-w-xl">
            Whether you're a restaurant owner looking to join our platform or a customer needing help, we’re here to support you.
          </p>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="w-full max-w-screen-xl mx-auto px-4 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* SUPPORT HOURS */}
          <div className="group bg-white p-8 border border-[#d4b78f] hover:border-[#8c6d46] transition">
            <h3 className="text-[#8c6d46] font-semibold uppercase text-sm tracking-wider mb-4">
              Support Hours
            </h3>

            <div className="border-t border-[#d4b78f] pt-4 text-[#776552] space-y-2">
              <p>Sunday - Friday</p>
              <p>10:00 AM – 6:00 PM</p>
              <p className="text-xs text-gray-400 mt-2">
                (Support for restaurants & customers)
              </p>
            </div>
          </div>

          {/* CONTACT */}
          <div className="group bg-white p-8 border border-[#d4b78f] hover:border-[#8c6d46] transition">
            <h3 className="text-[#8c6d46] font-semibold uppercase text-sm tracking-wider mb-4">
              Contact
            </h3>

            <div className="border-t border-[#d4b78f] pt-4 space-y-4 text-[#776552]">
              <a href="tel:+9779800000000" className="flex items-center gap-3">
                <PhoneCall className="h-5 w-5" />
                <span>+977 9800000000</span>
              </a>

              <a href="mailto:support@yourplatform.com" className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                <span>support@yourplatform.com</span>
              </a>
            </div>
          </div>

          {/* LOCATION */}
          <div className="group bg-white p-8 border border-[#d4b78f] hover:border-[#8c6d46] transition">
            <h3 className="text-[#8c6d46] font-semibold uppercase text-sm tracking-wider mb-4">
              Office Location
            </h3>

            <div className="border-t border-[#d4b78f] pt-4 text-[#776552] space-y-2">
              <p className="font-medium">Kathmandu, Nepal</p>
              <p className="text-sm">
                We operate digitally, supporting restaurants across multiple locations.
              </p>
            </div>
          </div>

          {/* JOIN PLATFORM */}
          <div className="group bg-white p-8 border border-[#d4b78f] hover:border-[#8c6d46] transition">
            <h3 className="text-[#8c6d46] font-semibold uppercase text-sm tracking-wider mb-4">
              Join as Restaurant
            </h3>

            <div className="border-t border-[#d4b78f] pt-4 text-[#776552] space-y-3">
              <p className="text-sm">
                Want to digitize your menu and manage orders via QR?
              </p>

              <a
                href="/contact"
                className="inline-block mt-2 px-4 py-2 bg-[#513012] text-white rounded-lg text-sm hover:bg-[#7a4b2a] transition"
              >
                Register Your Restaurant
              </a>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;