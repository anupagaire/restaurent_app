import { notFound } from 'next/navigation';
import Image from 'next/image';
import { restaurants } from '@/data/mockData';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Phone } from 'lucide-react';
import MenuSection from '@/components/menu/MenuSection';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = restaurants.find((r) => r.slug === slug);
  if (!restaurant) return notFound();

  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh' }}>
      <Navbar />
<div
  style={{
    display: "flex",
    flexDirection: "row",
    height: 440,
    overflow: "hidden",
    borderRadius: 16,
  }}
>
  {/* LEFT IMAGE */}
  <div style={{ position: "relative", width: "50%", height: "100%" }}>
    <Image
      src={restaurant.image}
      alt={restaurant.name}
      fill
      priority
      style={{ objectFit: "cover" }}
    />
  </div>

  {/* RIGHT CONTENT */}
  <div
    style={{
      width: "50%",
      padding: "40px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      background: "linear-gradient(135deg, #513012, #47034E, #5D0565)",
      color: "white",
    }}
  >
    <h1
      style={{
        fontFamily: 'Georgia,"Times New Roman",serif',
        fontSize: "clamp(2rem,3vw,3rem)",
        fontWeight: 700,
        marginBottom: 10,
        lineHeight: 1.1,
      }}
    >
      {restaurant.name}
    </h1>

    <p
      style={{
        fontSize: 15,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 20,
      }}
    >
      {restaurant.tagline}
    </p>

    {/* INFO BOXES */}
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      
      {/* Rating */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 24,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        ⭐ {restaurant.rating} · {restaurant.reviewCount} reviews
      </span>

      {/* Hours */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 24,
          padding: "8px 14px",
          fontSize: 13,
        }}
      >
        🕒 {restaurant.openingHours}
      </span>

      {/* Address (optional extra) */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          opacity: 0.9,
        }}
      >
        📍 {restaurant.address}
      </span>
 <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          opacity: 0.9,
        }}
      >            <Phone style={{ width: 14, height: 14, color: '#5D0565' }} /> {restaurant.phone}
          </span>
    </div>
  </div>
</div>

   

      {/* MENU — client component handles tabs + filter */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        <MenuSection menuItems={restaurant.menuItems} />
      </div>

      <Footer />
    </div>
  );
}