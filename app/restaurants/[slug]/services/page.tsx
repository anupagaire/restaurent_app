
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Utensils, Truck, Users, Clock, Star } from 'lucide-react';

import { getRestaurantIdBySlug } from '@/lib/restaurant';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface Photo {
  id: number;
  photo_url: string;
  alt: string;
  purpose: string;
}

interface ServicesData {
  id: number;
  restaurant: number;
  section_type: string;
  title: string;
  subtitle: string;
  content: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  photos: Photo[];
}

async function getServicesPage(restaurantId: number): Promise<ServicesData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/restaurant-site/restaurant/${restaurantId}/services/`,
      { cache: 'no-store', next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurantId = await getRestaurantIdBySlug(slug);
  if (!restaurantId) return { title: 'Services - Restaurant Not Found' };
  const services = await getServicesPage(restaurantId);
  if (!services || !services.is_published) return { title: 'Services - Not Available' };
  return {
    title: services.meta_title || `${services.title} - Services`,
    description: services.meta_description || services.subtitle,
  };
}

export default async function RestaurantServicesPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurantId = await getRestaurantIdBySlug(slug);
  if (!restaurantId) return notFound();

  const services = await getServicesPage(restaurantId);

  if (!services) {
    return (
      <>
        <style>{styles}</style>
        <div className="sv-empty">
          <div className="sv-empty__card">
            <span className="sv-empty__icon">🍽️</span>
            <h1>Services Page Not Available</h1>
            <p>This restaurant hasn't created their services page yet.</p>
            <Link href={`/restaurants/${slug}`} className="sv-empty__link">← Back to Restaurant</Link>
          </div>
        </div>
      </>
    );
  }

  if (!services.is_published) {
    return (
      <>
        <style>{styles}</style>
        <div className="sv-empty">
          <div className="sv-empty__card">
            <span className="sv-empty__icon">🔒</span>
            <h1>Page Not Published</h1>
            <p>This services page is currently unpublished.</p>
            <Link href={`/restaurants/${slug}`} className="sv-empty__link">← Back to Restaurant</Link>
          </div>
        </div>
      </>
    );
  }

  const featureCards = [
    {
      icon: <Utensils className="sv-feat__icon-svg" />,
      title: 'Fine Dining',
      desc: 'Experience exquisite cuisine in an elegant atmosphere with personalized service.',
      num: '01',
    },
    {
      icon: <Truck className="sv-feat__icon-svg" />,
      title: 'Delivery & Takeout',
      desc: 'Enjoy our delicious meals at home with fast delivery and convenient takeout options.',
      num: '02',
    },
    {
      icon: <Users className="sv-feat__icon-svg" />,
      title: 'Private Events',
      desc: 'Host your special occasions in our private dining rooms with custom catering.',
      num: '03',
    },
  ];

  const whyItems = [
    { icon: <CheckCircle className="sv-why__icon-svg" />, title: 'Quality Ingredients', desc: 'We source only the freshest, highest quality ingredients for every dish.' },
    { icon: <Clock className="sv-why__icon-svg" />,        title: 'Timely Service',      desc: 'Punctual delivery and efficient service for your convenience.' },
    { icon: <Star className="sv-why__icon-svg" />,         title: 'Expert Chefs',        desc: 'Our experienced chefs bring passion and skill to every meal.' },
    { icon: <Users className="sv-why__icon-svg" />,        title: 'Customer Focus',      desc: 'Your satisfaction is our priority with personalized attention.' },
  ];

  return (
    <>
      <style>{styles}</style>

      <div className="sv">

        {/* ── SPLIT HERO ── */}
        <header className="sv-hero">
          {/* LEFT */}
          <div className="sv-hero__left">
            <Link href={`/restaurants/${slug}`} className="sv-hero__back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </Link>

            <div className="sv-hero__eyebrow">What We Offer</div>

            <h1 className="sv-hero__title">
              {(services.title || 'Our Services').split(' ').map((word, i) => (
                <span key={i} className="sv-hero__word" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                  {word}{' '}
                </span>
              ))}
            </h1>

            {services.subtitle && (
              <p className="sv-hero__sub">{services.subtitle}</p>
            )}

            <div className="sv-hero__badges">
              <span className="sv-badge">Fine Dining</span>
              <span className="sv-badge sv-badge--outline">Events</span>
              <span className="sv-badge sv-badge--outline">Delivery</span>
            </div>
          </div>

          {/* RIGHT — decorative */}
          <div className="sv-hero__right">
            <div className="sv-hero__photo-wrap">
              {services.photos && services.photos.length > 0 ? (
                <Image
                  src={services.photos[0].photo_url}
                  alt={services.photos[0].alt || 'Service'}
                  fill
                  className="sv-hero__photo"
                  priority
                />
              ) : (
                <div className="sv-hero__placeholder"><span>🍴</span></div>
              )}
              <div className="sv-hero__overlay" />
              <div className="sv-hero__float-card">
                <div className="sv-hero__float-dot" />
                <span>Excellence in every detail</span>
              </div>
            </div>
            <div className="sv-hero__circle sv-hero__circle--1" />
            <div className="sv-hero__circle sv-hero__circle--2" />
          </div>
        </header>

        <main className="sv-main">

          {/* ── FEATURE CARDS ── */}
          <section className="sv-feat">
            <div className="sv-feat__head">
              <div className="sv-feat__label">Our Services</div>
              <h2 className="sv-feat__title">Everything You Need</h2>
              <div className="sv-feat__rule" />
            </div>

            <div className="sv-feat__grid">
              {featureCards.map((card, i) => (
                <div
                  key={i}
                  className="sv-feat__card"
                  style={{ animationDelay: `${0.1 + i * 0.12}s` }}
                >
                  <div className="sv-feat__num">{card.num}</div>
                  <div className="sv-feat__icon-wrap">
                    {card.icon}
                  </div>
                  <h3 className="sv-feat__card-title">{card.title}</h3>
                  <p className="sv-feat__card-desc">{card.desc}</p>
                  <div className="sv-feat__card-bar" />
                </div>
              ))}
            </div>
          </section>

          {/* ── RICH TEXT CONTENT ── */}
          {services.content && (
            <section className="sv-content">
              <div className="sv-content__inner">
                <div className="sv-content__label">
                  <span>Details</span>
                </div>
                <div
                  className="sv-content__body prose-bistro"
                  dangerouslySetInnerHTML={{ __html: services.content }}
                />
              </div>
            </section>
          )}

          {/* ── WHY CHOOSE US ── */}
          <section className="sv-why">
            <div className="sv-why__head">
              <div className="sv-why__label">Why Us</div>
              <h2 className="sv-why__title">Why Choose Our Services</h2>
              <div className="sv-why__rule" />
            </div>

            <div className="sv-why__grid">
              {whyItems.map((item, i) => (
                <div
                  key={i}
                  className="sv-why__card"
                  style={{ animationDelay: `${0.05 + i * 0.1}s` }}
                >
                  <div className="sv-why__icon-wrap">
                    {item.icon}
                  </div>
                  <div className="sv-why__text">
                    <h4 className="sv-why__card-title">{item.title}</h4>
                    <p className="sv-why__card-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── HORIZONTAL SCROLL GALLERY ── */}
          {services.photos && services.photos.length > 0 && (
            <section className="sv-gallery">
              <div className="sv-gallery__head">
                <div className="sv-gallery__label">Gallery</div>
                <h2 className="sv-gallery__title">Our Services in Action</h2>
                <p className="sv-gallery__hint">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{display:'inline',marginRight:'6px'}}>
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Scroll to explore
                </p>
              </div>

              <div className="sv-gallery__track-wrap">
                <div className="sv-gallery__track">
                  {services.photos.map((photo, i) => (
                    <div
                      key={photo.id}
                      className="sv-gallery__card"
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <div className="sv-gallery__img-wrap">
                        <Image
                          src={photo.photo_url}
                          alt={photo.alt || 'Service photo'}
                          fill
                          className="sv-gallery__img"
                        />
                        <div className="sv-gallery__caption">
                          <span>{photo.alt || `Photo ${i + 1}`}</span>
                        </div>
                      </div>
                      <div className="sv-gallery__num">0{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── CTA ── */}
          <div className="sv-cta">
            <div className="sv-cta__inner">
              <div className="sv-cta__tag">Get in Touch</div>
              <p className="sv-cta__text">Interested in Our Services?</p>
              <p className="sv-cta__sub">
                Contact us today to learn more about our catering, private dining, and special event services.
              </p>
              <div className="sv-cta__btns">
                <Link href={`/restaurants/${slug}/menu`} className="sv-cta__btn sv-cta__btn--primary">
                  <Utensils style={{width:'16px',height:'16px'}} />
                  View Menu
                </Link>
                <Link href={`/restaurants/${slug}`} className="sv-cta__btn sv-cta__btn--outline">
                  Contact Us
                </Link>
              </div>
              <Link href={`/restaurants/${slug}`} className="sv-cta__back">
                ← Back to Restaurant
              </Link>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');

/* ── Keyframes ── */
@keyframes sv-fadeUp {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes sv-wordIn {
  from { opacity:0; transform:translateY(40px) skewY(4deg); }
  to   { opacity:1; transform:translateY(0) skewY(0deg); }
}
@keyframes sv-slideRight {
  from { opacity:0; transform:translateX(-20px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes sv-scaleIn {
  from { opacity:0; transform:scale(0.94); }
  to   { opacity:1; transform:scale(1); }
}
@keyframes sv-floatCard {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-8px); }
}
@keyframes sv-spin-slow {
  from { transform:rotate(0deg); }
  to   { transform:rotate(360deg); }
}
@keyframes sv-ruleGrow {
  from { width:0; }
  to   { width:60px; }
}
@keyframes sv-barGrow {
  from { width:0; }
  to   { width:40px; }
}

/* ── Root ── */
.sv {
  --green:   #2d5016;
  --green-l: #3d6b20;
  --terra:   #c4622d;
  --terra-l: #e07a45;
  --cream:   #f8f4ee;
  --white:   #ffffff;
  --ink:     #1a1a1a;
  --muted:   #6b6b6b;
  font-family: 'Outfit', sans-serif;
  color: var(--ink);
  background: var(--cream);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ══════════════
   HERO
══════════════ */
.sv-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 92vh;
}

.sv-hero__left {
  background: var(--green);
  padding: 56px 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.sv-hero__left::before {
  content:''; position:absolute; bottom:-80px; right:-80px;
  width:280px; height:280px; border-radius:50%;
  background:rgba(255,255,255,0.03); pointer-events:none;
}
.sv-hero__left::after {
  content:''; position:absolute; top:-40px; left:-40px;
  width:180px; height:180px; border-radius:50%;
  background:rgba(196,98,45,0.08); pointer-events:none;
}

.sv-hero__back {
  display:inline-flex; align-items:center; gap:8px;
  color:rgba(255,255,255,0.5); font-size:0.8rem; font-weight:500;
  text-decoration:none; letter-spacing:0.06em; text-transform:uppercase;
  margin-bottom:52px; transition:color 0.2s; width:fit-content;
  animation: sv-slideRight 0.5s ease forwards;
}
.sv-hero__back:hover { color:rgba(255,255,255,0.9); }

.sv-hero__eyebrow {
  font-size:0.72rem; font-weight:600; letter-spacing:0.2em;
  text-transform:uppercase; color:var(--terra-l); margin-bottom:20px;
  animation: sv-fadeUp 0.6s ease forwards; animation-delay:0.05s; opacity:0;
}

.sv-hero__title {
  font-family:'Fraunces',serif;
  font-size:clamp(2.8rem,5vw,4.4rem);
  font-weight:700; line-height:1.08;
  color:var(--white); margin:0 0 28px; overflow:hidden;
}
.sv-hero__word {
  display:inline-block; opacity:0;
  animation: sv-wordIn 0.6s cubic-bezier(.22,.68,0,1.1) forwards;
}

.sv-hero__sub {
  font-size:1.05rem; font-weight:300; line-height:1.7;
  color:rgba(255,255,255,0.65); max-width:420px; margin:0 0 40px;
  animation: sv-fadeUp 0.6s ease forwards; animation-delay:0.45s; opacity:0;
}

.sv-hero__badges {
  display:flex; gap:10px; flex-wrap:wrap;
  animation: sv-fadeUp 0.6s ease forwards; animation-delay:0.55s; opacity:0;
}
.sv-badge {
  font-size:0.75rem; font-weight:500; letter-spacing:0.06em;
  padding:7px 16px; border-radius:100px;
  background:var(--terra); color:#fff;
}
.sv-badge--outline {
  background:transparent;
  border:1.5px solid rgba(255,255,255,0.25);
  color:rgba(255,255,255,0.7);
}

.sv-hero__right {
  position:relative; overflow:hidden; background:#1a2e0a;
}
.sv-hero__photo-wrap { position:absolute; inset:0; }
.sv-hero__photo {
  object-fit:cover; transition:transform 8s ease;
}
.sv-hero__right:hover .sv-hero__photo { transform:scale(1.04); }
.sv-hero__overlay {
  position:absolute; inset:0;
  background:linear-gradient(135deg,rgba(26,46,10,0.55) 0%,rgba(0,0,0,0.2) 100%);
}
.sv-hero__placeholder {
  position:absolute; inset:0; display:flex;
  align-items:center; justify-content:center; font-size:5rem;
  background:linear-gradient(135deg,#1a2e0a,#2d4a14);
}

.sv-hero__float-card {
  position:absolute; bottom:40px; left:40px;
  background:rgba(255,255,255,0.95); backdrop-filter:blur(12px);
  border-radius:12px; padding:12px 20px;
  display:flex; align-items:center; gap:10px;
  font-size:0.82rem; font-weight:500; color:var(--green);
  box-shadow:0 8px 32px rgba(0,0,0,0.2);
  animation: sv-floatCard 4s ease-in-out infinite; z-index:2;
}
.sv-hero__float-dot {
  width:8px; height:8px; border-radius:50%;
  background:var(--terra); flex-shrink:0;
}

.sv-hero__circle {
  position:absolute; border-radius:50%;
  border:1px solid rgba(255,255,255,0.1);
  pointer-events:none; z-index:1;
}
.sv-hero__circle--1 {
  width:300px; height:300px; top:-80px; right:-80px;
  animation: sv-spin-slow 30s linear infinite;
}
.sv-hero__circle--2 {
  width:180px; height:180px; bottom:60px; right:30px;
  border-color:rgba(196,98,45,0.2);
}

/* ══════════════
   MAIN
══════════════ */
.sv-main { background:var(--cream); }

/* section shared header */
.sv-feat__label, .sv-why__label, .sv-gallery__label {
  font-size:0.7rem; font-weight:600; letter-spacing:0.2em;
  text-transform:uppercase; color:var(--terra); margin-bottom:10px;
}
.sv-feat__title, .sv-why__title, .sv-gallery__title {
  font-family:'Fraunces',serif;
  font-size:clamp(1.8rem,4vw,2.6rem);
  font-weight:700; color:var(--green); margin:0 0 16px; line-height:1.1;
}
.sv-feat__rule, .sv-why__rule, .sv-gallery__rule {
  height:3px; width:60px;
  background:linear-gradient(90deg,var(--green),var(--terra));
  border-radius:2px;
  animation: sv-ruleGrow 0.8s cubic-bezier(.22,.68,0,1.2) forwards;
}

/* ── Feature cards ── */
.sv-feat {
  max-width:1100px; margin:0 auto; padding:80px 48px 60px;
}
.sv-feat__head { margin-bottom:48px; }

.sv-feat__grid {
  display:grid; grid-template-columns:repeat(3,1fr); gap:24px;
}

.sv-feat__card {
  background:var(--white);
  border:1px solid rgba(45,80,22,0.08);
  border-radius:20px; padding:36px 28px 32px;
  position:relative; overflow:hidden;
  opacity:0; animation: sv-fadeUp 0.6s ease forwards;
  transition: transform 0.25s, box-shadow 0.25s;
}
.sv-feat__card:hover {
  transform:translateY(-6px);
  box-shadow:0 20px 48px rgba(45,80,22,0.12);
}
.sv-feat__card::before {
  content:'';
  position:absolute; top:0; left:0; right:0; height:3px;
  background:linear-gradient(90deg,var(--green),var(--terra));
  transform:scaleX(0); transform-origin:left;
  transition:transform 0.35s ease;
}
.sv-feat__card:hover::before { transform:scaleX(1); }

.sv-feat__num {
  font-family:'Fraunces',serif; font-size:3.5rem; font-weight:700;
  color:rgba(45,80,22,0.07); line-height:1;
  position:absolute; top:16px; right:20px; letter-spacing:-0.02em;
}
.sv-feat__icon-wrap {
  width:52px; height:52px; border-radius:14px;
  background:rgba(45,80,22,0.08);
  display:flex; align-items:center; justify-content:center;
  margin-bottom:20px;
}
.sv-feat__icon-svg { width:24px; height:24px; color:var(--green); }

.sv-feat__card-title {
  font-family:'Fraunces',serif; font-size:1.3rem;
  font-weight:700; color:var(--green); margin:0 0 10px;
}
.sv-feat__card-desc {
  font-size:0.92rem; line-height:1.7; color:var(--muted);
  font-weight:300; margin:0 0 20px;
}
.sv-feat__card-bar {
  height:2px; width:0;
  background:var(--terra); border-radius:1px;
  animation: sv-barGrow 0.6s 0.8s ease forwards;
}

/* ── Rich text content ── */
.sv-content {
  max-width:1100px; margin:0 auto; padding:20px 48px 60px;
}
.sv-content__inner {
  display:grid; grid-template-columns:140px 1fr;
  gap:48px; align-items:start;
}
.sv-content__label { padding-top:8px; position:sticky; top:32px; }
.sv-content__label span {
  display:block; font-size:0.7rem; font-weight:600;
  letter-spacing:0.2em; text-transform:uppercase; color:var(--terra);
  writing-mode:vertical-rl; transform:rotate(180deg);
  border-left:2px solid var(--terra); padding-left:10px;
}

.prose-bistro {
  font-size:1.05rem; line-height:1.9; color:#2a2a2a; font-weight:300;
  animation: sv-fadeUp 0.7s ease forwards; animation-delay:0.1s; opacity:0;
}
.prose-bistro > p:first-of-type::first-letter {
  font-family:'Fraunces',serif; font-size:4.5rem; font-weight:700;
  color:var(--green); float:left; line-height:0.75;
  margin-right:8px; margin-top:8px;
}
.prose-bistro h1,.prose-bistro h2,.prose-bistro h3 {
  font-family:'Fraunces',serif; color:var(--green);
  margin-top:2em; margin-bottom:0.6em; font-weight:700;
}
.prose-bistro h2 { font-size:1.8rem; }
.prose-bistro h3 { font-size:1.3rem; }
.prose-bistro p  { margin-bottom:1.4em; }
.prose-bistro strong { color:var(--green); font-weight:600; }
.prose-bistro a {
  color:var(--terra); text-decoration:none; font-weight:500;
  border-bottom:1.5px solid rgba(196,98,45,0.3); padding-bottom:1px;
  transition:border-color 0.2s;
}
.prose-bistro a:hover { border-color:var(--terra); }
.prose-bistro blockquote {
  margin:2em 0; padding:24px 32px;
  border-left:4px solid var(--terra);
  background:rgba(196,98,45,0.05);
  border-radius:0 12px 12px 0;
  font-family:'Fraunces',serif; font-style:italic;
  font-size:1.2rem; color:var(--green);
}
.prose-bistro ul,.prose-bistro ol { padding-left:1.5em; margin-bottom:1.4em; }
.prose-bistro li { margin-bottom:0.5em; }
.prose-bistro li::marker { color:var(--terra); }

/* ── Why choose us ── */
.sv-why {
  background:var(--green); padding:80px 48px;
}
.sv-why__head { max-width:1100px; margin:0 auto 48px; }
.sv-why__label { color:var(--terra-l) !important; }
.sv-why__title { color:var(--white) !important; }
.sv-why__rule {
  background:linear-gradient(90deg,var(--terra-l),rgba(255,255,255,0.3)) !important;
}

.sv-why__grid {
  max-width:1100px; margin:0 auto;
  display:grid; grid-template-columns:repeat(2,1fr); gap:20px;
}

.sv-why__card {
  display:flex; gap:20px; align-items:flex-start;
  background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.1);
  border-radius:16px; padding:24px 28px;
  opacity:0; animation: sv-fadeUp 0.6s ease forwards;
  transition: background 0.25s, transform 0.25s;
}
.sv-why__card:hover {
  background:rgba(255,255,255,0.1);
  transform:translateY(-3px);
}

.sv-why__icon-wrap {
  width:44px; height:44px; flex-shrink:0;
  background:rgba(196,98,45,0.25);
  border-radius:12px;
  display:flex; align-items:center; justify-content:center;
}
.sv-why__icon-svg { width:20px; height:20px; color:var(--terra-l); }

.sv-why__card-title {
  font-family:'Fraunces',serif; font-size:1.05rem;
  font-weight:700; color:var(--white); margin:0 0 6px;
}
.sv-why__card-desc {
  font-size:0.88rem; line-height:1.65;
  color:rgba(255,255,255,0.6); font-weight:300; margin:0;
}

/* ── Gallery ── */
.sv-gallery { padding:80px 0; overflow:hidden; }
.sv-gallery__head { max-width:1100px; margin:0 auto; padding:0 48px 36px; }
.sv-gallery__hint {
  font-size:0.82rem; color:var(--muted);
  display:flex; align-items:center; margin:0;
}

.sv-gallery__track-wrap {
  padding:8px 48px 24px; overflow-x:auto;
  scrollbar-width:thin; scrollbar-color:var(--terra) transparent;
  cursor:grab;
}
.sv-gallery__track-wrap:active { cursor:grabbing; }
.sv-gallery__track-wrap::-webkit-scrollbar { height:4px; }
.sv-gallery__track-wrap::-webkit-scrollbar-thumb { background:var(--terra); border-radius:2px; }

.sv-gallery__track {
  display:flex; gap:20px; width:max-content; padding-bottom:8px;
}

.sv-gallery__card {
  flex-shrink:0; width:320px; opacity:0;
  animation: sv-scaleIn 0.5s ease forwards;
}
.sv-gallery__img-wrap {
  position:relative; width:320px; height:240px;
  border-radius:16px; overflow:hidden; background:#d0d0d0;
}
.sv-gallery__img {
  object-fit:cover;
  transition:transform 0.5s cubic-bezier(.22,.68,0,1.1);
}
.sv-gallery__card:hover .sv-gallery__img { transform:scale(1.06); }
.sv-gallery__caption {
  position:absolute; bottom:0; left:0; right:0;
  padding:32px 16px 16px;
  background:linear-gradient(to top,rgba(26,46,10,0.85) 0%,transparent 100%);
  color:#fff; font-size:0.82rem; font-weight:400;
  transform:translateY(100%); transition:transform 0.35s ease;
  border-radius:0 0 16px 16px;
}
.sv-gallery__card:hover .sv-gallery__caption { transform:translateY(0); }
.sv-gallery__num {
  font-family:'Fraunces',serif; font-size:0.72rem; font-weight:300;
  color:var(--muted); margin-top:10px; letter-spacing:0.08em;
}

/* ── CTA ── */
.sv-cta { background:var(--terra); padding:80px 48px; }
.sv-cta__inner { max-width:600px; margin:0 auto; text-align:center; }
.sv-cta__tag {
  display:inline-block;
  font-size:0.72rem; font-weight:600; letter-spacing:0.18em;
  text-transform:uppercase; color:rgba(255,255,255,0.7);
  border:1px solid rgba(255,255,255,0.25);
  padding:5px 14px; border-radius:100px; margin-bottom:20px;
}
.sv-cta__text {
  font-family:'Fraunces',serif;
  font-size:clamp(1.8rem,4vw,2.8rem);
  font-weight:700; color:#fff; margin:0 0 12px; line-height:1.15;
}
.sv-cta__sub {
  font-size:1rem; font-weight:300;
  color:rgba(255,255,255,0.75); margin:0 0 36px; line-height:1.7;
}
.sv-cta__btns {
  display:flex; gap:12px; justify-content:center;
  flex-wrap:wrap; margin-bottom:20px;
}
.sv-cta__btn {
  display:inline-flex; align-items:center; gap:8px;
  font-size:0.9rem; font-weight:600; letter-spacing:0.04em;
  text-decoration:none; padding:13px 28px; border-radius:100px;
  transition:all 0.25s;
}
.sv-cta__btn--primary {
  background:#fff; color:var(--terra);
}
.sv-cta__btn--primary:hover {
  background:var(--cream); transform:translateY(-2px);
  box-shadow:0 10px 28px rgba(0,0,0,0.15);
}
.sv-cta__btn--outline {
  background:transparent; color:#fff;
  border:1.5px solid rgba(255,255,255,0.4);
}
.sv-cta__btn--outline:hover {
  background:rgba(255,255,255,0.12); transform:translateY(-2px);
}
.sv-cta__back {
  display:block; font-size:0.82rem;
  color:rgba(255,255,255,0.45); text-decoration:none; transition:color 0.2s;
}
.sv-cta__back:hover { color:rgba(255,255,255,0.8); }

/* ── Responsive ── */
@media (max-width:900px) {
  .sv-hero { grid-template-columns:1fr; min-height:auto; }
  .sv-hero__right { height:50vw; min-height:280px; position:relative; }
  .sv-hero__left { padding:40px 32px; }
  .sv-hero__back { margin-bottom:32px; }
  .sv-feat { padding:56px 24px 40px; }
  .sv-feat__grid { grid-template-columns:1fr; }
  .sv-content { padding:20px 24px 48px; }
  .sv-content__inner { grid-template-columns:1fr; }
  .sv-content__label { display:none; }
  .sv-why { padding:56px 24px; }
  .sv-why__grid { grid-template-columns:1fr; }
  .sv-gallery__head { padding:0 24px 28px; }
  .sv-gallery__track-wrap { padding:8px 24px 24px; }
  .sv-cta { padding:56px 24px; }
}
@media (max-width:540px) {
  .sv-hero__left { padding:32px 24px; }
  .sv-hero__title { font-size:2.4rem; }
  .sv-feat__grid { grid-template-columns:1fr; }
  .sv-gallery__card { width:260px; }
  .sv-gallery__img-wrap { width:260px; height:200px; }
}

/* ── Empty states ── */
.sv-empty {
  min-height:100vh; background:#f8f4ee;
  display:flex; align-items:center; justify-content:center;
  font-family:'Outfit',sans-serif; padding:24px;
}
.sv-empty__card {
  text-align:center; background:#fff; border-radius:24px;
  padding:64px 48px; box-shadow:0 4px 40px rgba(0,0,0,0.08);
  max-width:400px; width:100%;
  animation: sv-fadeUp 0.6s ease forwards;
}
.sv-empty__icon { font-size:3rem; display:block; margin-bottom:20px; }
.sv-empty__card h1 {
  font-family:'Fraunces',serif; font-size:1.6rem;
  color:#2d5016; margin:0 0 10px;
}
.sv-empty__card p { color:#888; margin:0 0 28px; font-size:0.95rem; }
.sv-empty__link {
  color:#2d5016; font-weight:500; text-decoration:none;
  border-bottom:1.5px solid rgba(45,80,22,0.3); padding-bottom:2px;
  transition:border-color 0.2s;
}
.sv-empty__link:hover { border-color:#2d5016; }
`;
