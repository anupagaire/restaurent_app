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
          <p className="text-gray-600 mb-6">This restaurant hasn't created their about page yet.</p>
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
    <div className="min-h-screen bg-primary/10">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[92vh]">
        
        {/* LEFT - primary Side */}
        <div className="bg-primary p-12 md:p-16 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute bottom-[-80px] right-[-80px] w-[280px] h-[280px] rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-[-40px] left-[-40px] w-[180px] h-[180px] rounded-full bg-accent/10 pointer-events-none" />
          
          <div className="relative z-10 max-w-lg">
            <Link 
              href={`/restaurants/${slug}`}
              className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-12 text-sm font-medium uppercase tracking-wider"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </Link>

            <div className="text-accent text-xs font-bold uppercase tracking-widest mb-5">
              Our Story
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {about.title || 'About Us'}
            </h1>

            {about.subtitle && (
              <p className="text-white/65 text-lg leading-relaxed mb-8 max-w-md">
                {about.subtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <span className="px-5 py-2 bg-accent text-white rounded-full text-sm font-medium">
                Est. Restaurant
              </span>
              <span className="px-5 py-2 bg-transparent border border-white/25 text-white/70 rounded-full text-sm font-medium">
                Our Story
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT - Brown Side with Image */}
        <div className="bg-[#1a2e0a] relative overflow-hidden min-h-[500px]">
          {heroPhoto ? (
            <>
              <Image
                src={heroPhoto.photo_url}
                alt={heroPhoto.alt || about.title || 'Restaurant'}
                fill
                priority
                className="object-cover transition-transform duration-[8000ms] hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-[#462D14]/30" />
              
              <div className="absolute bottom-10 left-10 bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg flex items-center gap-3 z-10">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-primary text-sm font-medium">Crafted with passion</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a2e0a] to-[#2d4a14]">
              <span className="text-6xl">🍃</span>
            </div>
          )}
          
          <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute bottom-[60px] right-[30px] w-[180px] h-[180px] rounded-full border border-accent/20 pointer-events-none" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1100px] mx-auto px-12 py-20">
        <div className="flex gap-12 items-start">
          <div className="hidden md:block sticky top-8 ">
            <div 
              className="text-[0.7rem] font-bold uppercase tracking-widest text-accent border-l-2 border-accent pl-2.5"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 'fit-content' }}
            >
              About
            </div>
          </div>
          
          <div className="text-[1.08rem] leading-[1.9] text-[#2a2a2a] font-light flex-1 prose prose-lg max-w-none">
            {about.content ? (
              <div dangerouslySetInnerHTML={{ __html: about.content }} />
            ) : (
              <p className="text-secondary">No content available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      {galleryPhotos.length > 0 && (
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-12">
            <div className="mb-12">
              <div className="text-[0.7rem] font-bold uppercase tracking-widest text-accent mb-3">
                Gallery
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                Moments & Memories
              </h2>
              <p className="text-[#6b6b6b] text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Scroll to explore
              </p>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-6">
              {galleryPhotos.map((photo, index) => (
                <div 
                  key={photo.id}
                  className="flex-shrink-0 w-80"
                >
                  <div className="relative w-80 h-[420px] rounded-2xl overflow-hidden bg-gray-200 group">
                    <Image
                      src={photo.photo_url}
                      alt={photo.alt || `Photo ${index + 2}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-secondary/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-normal">
                        {photo.alt || `Photo ${index + 2}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-[#6b6b6b] text-xs mt-3 font-light tracking-wider">
                    0{index + 2}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-primary py-20">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <p className="text-2xl md:text-3xl italic text-white/85 mb-8 font-light">
            Ready to experience it yourself?
          </p>
          <Link 
            href={`/restaurants/${slug}`}
            className="inline-flex items-center gap-2.5 bg-accent hover:bg-[#e07a45] text-white font-semibold px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg mb-5"
          >
            Visit Restaurant Page
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link 
            href={`/restaurants/${slug}`}
            className="block text-white/45 hover:text-white/80 text-sm transition-colors"
          >
            ← Back to Restaurant
          </Link>
        </div>
      </div>
    </div>
  );
}