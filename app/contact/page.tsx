"use client";

import { Mail, PhoneCall, MapPin, Clock, Send } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import emailjs from "@emailjs/browser";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: ContactForm = {
  name: "",
  email: "",
  phone: "+977 ",
  subject: "",
  message: "",
};

const inputClass =
  "w-full px-4 py-3 text-sm border border-[#d4b78f] rounded-lg bg-white text-[#3a2a1a] placeholder:text-[#c4aa90] focus:outline-none focus:border-[#8c6d46] focus:ring-2 focus:ring-[#8c6d46]/10 transition";

const Contact = () => {
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/v1/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Something went wrong. Please try again.");
      }

       try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID!,
      {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );
  } catch (emailError) {
    console.error("EmailJS failed:", emailError);
    // don't block success UI
  }
      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#faf8f5]">
      <section className="relative min-h-[38vh] w-full overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/food.jpg"
            fill
            priority
            className="object-cover"
            alt="Contact us"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/75" />
        </div>
        <div className="relative mx-auto max-w-screen-md w-full min-h-[38vh] flex flex-col justify-center items-center text-white text-center px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4b78f] mb-3">
            We&apos;d love to hear from you
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Get in Touch
          </h1>
          <p className="text-base text-white/75 max-w-lg">
            Whether you&apos;re a venue owner looking to join our platform or a customer needing help — we&apos;re here.
          </p>
        </div>
      </section>

      <section className="w-full max-w-screen-xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: <Clock className="h-4 w-4" />,
              label: "Support Hours",
              value: "Sun – Fri",
              sub: "10:00 AM – 6:00 PM",
            },
            {
              icon: <PhoneCall className="h-4 w-4" />,
              label: "Phone",
              value: "+977 9800000000",
              sub: "Call us anytime",
            },
            {
              icon: <Mail className="h-4 w-4" />,
              label: "Email",
              value: "support@yourplatform.com",
              sub: "We reply within 24h",
            },
            {
              icon: <MapPin className="h-4 w-4" />,
              label: "Location",
              value: "Kathmandu, Nepal",
              sub: "Serving restaurants nationwide",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-[#d4b78f] rounded-xl px-4 py-4 flex flex-col gap-1 shadow-sm"
            >
              <div className="flex items-center gap-2 text-[#8c6d46] mb-1">
                {item.icon}
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#3a2a1a] leading-snug">{item.value}</p>
              <p className="text-xs text-[#8c6d46]">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-screen-xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          <div className="bg-white border border-[#d4b78f] rounded-2xl p-8 flex flex-col">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-[#513012] mb-1">Send us a message</h2>
              <p className="text-sm text-[#8c6d46]">
                Have a suggestion, question, or want to collaborate? We read every message.
              </p>
            </div>

            {success ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#513012] mb-2">Message sent!</h3>
                <p className="text-sm text-[#776552] mb-6 max-w-xs">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-5 py-2 text-sm bg-[#513012] text-white rounded-lg hover:bg-[#7a4b2a] transition"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#776552]">
                      Full name <span className="text-[#8c6d46]">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#776552]">
                      Email address <span className="text-[#8c6d46]">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#776552]">Phone number</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+977 98XXXXXXXX"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#776552]">
                      Subject <span className="text-[#8c6d46]">*</span>
                    </label>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-medium text-[#776552]">
                    Message <span className="text-[#8c6d46]">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help, share feedback, or ask anything…"
                    required
                    rows={5}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#513012] text-white rounded-lg text-sm font-medium hover:bg-[#7a4b2a] disabled:opacity-60 transition"
                >
                  {loading ? (
                    "Sending…"
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

      
          <div className="flex flex-col gap-6">
            <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[320px]">
              <Image
                src="/food.jpg"
                fill
                className="object-cover"
                alt="Restaurant"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-7 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4b78f] mb-2">
                  Restaurant owners
                </p>
                <h3 className="text-2xl font-bold leading-tight mb-2">
                  Ready to go digital?
                </h3>
                <p className="text-sm text-white/75 max-w-xs">
                  Join hundreds of restaurants already using our QR menu and ordering platform.
                </p>
              </div>
            </div>

            <div className="bg-[#513012] rounded-2xl p-7 text-white flex items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-base mb-1">Register your restaurant</h4>
                <p className="text-sm text-white/70">
                  Set up your digital menu in minutes.
                </p>
              </div>
              <a
                href="/register-restaurant"
                className="shrink-0 px-5 py-2.5 bg-white text-[#513012] rounded-lg text-sm font-semibold hover:bg-[#fdf5ec] transition"
              >
                Get started →
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Contact;