import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';

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

interface AboutData {
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

async function getAboutPage(restaurantId: number): Promise<AboutData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/restaurant-site/restaurant/${restaurantId}/about/`,
      { cache: 'no-store', next: { revalidate: 60 } }
    );
    if (!res.ok) { console.log(`About page not found: ${res.status}`); return null; }
    return await res.json();
  } catch (error) {
    console.error('About page fetch error:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurantId = await getRestaurantIdBySlug(slug);
  if (!restaurantId) return { title: 'About - Restaurant Not Found' };
  const about = await getAboutPage(restaurantId);
  if (!about || !about.is_published) return { title: 'About - Not Available' };
  return {
    title: about.meta_title || `${about.title} - About`,
    description: about.meta_description || about.subtitle,
  };
}

export default async function RestaurantAboutPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurantId = await getRestaurantIdBySlug(slug);
  if (!restaurantId) return notFound();

  const about = await getAboutPage(restaurantId);

  if (!about) {
    return (
      <>
        <style>{styles}</style>
        <div className="ab-empty">
          <div className="ab-empty__card">
            <span className="ab-empty__icon">🍽️</span>
            <h1>About Page Not Available</h1>
            <Link href={`/restaurants/${slug}`} className="ab-empty__link">← Back to Restaurant</Link>
          </div>
        </div>
      </>
    );
  }

  if (!about.is_published) {
    return (
      <>
        <style>{styles}</style>
        <div className="ab-empty">
          <div className="ab-empty__card">
            <span className="ab-empty__icon">🔒</span>
            <h1>Page Not Published</h1>
            <p>This about page is currently unpublished.</p>
            <Link href={`/restaurants/${slug}`} className="ab-empty__link">← Back to Restaurant</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="ab">

        {/* SPLIT HERO */}
        <header className="ab-hero">
          {/* LEFT text panel */}
          <div className="ab-hero__left">
            <Link href={`/restaurants/${slug}`} className="ab-hero__back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </Link>

            <div className="ab-hero__eyebrow">Our Story</div>

            <h1 className="ab-hero__title">
              {(about.title || 'About Us').split(' ').map((word, i) => (
                <span key={i} className="ab-hero__word" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                  {word}{' '}
                </span>
              ))}
            </h1>

            {about.subtitle && (
              <p className="ab-hero__sub">{about.subtitle}</p>
            )}

            <div className="ab-hero__badges">
              <span className="ab-badge">Est. Restaurant</span>
              <span className="ab-badge ab-badge--outline">Our Story</span>
            </div>
          </div>

          {/* RIGHT photo panel */}
          <div className="ab-hero__right">
            <div className="ab-hero__photo-wrap">
              {about.photos && about.photos.length > 0 ? (
                <Image
                  src={about.photos[0].photo_url}
                  alt={about.photos[0].alt || 'Restaurant'}
                  fill
                  className="ab-hero__photo"
                  priority
                />
              ) : (
                <div className="ab-hero__photo-placeholder">
                  <span>🍃</span>
                </div>
              )}
              <div className="ab-hero__photo-overlay" />
              <div className="ab-hero__float-card">
                <div className="ab-hero__float-dot" />
                <span>Crafted with passion</span>
              </div>
            </div>
            <div className="ab-hero__circle ab-hero__circle--1" />
            <div className="ab-hero__circle ab-hero__circle--2" />
          </div>
        </header>

        {/* MAIN */}
        <main className="ab-main">

          {about.content && (
            <section className="ab-content">
              <div className="ab-content__inner">
                <div className="ab-content__label">
                  <span>About</span>
                </div>
                <div
                  className="ab-content__body prose-bistro"
                  dangerouslySetInnerHTML={{ __html: about.content }}
                />
              </div>
            </section>
          )}

          {/* HORIZONTAL SCROLL GALLERY */}
          {about.photos && about.photos.length > 0 && (
            <section className="ab-gallery">
              <div className="ab-gallery__head">
                <div className="ab-gallery__label">Gallery</div>
                <h2 className="ab-gallery__title">Moments &amp; Memories</h2>
                <p className="ab-gallery__hint">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{display:'inline',marginRight:'6px'}}>
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Scroll to explore
                </p>
              </div>

              <div className="ab-gallery__track-wrap">
                <div className="ab-gallery__track">
                  {about.photos.map((photo, i) => (
                    <div
                      key={photo.id}
                      className="ab-gallery__card"
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <div className="ab-gallery__img-wrap">
                        <Image
                          src={photo.photo_url}
                          alt={photo.alt || 'Restaurant photo'}
                          fill
                          className="ab-gallery__img"
                        />
                        <div className="ab-gallery__caption">
                          <span>{photo.alt || `Photo ${i + 1}`}</span>
                        </div>
                      </div>
                      <div className="ab-gallery__num">0{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* BOTTOM CTA */}
          <div className="ab-cta">
            <div className="ab-cta__inner">
              <p className="ab-cta__text">Ready to experience it yourself?</p>
              <Link href={`/restaurants/${slug}`} className="ab-cta__btn">
                Visit Restaurant Page
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href={`/restaurants/${slug}`} className="ab-cta__back">
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

@keyframes ab-fadeUp {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes ab-wordIn {
  from { opacity:0; transform:translateY(40px) skewY(4deg); }
  to   { opacity:1; transform:translateY(0) skewY(0deg); }
}
@keyframes ab-slideRight {
  from { opacity:0; transform:translateX(-20px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes ab-scaleIn {
  from { opacity:0; transform:scale(0.94); }
  to   { opacity:1; transform:scale(1); }
}
@keyframes ab-floatCard {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-8px); }
}
@keyframes ab-spin-slow {
  from { transform:rotate(0deg); }
  to   { transform:rotate(360deg); }
}

.ab {
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

/* HERO */
.ab-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 92vh;
}

.ab-hero__left {
  background: var(--green);
  padding: 56px 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.ab-hero__left::before {
  content:'';
  position:absolute; bottom:-80px; right:-80px;
  width:280px; height:280px; border-radius:50%;
  background:rgba(255,255,255,0.03); pointer-events:none;
}
.ab-hero__left::after {
  content:'';
  position:absolute; top:-40px; left:-40px;
  width:180px; height:180px; border-radius:50%;
  background:rgba(196,98,45,0.08); pointer-events:none;
}

.ab-hero__back {
  display:inline-flex; align-items:center; gap:8px;
  color:rgba(255,255,255,0.5); font-size:0.8rem; font-weight:500;
  text-decoration:none; letter-spacing:0.06em; text-transform:uppercase;
  margin-bottom:52px; transition:color 0.2s; width:fit-content;
  animation: ab-slideRight 0.5s ease forwards;
}
.ab-hero__back:hover { color:rgba(255,255,255,0.9); }

.ab-hero__eyebrow {
  font-size:0.72rem; font-weight:600; letter-spacing:0.2em;
  text-transform:uppercase; color:var(--terra-l); margin-bottom:20px;
  animation: ab-fadeUp 0.6s ease forwards; animation-delay:0.05s; opacity:0;
}

.ab-hero__title {
  font-family:'Fraunces',serif;
  font-size:clamp(2.8rem,5vw,4.4rem);
  font-weight:700; line-height:1.08;
  color:var(--white); margin:0 0 28px; overflow:hidden;
}
.ab-hero__word {
  display:inline-block; opacity:0;
  animation: ab-wordIn 0.6s cubic-bezier(.22,.68,0,1.1) forwards;
}

.ab-hero__sub {
  font-size:1.05rem; font-weight:300; line-height:1.7;
  color:rgba(255,255,255,0.65); max-width:420px; margin:0 0 40px;
  animation: ab-fadeUp 0.6s ease forwards; animation-delay:0.45s; opacity:0;
}

.ab-hero__badges {
  display:flex; gap:10px; flex-wrap:wrap;
  animation: ab-fadeUp 0.6s ease forwards; animation-delay:0.55s; opacity:0;
}
.ab-badge {
  font-size:0.75rem; font-weight:500; letter-spacing:0.06em;
  padding:7px 16px; border-radius:100px;
  background:var(--terra); color:#fff;
}
.ab-badge--outline {
  background:transparent;
  border:1.5px solid rgba(255,255,255,0.25);
  color:rgba(255,255,255,0.7);
}

.ab-hero__right {
  position:relative; overflow:hidden; background:#1a2e0a;
}
.ab-hero__photo-wrap { position:absolute; inset:0; }
.ab-hero__photo {
  object-fit:cover;
  transition:transform 8s ease;
}
.ab-hero__right:hover .ab-hero__photo { transform:scale(1.04); }
.ab-hero__photo-overlay {
  position:absolute; inset:0;
  background:#462D14;
}
.ab-hero__photo-placeholder {
  position:absolute; inset:0; display:flex;
  align-items:center; justify-content:center;
  font-size:5rem;
  background:linear-gradient(135deg,#1a2e0a,#2d4a14);
}

.ab-hero__float-card {
  position:absolute; bottom:40px; left:40px;
  background:rgba(255,255,255,0.95); backdrop-filter:blur(12px);
  border-radius:12px; padding:12px 20px;
  display:flex; align-items:center; gap:10px;
  font-size:0.82rem; font-weight:500; color:var(--green);
  box-shadow:0 8px 32px rgba(0,0,0,0.2);
  animation: ab-floatCard 4s ease-in-out infinite; z-index:2;
}
.ab-hero__float-dot {
  width:8px; height:8px; border-radius:50%;
  background:var(--terra); flex-shrink:0;
}

.ab-hero__circle {
  position:absolute; border-radius:50%;
  border:1px solid rgba(255,255,255,0.1);
  pointer-events:none; z-index:1;
}
.ab-hero__circle--1 {
  width:300px; height:300px; top:-80px; right:-80px;
  animation: ab-spin-slow 30s linear infinite;
}
.ab-hero__circle--2 {
  width:180px; height:180px; bottom:60px; right:30px;
  border-color:rgba(196,98,45,0.2);
}

/* CONTENT */
.ab-main { background:var(--cream); }

.ab-content { max-width:1100px; margin:0 auto; padding:80px 48px; }
.ab-content__inner {
  display:grid; grid-template-columns:140px 1fr;
  gap:48px; align-items:start;
}
.ab-content__label { padding-top:8px; position:sticky; top:32px; }
.ab-content__label span {
  display:block; font-size:0.7rem; font-weight:600;
  letter-spacing:0.2em; text-transform:uppercase; color:var(--terra);
  writing-mode:vertical-rl; transform:rotate(180deg);
  border-left:2px solid var(--terra); padding-left:10px; height:fit-content;
}

.prose-bistro {
  font-size:1.08rem; line-height:1.9; color:#2a2a2a; font-weight:300;
  animation: ab-fadeUp 0.7s ease forwards; animation-delay:0.1s; opacity:0;
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
  color:var(--terra); text-decoration:none;
  position:relative; font-weight:500;
  border-bottom: 1.5px solid rgba(196,98,45,0.3);
  padding-bottom:1px; transition:border-color 0.2s;
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

/* GALLERY */
.ab-gallery { padding:0 0 80px; overflow:hidden; }
.ab-gallery__head { max-width:1100px; margin:0 auto; padding:0 48px 36px; }
.ab-gallery__label {
  font-size:0.7rem; font-weight:600; letter-spacing:0.2em;
  text-transform:uppercase; color:var(--terra); margin-bottom:10px;
}
.ab-gallery__title {
  font-family:'Fraunces',serif;
  font-size:clamp(1.8rem,4vw,2.8rem);
  font-weight:700; color:var(--green); margin:0 0 12px; line-height:1.1;
}
.ab-gallery__hint {
  font-size:0.82rem; color:var(--muted);
  display:flex; align-items:center; margin:0;
}

.ab-gallery__track-wrap {
  padding:8px 48px 24px; overflow-x:auto;
  scrollbar-width:thin; scrollbar-color:var(--terra) transparent;
  cursor:grab;
}
.ab-gallery__track-wrap:active { cursor:grabbing; }
.ab-gallery__track-wrap::-webkit-scrollbar { height:4px; }
.ab-gallery__track-wrap::-webkit-scrollbar-thumb { background:var(--terra); border-radius:2px; }

.ab-gallery__track {
  display:flex; gap:20px; width:max-content; padding-bottom:8px;
}

.ab-gallery__card {
  flex-shrink:0; width:320px; opacity:0;
  animation: ab-scaleIn 0.5s ease forwards;
}
.ab-gallery__img-wrap {
  position:relative; width:320px; height:420px;
  border-radius:16px; overflow:hidden; background:#d0d0d0;
}
.ab-gallery__img {
  object-fit:cover;
  transition:transform 0.5s cubic-bezier(.22,.68,0,1.1);
}
.ab-gallery__card:hover .ab-gallery__img { transform:scale(1.06); }
.ab-gallery__caption {
  position:absolute; bottom:0; left:0; right:0;
  padding:40px 20px 20px;
  background:linear-gradient(to top,rgba(26,46,10,0.85) 0%,transparent 100%);
  color:#fff; font-size:0.82rem; font-weight:400;
  transform:translateY(100%); transition:transform 0.35s ease;
  border-radius:0 0 16px 16px;
}
.ab-gallery__card:hover .ab-gallery__caption { transform:translateY(0); }
.ab-gallery__num {
  font-family:'Fraunces',serif; font-size:0.72rem; font-weight:300;
  color:var(--muted); margin-top:12px; letter-spacing:0.08em;
}

/* CTA */
.ab-cta { background:var(--green); padding:80px 48px; }
.ab-cta__inner { max-width:600px; margin:0 auto; text-align:center; }
.ab-cta__text {
  font-family:'Fraunces',serif;
  font-size:clamp(1.4rem,3vw,2rem);
  font-style:italic; color:rgba(255,255,255,0.85);
  margin:0 0 32px; font-weight:300;
}
.ab-cta__btn {
  display:inline-flex; align-items:center; gap:10px;
  background:var(--terra); color:#fff;
  font-size:0.9rem; font-weight:600; letter-spacing:0.04em;
  text-decoration:none; padding:14px 32px; border-radius:100px;
  transition:all 0.25s; margin-bottom:20px;
}
.ab-cta__btn:hover {
  background:var(--terra-l); transform:translateY(-2px);
  box-shadow:0 12px 32px rgba(196,98,45,0.4);
}
.ab-cta__btn svg { transition:transform 0.25s; }
.ab-cta__btn:hover svg { transform:translateX(4px); }
.ab-cta__back {
  display:block; font-size:0.82rem;
  color:rgba(255,255,255,0.45); text-decoration:none; transition:color 0.2s;
}
.ab-cta__back:hover { color:rgba(255,255,255,0.8); }

/* RESPONSIVE */
@media (max-width:900px) {
  .ab-hero { grid-template-columns:1fr; min-height:auto; }
  .ab-hero__right { height:50vw; min-height:280px; position:relative; }
  .ab-hero__left { padding:40px 32px; }
  .ab-hero__back { margin-bottom:32px; }
  .ab-content__inner { grid-template-columns:1fr; }
  .ab-content__label { display:none; }
  .ab-content { padding:48px 24px; }
  .ab-gallery__head { padding:0 24px 28px; }
  .ab-gallery__track-wrap { padding:8px 24px 24px; }
  .ab-cta { padding:56px 24px; }
}
@media (max-width:540px) {
  .ab-hero__left { padding:32px 24px; }
  .ab-hero__title { font-size:2.4rem; }
  .ab-gallery__card { width:260px; }
  .ab-gallery__img-wrap { width:260px; height:340px; }
}

/* EMPTY STATES */
.ab-empty {
  min-height:100vh; background:#f8f4ee;
  display:flex; align-items:center; justify-content:center;
  font-family:'Outfit',sans-serif; padding:24px;
}
.ab-empty__card {
  text-align:center; background:#fff; border-radius:24px;
  padding:64px 48px; box-shadow:0 4px 40px rgba(0,0,0,0.08);
  max-width:400px; width:100%;
  animation: ab-fadeUp 0.6s ease forwards;
}
.ab-empty__icon { font-size:3rem; display:block; margin-bottom:20px; }
.ab-empty__card h1 {
  font-family:'Fraunces',serif; font-size:1.6rem;
  color:#2d5016; margin:0 0 10px;
}
.ab-empty__card p { color:#888; margin:0 0 28px; font-size:0.95rem; }
.ab-empty__link {
  color:#2d5016; font-weight:500; text-decoration:none;
  border-bottom:1.5px solid rgba(45,80,22,0.3); padding-bottom:2px; transition:border-color 0.2s;
}
.ab-empty__link:hover { border-color:#2d5016; }
`;