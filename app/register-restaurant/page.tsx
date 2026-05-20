"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  restaurant_name: string;
  cuisine_type: string;
  city: string;
  area: string;
  full_address: string;
  description: string;
  owner_name: string;
  phone: string;
  email: string;
  whatsapp: string;
}

const CUISINE_OPTIONS = ["Nepali", "Chinese", "Continental", "Indian", "Fusion", "Other"];

const INITIAL_FORM: FormData = {
  restaurant_name: "",
  cuisine_type: "Nepali",
  city: "",
  area: "",
  full_address: "",
  description: "",
  owner_name: "",
  phone: "",
  email: "",
  whatsapp: "",
};

const RegisterRestaurant = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/v1/register-restaurant/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Something went wrong. Please try again.");
      }

      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full">
        <Navbar />
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <div className="bg-white border border-[#d4b78f] rounded-2xl p-10 max-w-md w-full">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold text-[#513012] mb-2">Application Submitted!</h2>
            <p className="text-[#776552] mb-6">
              We've received your restaurant details. Our team will review your application and get
              back to you within 2–3 business days.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-[#513012] text-white rounded-lg text-sm hover:bg-[#7a4b2a] transition"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#faf8f5]">
      <Navbar />

      <div className="max-w-screen-md mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#513012] mb-2">Register Your Restaurant</h1>
          <p className="text-[#776552]">
            Fill in the details below and our team will set up your digital menu and QR ordering system.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Restaurant details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Restaurant name" required>
                <input
                  name="restaurant_name"
                  value={form.restaurant_name}
                  onChange={handleChange}
                  placeholder="e.g. Momo Palace"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Cuisine type" required>
                <select
                  name="cuisine_type"
                  value={form.cuisine_type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {CUISINE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="City" required>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Kathmandu"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Area / Locality" required>
                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="e.g. Thamel"
                  required
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Full address">
              <input
                name="full_address"
                value={form.full_address}
                onChange={handleChange}
                placeholder="Street address, landmark"
                className={inputClass}
              />
            </Field>

            <Field label="Short description">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Tell us a bit about your restaurant…"
                rows={3}
                className={inputClass}
              />
            </Field>
          </Section>

          <Section title="Owner / contact person">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full name" required>
                <input
                  name="owner_name"
                  value={form.owner_name}
                  onChange={handleChange}
                  placeholder="Owner name"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Phone number" required>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+977 98XXXXXXXX"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Email address" required>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="owner@restaurant.com"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="WhatsApp number">
                <input
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="Same or different from phone"
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm text-[#776552] border border-[#d4b78f] rounded-lg hover:bg-[#fdf5ec] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm bg-[#513012] text-white rounded-lg hover:bg-[#7a4b2a] disabled:opacity-60 transition"
            >
              {loading ? "Submitting…" : "Submit application"}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

const inputClass =
  "w-full px-3 py-2.5 text-sm border border-[#d4b78f] rounded-lg bg-white text-[#3a2a1a] placeholder:text-[#b8a898] focus:outline-none focus:border-[#8c6d46] transition";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-[#d4b78f] rounded-xl p-6">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8c6d46] mb-4 pb-3 border-b border-[#ead9c5]">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-[#776552]">
      {label} {required && <span className="text-[#8c6d46]">*</span>}
    </label>
    {children}
  </div>
);

export default RegisterRestaurant;