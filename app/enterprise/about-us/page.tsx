import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface Photo {
  id: number
  photo_url: string
  alt: string
  purpose: string
}

interface AboutData {
  id: number
  restaurant: number
  section_type: string
  title: string
  subtitle: string
  content: string
  meta_title: string
  meta_description: string
  is_published: boolean
  photos: Photo[]
}

function resolvePhotoUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

async function getAboutPage(restaurantId: number): Promise<AboutData | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/restaurant-site/restaurant/${restaurantId}/about/`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    const data = await res.json()
    let photos: Photo[] = []
    if (data.id) {
      try {
        const photosRes = await fetch(
          `${BASE_URL}/api/v1/photo/?type=restaurant_website_section&purpose=about&object_id=${data.id}`,
          { cache: 'no-store' }
        )
        if (photosRes.ok) {
          const photosData = await photosRes.json()
          const photosList = photosData.results || photosData || []
          photos = photosList.map((p: any) => ({
            id: p.id,
            photo_url: resolvePhotoUrl(p.photo_url) || '',
            alt: p.alt || '',
            purpose: p.purpose || 'about',
          }))
        }
      } catch {}
    }
    return {
      id: data.id,
      restaurant: data.restaurant,
      section_type: data.section_type,
      title: data.title,
      subtitle: data.subtitle,
      content: data.content,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      is_published: data.is_published,
      photos,
    }
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const restaurantId = Number(headersList.get('x-restaurant-id') )
  const about = await getAboutPage(restaurantId)
  if (!about) return { title: 'About Us' }
  return {
    title: about.meta_title || about.title || 'About Us',
    description: about.meta_description || about.subtitle,
  }
}

export default async function EnterpriseAboutPage() {
  const headersList = await headers()
  const restaurantId = Number(headersList.get('x-restaurant-id') ?? '8') // ← Number() fix

  if (!restaurantId) return notFound()

  const about = await getAboutPage(restaurantId)

  if (!about) {
    return (
      <div className="min-h-screen bg-[#0e0b07] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-white mb-2">About Page Not Available</h1>
          <p className="text-white/50 mb-6">This restaurant hasn&apos;t created their about page yet.</p>
          <Link href="/" className="text-accent hover:underline font-medium">← Back to Home</Link>
        </div>
      </div>
    )
  }

  if (!about.is_published) {
    return (
      <div className="min-h-screen bg-[#0e0b07] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Page Not Published</h1>
          <p className="text-white/50 mb-6">This about page is currently unpublished.</p>
          <Link href="/" className="text-accent hover:underline font-medium">← Back to Home</Link>
        </div>
      </div>
    )
  }

  const validPhotos = (about.photos || []).filter((p) => p.photo_url)
  const heroPhoto = validPhotos[0]
  const galleryPhotos = validPhotos.slice(1)

  return (
    <div className="min-h-screen bg-[#0e0b07]">

      {/* SPLIT HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[92vh]">

        {/* LEFT */}
        <div
          className="p-12 md:p-16 flex flex-col justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 100%)' }}
        >
          <div className="absolute bottom-[-80px] right-[-80px] w-[280px] h-[280px] rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-[-40px] left-[-40px] w-[180px] h-[180px] rounded-full bg-accent/10 pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '180px',
            }}
          />
          <div className="relative z-10 max-w-lg">
            <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-12 text-sm font-medium uppercase tracking-wider transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-accent" />
              <span className="text-accent text-[11px] font-bold uppercase tracking-widest">Our Story</span>
            </div>
            <h1 className="font-bold text-white mb-6 leading-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              {about.title || 'About Us'}
            </h1>
            {about.subtitle && (
              <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-md font-light">{about.subtitle}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <span className="px-5 py-2 text-white rounded-full text-sm font-medium" style={{ background: 'linear-gradient(135deg, #c8914a, #a8722e)' }}>
                Est. Restaurant
              </span>
              <span className="px-5 py-2 text-white/60 rounded-full text-sm font-medium" style={{ border: '1px solid rgba(200,145,74,0.3)' }}>
                Our Story
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — Image */}
        <div className="relative overflow-hidden min-h-[500px] bg-[#1a0f0a]">
          {heroPhoto ? (
            <>
              <Image src={heroPhoto.photo_url} alt={heroPhoto.alt || about.title || 'Restaurant'} fill priority className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-[#0e0b07]/30" />
              <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3 z-10">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-gray-900 text-sm font-medium">Crafted with passion</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-20">🍽️</span>
            </div>
          )}
          <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute bottom-[60px] right-[30px] w-[180px] h-[180px] rounded-full pointer-events-none" style={{ border: '1px solid rgba(200,145,74,0.2)' }} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1100px] mx-auto px-8 sm:px-12 py-20">
        <div className="flex gap-12 items-start">
          <div className="hidden md:block sticky top-8 flex-shrink-0">
            <div className="text-[0.7rem] font-bold uppercase tracking-widest text-accent pl-2.5" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', borderLeft: '2px solid #c8914a' }}>
              About
            </div>
          </div>
          <div className="text-[1.08rem] leading-[1.9] text-white/60 font-light flex-1 prose prose-lg max-w-none prose-invert" style={{ fontFamily: 'Georgia, serif' }}>
            {about.content ? (
              <div dangerouslySetInnerHTML={{ __html: about.content }} />
            ) : (
              <p className="text-white/40">No content available.</p>
            )}
          </div>
        </div>
      </div>

      {/* GALLERY */}
      {galleryPhotos.length > 0 && (
        <div className="py-20" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(200,145,74,0.1)' }}>
          <div className="max-w-7xl mx-auto px-8 sm:px-12">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-accent" />
                <span className="text-accent text-[11px] font-bold uppercase tracking-widest">Gallery</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-light text-white mb-3" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Moments & Memories
              </h2>
              <p className="text-white/30 text-sm">← Scroll to explore</p>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-6">
              {galleryPhotos.map((photo, index) => (
                <div key={photo.id} className="flex-shrink-0 w-80">
                  <div className="relative w-80 h-[420px] rounded-3xl overflow-hidden group" style={{ border: '1px solid rgba(200,145,74,0.12)' }}>
                    <Image src={photo.photo_url} alt={photo.alt || `Photo ${index + 2}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                      <p className="text-white text-sm font-light">{photo.alt || `Photo ${index + 2}`}</p>
                    </div>
                  </div>
                  <div className="text-white/20 text-xs mt-3 font-light tracking-wider">0{index + 2}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #c8914a 0%, #a8722e 50%, #6b3d12 100%)' }}>
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="max-w-[600px] mx-auto px-6 text-center relative z-10">
          <p className="text-2xl md:text-3xl italic text-secondary/70 mb-8 font-light" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Ready to experience it yourself?
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2.5 bg-[#0e0b07] hover:bg-[#1c1208] text-accent font-semibold px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg mb-5"
          >
            Reserve a Table
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <Link href="/" className="text-secondary/40 hover:text-secondary/70 text-sm transition-colors">← Back to Home</Link>
          </div>
        </div>
      </div>

    </div>
  )
}