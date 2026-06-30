"use client";

import { Mail, PhoneCall, MapPin, Clock, Send, CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

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
  phone: "",
  subject: "",
  message: "",
};

const Contact = () => {
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
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
      if (s) document.body.removeChild(s);
    };
  }, [siteKey]);

  const executeRecaptcha = (): Promise<string> =>
    new Promise((resolve, reject) => {
      if (!siteKey) return reject(new Error("reCAPTCHA not initialized"));
      const attempt = () => {
        if (typeof window.grecaptcha === "undefined") return setTimeout(attempt, 200);
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action: "contact" }).then(resolve).catch(reject);
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
    if (!res.ok) throw new Error("Captcha verification failed. Please try again.");
    const data = await res.json();
    return data.captcha_token;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let captchaToken: string | null = null;
      if (siteKey) {
        try {
          const recaptchaToken = await executeRecaptcha();
          captchaToken = await verifyCaptcha(recaptchaToken);
        } catch {
          // If captcha fails, continue without it — backend decides
        }
      }

      const res = await fetch(`${BASE_URL}/api/v1/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone.trim() || undefined,
          subject: form.subject,
          message: form.message,
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

  const infoCards = [
    { icon: Clock, label: "Hours", value: "Sun – Fri", sub: "10:00 AM – 6:00 PM" },
    { icon: PhoneCall, label: "Phone", value: "+977 9800000000", sub: "Call anytime" },
    { icon: Mail, label: "Email", value: "support@yummynepal.com", sub: "Reply within 24h" },
    { icon: MapPin, label: "Location", value: "Kathmandu, Nepal", sub: "Nationwide service" },
  ];

  return (
    <>
      <style>{`
        :root {
        
          --cream: #FAF6F1;
          --cream-dark: #F2EAE0;
          --text: #2C1810;
          --text-muted: #8A6A58;
          --white: #FFFFFF;
          --border: #E8D5C4;
          --success: #2D6A4F;
        }

        .contact-page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── HERO ── */
        .hero {
          position: relative;
          height: 52vh;
          min-height: 340px;
          overflow: hidden;
        }
        .hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 40%;
          filter: brightness(0.55) saturate(0.85);
        }
        
        .hero-content {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 64px;
          text-align: center;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        .hero-title {
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }
        .hero-title span {
          color: var(--accent);
        }
        .hero-sub {
          font-size: 1rem;
          max-width: 480px;
          line-height: 1.6;
        }

        /* ── INFO STRIP ── */
        .info-strip {
          max-width: 1200px;
          margin: -36px auto 0;
          padding: 0 1.5rem;
          position: relative;
          z-index: 10;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 900px) { .info-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .info-grid { grid-template-columns: 1fr 1fr; gap: 8px; } }

        .info-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px 16px;
          box-shadow: 0 4px 24px rgba(92,45,10,0.08);
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(92,45,10,0.13);
        }
        .info-card-icon {
          width: 36px;
          height: 36px;
          background: var(--accent);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin-bottom: 4px;
        }
        .info-card-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .info-card-value {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.3;
        }
        .info-card-sub {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* ── MAIN SECTION ── */
        .main-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 1.5rem 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 900px) { .main-section { grid-template-columns: 1fr; } }

        /* ── FORM CARD ── */
        .form-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px 36px;
          box-shadow: 0 8px 40px rgba(92,45,10,0.08);
        }
        @media (max-width: 600px) { .form-card { padding: 28px 20px; } }

        .form-header {
          margin-bottom: 32px;
        }
        .form-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 8px;
        }
        .form-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .form-sub {
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        @media (max-width: 520px) { .form-row { grid-template-columns: 1fr; } }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field.full { margin-bottom: 14px; }

        .field label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .field label span {
          color: var(--accent);
        }

        .field-wrap {
          position: relative;
        }
        .field input,
        .field textarea {
          width: 100%;
          padding: 13px 16px;
          font-size: 14px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          background: var(--cream);
          color: var(--text);
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .field input::placeholder,
        .field textarea::placeholder {
          color: #C4AB9A;
        }
        .field input:focus,
        .field textarea:focus {
          border-color: var(--primary);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(139,58,15,0.1);
        }
        .field textarea {
          resize: none;
          line-height: 1.6;
        }

        .recaptcha-note {
          font-size: 11px;
          color: #b09080;
          margin-bottom: 12px;
          line-height: 1.5;
        }
        .recaptcha-note a {
          color: var(--text-muted);
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .error-box {
          background: #FFF0ED;
          border: 1px solid #F5C5B8;
          color: #B94040;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .submit-btn {
          width: 100%;
          padding: 15px 24px;
          background: var(--primary);
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(139,58,15,0.3);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(139,58,15,0.35);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* loading dots */
        .dots::after {
          content: '';
          animation: dots 1.2s steps(3, end) infinite;
        }
        @keyframes dots {
          0%   { content: ''; }
          33%  { content: '.'; }
          66%  { content: '..'; }
          100% { content: '...'; }
        }

        /* ── SUCCESS ── */
        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 24px;
          gap: 16px;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          background: #EAF5EE;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--success);
        }
        .success-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text);
        }
        .success-sub {
          font-size: 14px;
          color: var(--text-muted);
          max-width: 280px;
          line-height: 1.6;
        }
        .success-btn {
          margin-top: 8px;
          padding: 11px 24px;
          background: transparent;
          color: var(--primary);
          border: 1.5px solid var(--primary);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s, color 0.2s;
        }
        .success-btn:hover {
          background: var(--primary);
          color: #fff;
        }

        /* ── RIGHT COLUMN ── */
        .right-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .img-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          height: 340px;
          box-shadow: 0 8px 40px rgba(92,45,10,0.12);
        }
        .img-card-overlay {
          position: absolute;
          inset: 0;
          background: black;
          );
        }
        .img-card-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 28px;
          color: #fff;
        }
        .img-card-eyebrow {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 8px;
        }
        
        .img-card-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.72);
          line-height: 1.5;
          max-width: 280px;
        }

        .cta-card {
          background: var(--secondary);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 8px 32px rgba(92,45,10,0.2);
        }
        
       
        .cta-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          padding: 12px 20px;
        
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.2s, transform 0.15s;
        }
        .cta-btn:hover {
          transform: translateY(-1px);
        }

        /* quick stat strip inside right col */
        .stat-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .stat-item {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px 14px;
          text-align: center;
        }
        .stat-number {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.3;
        }
      `}</style>

      <div className="contact-page">
        {/* ── HERO ── */}
        <section className="hero">
          <img src="/food11.jpg" className="hero-img" alt="Contact" />
          <div className="hero-content">
            <p className=" text-accent ">We&apos;d love to hear from you</p>
            <h1 className="hero-title">Get in <span>Touch</span></h1>
            <p className="hero-sub text-white">
              Whether you&apos;re a venue owner ready to go digital or a customer who needs help — we&apos;re here.
            </p>
          </div>
        </section>

        {/* ── INFO STRIP ── */}
        <div className="info-strip">
          <div className="info-grid">
            {infoCards.map(({ icon: Icon, label, value, sub }) => (
              <div className="info-card" key={label}>
                <div className="info-card-icon">
                  <Icon size={16} />
                </div>
                <div className="info-card-label">{label}</div>
                <div className="info-card-value">{value}</div>
                <div className="info-card-sub">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="main-section">

          {/* FORM */}
          <div className="form-card">
            {success ? (
              <div className="success-state">
                <div className="success-icon">
                  <CheckCircle2 size={28} />
                </div>
                <div className="success-title">Message sent!</div>
                <p className="success-sub">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button className="success-btn" onClick={() => setSuccess(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="form-header">
                  <p className="form-eyebrow">Contact form</p>
                  <h2 className="form-title">Send us a message</h2>
                  <p className="form-sub">
                    Have a suggestion, question, or want to partner? We read every message.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="field">
                      <label>Full name <span>*</span></label>
                      <input name="name" value={form.name} onChange={handleChange}
                        placeholder="Your name" required />
                    </div>
                    <div className="field">
                      <label>Email <span>*</span></label>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        placeholder="you@email.com" required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field">
                      <label>Phone</label>
                      <input name="phone" value={form.phone} 
                     onChange={(e) => {
    const val = e.target.value;
    if (!val.startsWith("+977 ")) {
      setForm((prev) => ({ ...prev, phone: "+977 " }));
    } else {
      setForm((prev) => ({ ...prev, phone: val }));
    }
  }}
  onFocus={() => {
    if (!form.phone) setForm((prev) => ({ ...prev, phone: "+977 " }));
  }}
  placeholder="+977 98XXXXXXXX"
/>
                    </div>
                    <div className="field">
                      <label>Subject <span>*</span></label>
                      <input name="subject" value={form.subject} onChange={handleChange}
                        placeholder="What's this about?" required />
                    </div>
                  </div>

                  <div className="field full">
                    <label>Message <span>*</span></label>
                    <textarea name="message" value={form.message} onChange={handleChange}
                      placeholder="Tell us how we can help, share feedback, or ask anything…"
                      required rows={5} />
                  </div>

                  <p className="recaptcha-note">
                    Protected by reCAPTCHA —{" "}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>{" "}
                    &amp;{" "}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms</a> apply.
                  </p>

                  {error && <div className="error-box">{error}</div>}

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                      <span className="dots text-white bg-secondary">Sending</span>
                    ) : (
                      <>
                        <Send size={15} />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-col">
            <div className="img-card">
              <Image src="/food.jpg" fill className="object-cover" alt="Restaurant" />
              <div className="img-card-overlay" />
              <div className="img-card-content">
                <p className="img-card-eyebrow">For restaurant owners</p>
                <h3 className="text-2xl font-bold">Ready to go digital?</h3>
                <p className="img-card-sub">
                  Join restaurants already using our QR menu and ordering platform across Nepal.
                </p>
              </div>
            </div>

            <div className="stat-strip">
              {[
                { number: "500+", label: "Restaurants" },
                { number: "24h", label: "Response time" },
                { number: "4.9★", label: "Partner rating" },
              ].map(({ number, label }) => (
                <div className="stat-item" key={label}>
                  <div className="stat-number">{number}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>

            <div className="cta-card">
              <div >
                <h4 className="text-primary font-bold">Register your restaurant</h4>
                <p>Set up your digital menu in minutes. No technical skills needed.</p>
              </div>
              <a href="/register-restaurant" className=" bg-secondary text-white cta-btn">
                Get started <ArrowRight size={14} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Contact;