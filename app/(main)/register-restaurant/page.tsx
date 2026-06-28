"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  phone: "+977 ",
  email: "",
  whatsapp: "",
};

const RegisterRestaurant = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const recaptchaLoaded = useRef(false);

  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/captcha/site-key/`);
        if (res.ok) {
          const data = await res.json();
          setSiteKey(data.site_key || data.key);
        }
      } catch (e) {
        console.error("Failed to fetch captcha site key:", e);
      }
    };
    fetchSiteKey();
  }, []);

  useEffect(() => {
    if (!siteKey || recaptchaLoaded.current) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => { recaptchaLoaded.current = true; };
    document.body.appendChild(script);
    return () => {
      const s = document.querySelector(`script[src*="recaptcha/api.js"]`);
      if (s && s.parentNode) s.parentNode.removeChild(s);
    };
  }, [siteKey]);

  const executeRecaptcha = (): Promise<string> =>
    new Promise((resolve, reject) => {
      if (!siteKey) return reject(new Error("reCAPTCHA not initialized"));
      const attempt = () => {
        if (typeof window.grecaptcha === "undefined") return setTimeout(attempt, 200);
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action: "register_restaurant" }).then(resolve).catch(reject);
        });
      };
      attempt();
    });

  const verifyCaptcha = async (recaptchaToken: string): Promise<string> => {
    const res = await fetch(`${BASE_URL}/api/v1/captcha/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recaptcha_token: recaptchaToken }),
    });
    if (!res.ok) throw new Error("Captcha verification failed.");
    const data = await res.json();
    return data.captcha_token;
  };

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
      // Try captcha but don't block submission if it fails
      let captchaToken: string | undefined;
      if (siteKey) {
        try {
          const recaptchaToken = await executeRecaptcha();
          captchaToken = await verifyCaptcha(recaptchaToken);
        } catch {
          // Captcha failed silently — backend will decide
        }
      }

      const res = await fetch(`${BASE_URL}/api/v1/register-restaurant/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(captchaToken ? { captcha_token: captchaToken } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || data?.detail || data?.error || "Something went wrong. Please try again.");
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
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <div className="bg-white border border-accent rounded-2xl p-10 max-w-md w-full">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold text-secondary mb-2">Application Submitted!</h2>
            <p className="text-secondary mb-6">
              We&apos;ve received your venue details. Our team will review your application and get
              back to you within 2–3 business days.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-[#7a4b2a] transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#faf8f5]">
      <div className="max-w-screen-sm mx-auto px-4 py-22">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">Register Your Venue</h1>
          <p className="text-secondary">
            Fill in the details below and our team will set up your digital menu and QR ordering system.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Venue details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Venue name" required>
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
                    <option key={c} value={c}>{c}</option>
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
                placeholder="Tell us a bit about your venue…"
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

          <p className="text-xs text-gray-500">
            Protected by reCAPTCHA —{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
              Privacy Policy
            </a>{" "}
            &amp;{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
              Terms
            </a>{" "}
            apply.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm text-secondary border border-accent rounded-lg hover:bg-[#fdf5ec] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm bg-secondary text-white rounded-lg hover:bg-[#7a4b2a] disabled:opacity-60 transition"
            >
              {loading ? "Submitting…" : "Submit application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputClass =
  "w-full px-3 py-2.5 text-sm border border-accent rounded-lg bg-white text-secondary placeholder:text-primary focus:outline-none focus:border-secondary transition";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-accent rounded-xl p-6">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-4 pb-3 border-b border-accent">
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
    <label className="text-xs font-medium text-secondary">
      {label} {required && <span className="text-secondary">*</span>}
    </label>
    {children}
  </div>
);

export default RegisterRestaurant;