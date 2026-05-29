'use client';
import { MapPin, UtensilsCrossed, Star } from 'lucide-react';

interface ApiPhoto {
  id: number;
  object_id: number;
  photo_url: string | null;
}

interface RestaurantData {
  id: number;
  name: string;
  address: string;
  city: string;
  zip?: string | null;
  availability?: string | null;
  amenities?: string | null;
  table_count?: number;
  view_count?: number;
  photos: ApiPhoto[];
  menus?: { id: number; name: string; status: boolean }[];
  seo?: {
    canonical_url?: string;
    slug?: string;
  };
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function RestaurantFooter({
  restaurant,
  slug,
}: {
  restaurant: RestaurantData;
  slug: string;
}) {
  const base = `/restaurants/${slug}`;
  const year = new Date().getFullYear();

  // Pick a few menu items to show as quick links (max 5)
  const menuLinks = (restaurant.menus ?? [])
    .filter((m) => m.status)
    .slice(0, 5);

  const navLinks = [
    { href: `${base}#home`,    label: 'Home' },
    { href: `${base}#menu`,    label: 'Menu' },
    { href: `${base}#reviews`, label: 'Reviews' },
    { href: `${base}#about`,   label: 'About Us' },
  ];

  return (
        <footer className="bg-[#513012] text-white">

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '56px 24px 32px',
          position: 'relative',
        }}
      >
        {/* Main grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* ── Brand column ── */}
          <div style={{ gridColumn: 'span 1' }}>
            {/* Logo / Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #513012, #8b4513)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '2px solid rgba(255,255,255,0.15)',
                }}
              >
                <UtensilsCrossed size={20} color="rgba(255,255,255,0.9)" />
              </div>
              <div>
                    <h2 className="text-3xl font-bold"> {restaurant.name}</h2>
                {restaurant.city && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    {restaurant.city}, Nepal
                  </p>
                )}
              </div>
            </div>
   <p className="text-gray-300 text-sm leading-relaxed">
    Bringing the best flavors of Nepal to your table.<br />
    Fresh • Delicious • Authentic
  </p>

            {/* Star rating decoration */}
            <div style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  style={{ fill: '#f59e0b', color: '#f59e0b' }}
                />
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
                       <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block hover:text-white transition"
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#f59e0b')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#513012',
                        flexShrink: 0,
                      }}
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

         
          <div>
                        <h3 className="font-semibold mb-4 text-lg">Get In Touch</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Address */}
              {restaurant.address && (
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <MapPin className="mt-1 w-5 h-5" />
                  <p >
                    {restaurant.address}
                    {restaurant.city ? `, ${restaurant.city}` : ''}
                    {restaurant.zip ? ` - ${restaurant.zip}` : ''}
                  </p>
                </div>
              )}
              

              {/* Table count */}
              {restaurant.table_count && restaurant.table_count > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>🪑</span>
                  <p>
                    {restaurant.table_count} tables available
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

      
  <div className="border-t border-white/20 mt-12 pt-4 text-center text-sm text-white">
            © {year} {restaurant.name}. All rights reserved.
        </div>
        {/* ── Bottom bar ── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
         

          
        </div>
      </div>
    </footer>
  );
}