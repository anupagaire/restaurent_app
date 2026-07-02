import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getRestaurantIdBySlug } from '@/lib/restaurant';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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

function resolvePhotoUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function getAboutPage(restaurantId: number): Promise<AboutData | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/restaurant-site/restaurant/${restaurantId}/about/`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) return null;
    
    const data = await res.json();
    let photos: Photo[] = [];
    
    if (data.id) {
      try {
        const photosRes = await fetch(
          `${BASE_URL}/api/v1/photo/?type=restaurant_website_section&purpose=about&object_id=${data.id}`,
          { cache: 'no-store' }
        );
        
        if (photosRes.ok) {
          const photosData = await photosRes.json();
          const photosList = photosData.results || photosData || [];
          
          photos = photosList.map((p: any) => ({
            id: p.id,
            photo_url: resolvePhotoUrl(p.photo_url) || '',
            alt: p.alt || '',
            purpose: p.purpose || 'about',
          }));
        }
      } catch (error) {
        console.error('Photo fetch error:', error);
      }
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
      photos: photos,
    };
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">About Page Not Available</h1>
          <p className="text-gray-600 mb-6">This restaurant hasn&apos;t created their about page yet.</p>
          <Link href={`/restaurants/${slug}`} className="text-secondary hover:underline font-medium">
            ← Back to Restaurant
          </Link>
        </div>
      </div>
    );
  }

  if (!about.is_published) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Published</h1>
          <p className="text-gray-600 mb-6">This about page is currently unpublished.</p>
          <Link href={`/restaurants/${slug}`} className="text-secondary hover:underline font-medium">
            ← Back to Restaurant
          </Link>
        </div>
      </div>
    );
  }

  const validPhotos = (about.photos || []).filter(p => p.photo_url);
  const heroPhoto = validPhotos[0];
  const galleryPhotos = validPhotos.slice(1);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      
      {/* MODERN HERO - Full Width with Overlay */}
      <section className="relative h-[85vh] min-h-150 overflow-hidden">
        {heroPhoto ? (
          <>
            <Image
              src={heroPhoto.photo_url}
              alt={heroPhoto.alt || about.title || 'Restaurant'}
              fill
              priority
              className="object-cover"
              unoptimized
            />
            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                 style={{
                   backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
                   backgroundSize: '40px 40px'
                 }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-8xl opacity-20">🍃</span>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <Link 
                href={`/restaurants/${slug}`}
                className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 text-sm transition-colors group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Restaurant
              </Link>

             

              {/* Main Title */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
                {about.title || 'About Us'}
              </h1>

              {/* Subtitle */}
              {about.subtitle && (
                <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
                  {about.subtitle}
                </p>
              )}

              
            </div>
          </div>
        </div>

        {/* Decorative Corner Element */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-white/5 to-transparent rounded-tl-full pointer-events-none" />
      </section>

      {/* CONTENT SECTION - Clean & Minimal */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          {/* Decorative Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-px bg-amber-400/40" />
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-amber-600">About Us</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Content */}
          <div className="prose prose-lg prose-gray max-w-none 
                          prose-headings:text-primary 
                          prose-p:text-gray-600 prose-p:leading-[2] prose-p:font-light 
                          prose-strong:text-primary 
                          prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                          prose-blockquote:border-l-amber-400 prose-blockquote:bg-amber-50/50 prose-blockquote:p-6 prose-blockquote:rounded-r-xl">
            {about.content ? (
              <div dangerouslySetInnerHTML={{ __html: about.content }} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-6xl mb-4">📝</span>
                <p className="text-gray-400 font-light text-lg">No content available yet.</p>
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-px bg-amber-400/40" />
                <span className="text-xs text-gray-400 font-light tracking-widest uppercase">
                  {about.title}
                </span>
              </div>
              <span className="text-xs text-gray-300 font-light tracking-widest">
                ✦ Since 2024
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION - Modern Grid */}
      {galleryPhotos.length > 0 && (
        <section className="bg-white py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            {/* Gallery Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-amber-400/40" />
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-amber-600">
                    Gallery
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
                  Visual Journey
                </h2>
                <p className="text-gray-400 font-light mt-2">Capturing the essence of our story</p>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <span className="w-8 h-px bg-gray-200" />
                {galleryPhotos.length} {galleryPhotos.length === 1 ? 'photo' : 'photos'}
              </div>
            </div>

            {/* Gallery Grid - Masonry Style Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px]">
              {galleryPhotos.map((photo, index) => (
                <div 
                  key={photo.id}
                  className={`group relative overflow-hidden rounded-2xl bg-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 ${
                    index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  } ${index === 1 ? 'md:row-span-1' : ''}`}
                >
                  <Image
                    src={photo.photo_url}
                    alt={photo.alt || `Photo ${index + 2}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-white text-sm font-light line-clamp-2">
                        {photo.alt || `Memory ${index + 2}`}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="w-8 h-px bg-white/40" />
                        <span className="text-white/40 text-[0.5rem] uppercase tracking-[0.2em] font-light">
                          {String(index + 2).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Index Badge */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/50 text-xs font-light">
                    {String(index + 2).padStart(2, '0')}
                  </div>

                  {/* Hover Zoom Effect Indicator */}
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER NAVIGATION */}
      <div className="bg-primary/5 backdrop-blur-sm border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link 
              href={`/restaurants/${slug}`}
              className="inline-flex items-center gap-3 text-primary/40 hover:text-primary text-sm transition-colors group"
            >
              <span className="w-8 h-8 rounded-full border border-primary/10 flex items-center justify-center group-hover:border-primary/30 transition-all group-hover:scale-110">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span>Back to Restaurant</span>
            </Link>
            
            <div className="flex items-center gap-6 text-primary/20 text-xs uppercase tracking-widest font-light">
              <span>{about.title}</span>
              <span className="w-4 h-px bg-primary/20" />
              <span>{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}