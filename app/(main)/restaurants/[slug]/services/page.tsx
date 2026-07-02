import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  CheckCircle, 
  Utensils, 
  Truck, 
  Users, 
  Clock, 
  Star, 
  ArrowRight,
  Sparkles,
  Coffee,
  Gift,
  Shield,
  Award,
  ChevronRight
} from 'lucide-react';

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
      `${BASE_URL}/api/v1/restaurant-site/restaurant/${restaurantId}/services/`,
      { cache: 'no-store', next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    
    // Fetch photos if service exists
    let photos: Photo[] = [];
    if (data.id) {
      try {
        const photosRes = await fetch(
          `${BASE_URL}/api/v1/photo/?type=restaurant_website_section&purpose=services&object_id=${data.id}`,
          { cache: 'no-store' }
        );
        if (photosRes.ok) {
          const photosData = await photosRes.json();
          const photosList = photosData.results || photosData || [];
          photos = photosList.map((p: any) => ({
            id: p.id,
            photo_url: p.photo_url,
            alt: p.alt || '',
            purpose: p.purpose || 'services',
          }));
        }
      } catch (error) {
        console.error('Photo fetch error:', error);
      }
    }
    
    return { ...data, photos };
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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-3xl p-12 shadow-lg">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-primary mb-2">Services Not Available</h1>
          <p className="text-muted-foreground mb-6">This restaurant hasn't created their services page yet.</p>
          <Link href={`/restaurants/${slug}`} className="text-secondary hover:underline font-medium inline-flex items-center gap-2">
            ← Back to Restaurant
          </Link>
        </div>
      </div>
    );
  }

  if (!services.is_published) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-3xl p-12 shadow-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-primary mb-2">Page Not Published</h1>
          <p className="text-muted-foreground mb-6">This services page is currently unpublished.</p>
          <Link href={`/restaurants/${slug}`} className="text-secondary hover:underline font-medium inline-flex items-center gap-2">
            ← Back to Restaurant
          </Link>
        </div>
      </div>
    );
  }

  const validPhotos = (services.photos || []).filter(p => p.photo_url);
  const heroPhoto = validPhotos[0];
  const galleryPhotos = validPhotos.slice(1);

  const featureCards = [
    {
      icon: <Utensils className="w-6 h-6 text-secondary" />,
      title: 'Fine Dining',
      desc: 'Experience exquisite cuisine in an elegant atmosphere with personalized service.',
      color: 'from-secondary/10 to-secondary/5',
      number: '01'
    },
    {
      icon: <Truck className="w-6 h-6 text-secondary" />,
      title: 'Delivery & Takeout',
      desc: 'Enjoy our delicious meals at home with fast delivery and convenient takeout options.',
      color: 'from-accent/10 to-accent/5',
      number: '02'
    },
    {
      icon: <Users className="w-6 h-6 text-secondary" />,
      title: 'Private Events',
      desc: 'Host your special occasions in our private dining rooms with custom catering.',
      color: 'from-primary/10 to-primary/5',
      number: '03'
    },
  ];

  const whyItems = [
    { 
      icon: <CheckCircle className="w-5 h-5 text-secondary" />, 
      title: 'Quality Ingredients', 
      desc: 'We source only the freshest, highest quality ingredients for every dish.',
      delay: '0.1s'
    },
    { 
      icon: <Clock className="w-5 h-5 text-secondary" />, 
      title: 'Timely Service', 
      desc: 'Punctual delivery and efficient service for your convenience.',
      delay: '0.2s'
    },
    { 
      icon: <Star className="w-5 h-5 text-secondary" />, 
      title: 'Expert Chefs', 
      desc: 'Our experienced chefs bring passion and skill to every meal.',
      delay: '0.3s'
    },
    { 
      icon: <Users className="w-5 h-5 text-secondary" />, 
      title: 'Customer Focus', 
      desc: 'Your satisfaction is our priority with personalized attention.',
      delay: '0.4s'
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      
      {/* HERO SECTION - Full Width Modern Design */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {heroPhoto ? (
            <>
              <Image
                src={heroPhoto.photo_url}
                alt={heroPhoto.alt || services.title || 'Services'}
                fill
                priority
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary" />
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-secondary/10 blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="max-w-3xl">
            {/* Back Button */}
            <Link 
              href={`/restaurants/${slug}`}
              className="inline-flex items-center gap-3 text-white/50 hover:text-white mb-8 text-sm font-medium transition-all duration-300 group"
            >
              <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all group-hover:scale-110">
                <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </span>
              Back to Restaurant
            </Link>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 mb-6">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-white/80 text-xs font-medium uppercase tracking-widest">Our Services</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              {services.title || 'Our Services'}
            </h1>

            {/* Subtitle */}
            {services.subtitle && (
              <p className="text-white/70 text-lg md:text-xl leading-relaxed font-light max-w-2xl">
                {services.subtitle}
              </p>
            )}

            {/* Service Tags */}
            <div className="flex flex-wrap gap-3 mt-8">
              <span className="px-4 py-2 bg-secondary/20 backdrop-blur-sm border border-secondary/20 rounded-full text-white text-sm font-medium">
                Fine Dining
              </span>
              <span className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white/70 text-sm font-medium">
                Private Events
              </span>
              <span className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white/70 text-sm font-medium">
                Delivery
              </span>
            </div>

            {/* Scroll Indicator */}
            <div className="flex items-center gap-4 mt-12 text-white/30">
              <div className="w-12 h-px bg-white/30" />
              <span className="text-xs uppercase tracking-[0.3em] animate-bounce">Explore Our Services</span>
            </div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* MAIN CONTENT */}
      <main className="relative z-10 -mt-16">
        
        {/* FEATURE CARDS - Floating Cards Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((card, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Number */}
                <div className="absolute top-4 right-6 text-6xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors duration-500">
                  {card.number}
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {card.desc}
                  </p>

                  {/* Learn More Link */}
                  <div className="mt-4 flex items-center gap-2 text-secondary font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}
          </div>
        </section>

        {/* CONTENT SECTION */}
        {services.content && (
          <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
            <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Label */}
                <div className="md:w-32 flex-shrink-0">
                  <div className="flex md:flex-col items-center md:items-start gap-4">
                    <div className="hidden md:block">
                      <div 
                        className="text-sm font-bold uppercase tracking-[0.3em] text-secondary/40"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        Details
                      </div>
                    </div>
                    <div className="md:hidden w-full">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-px bg-secondary/30" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">Details</span>
                        <div className="flex-1 h-px bg-secondary/30" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 prose prose-lg prose-primary max-w-none 
                              prose-headings:text-primary 
                              prose-p:text-primary/80 prose-p:leading-[1.9] prose-p:font-light 
                              prose-strong:text-primary 
                              prose-a:text-secondary prose-a:no-underline hover:prose-a:underline
                              prose-blockquote:border-l-secondary prose-blockquote:bg-secondary/5 prose-blockquote:p-6 prose-blockquote:rounded-r-xl">
                  <div dangerouslySetInnerHTML={{ __html: services.content }} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* WHY CHOOSE US - With Background */}
        <section className="bg-primary py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full border border-secondary/20 mb-4">
                <Award className="w-4 h-4 text-secondary" />
                <span className="text-secondary text-xs font-bold uppercase tracking-widest">Why Choose Us</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Why Choose Our Services
              </h2>
              <p className="text-white/60 font-light text-lg">
                We're committed to providing exceptional service and unforgettable experiences
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whyItems.map((item, index) => (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-white text-lg font-bold mb-1">{item.title}</h4>
                      <p className="text-white/60 font-light">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY SECTION */}
        {galleryPhotos.length > 0 && (
          <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              {/* Gallery Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-px bg-secondary/40" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">
                      Gallery
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-primary">
                    Our Services in Action
                  </h2>
                  <p className="text-muted-foreground font-light mt-2">
                    A visual journey through our offerings
                  </p>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <span className="w-8 h-px bg-muted" />
                  {galleryPhotos.length} {galleryPhotos.length === 1 ? 'photo' : 'photos'}
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className={`group relative rounded-2xl overflow-hidden bg-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/10 ${
                      index === 0 ? 'lg:col-span-2 lg:row-span-2 h-[400px] lg:h-[500px]' : 'h-[280px]'
                    }`}
                  >
                    <Image
                      src={photo.photo_url}
                      alt={photo.alt || `Service photo ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-white text-sm font-light line-clamp-2">
                          {photo.alt || `Photo ${index + 1}`}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="w-8 h-px bg-white/40" />
                          <span className="text-white/40 text-xs uppercase tracking-[0.2em] font-light">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Index */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/50 text-xs font-light">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Zoom Icon */}
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

        {/* CTA SECTION */}
        <section className="bg-gradient-to-r from-primary to-secondary py-16">
          <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 mb-6">
              <Gift className="w-4 h-4 text-accent" />
              <span className="text-white/80 text-xs font-medium uppercase tracking-widest">Ready to Experience</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Book Our Services?
            </h2>
            
            <p className="text-white/70 text-lg font-light mb-8 max-w-2xl mx-auto">
              Experience exceptional service and create unforgettable memories with us
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href={`/restaurants/${slug}/contact`}
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href={`/restaurants/${slug}`}
                className="inline-flex items-center gap-2 text-white/70 hover:text-white px-6 py-4 rounded-full font-medium transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                <Shield className="w-4 h-4" />
                Back to Restaurant
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <div className="bg-primary/5 backdrop-blur-sm border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link 
              href={`/restaurants/${slug}`}
              className="inline-flex items-center gap-3 text-primary/40 hover:text-primary text-sm transition-colors group"
            >
              <span className="w-8 h-8 rounded-full border border-primary/10 flex items-center justify-center group-hover:border-primary/30 transition-all group-hover:scale-110">
                <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </span>
              <span>Back to Restaurant</span>
            </Link>
            
            <div className="flex items-center gap-6 text-primary/20 text-xs uppercase tracking-widest font-light">
              <span>{services.title || 'Services'}</span>
              <span className="w-4 h-px bg-primary/20" />
              <span>{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}