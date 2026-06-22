import type { Metadata } from "next";
import "./globals.css";
import { headers } from 'next/headers';
import { getWebsiteContent } from "@/lib/websiteContent";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Best Restaurants in Nepal | Compare Menu, Order Online & Book Table",
  description: "Discover, compare menus, rate restaurants & order food online in Nepal. Book tables, scan QR menus and read real reviews.",
  alternates: {
    canonical: "https://restaurent-app-sepia.vercel.app/", 
  },
  keywords: [
    "restaurants in Nepal",
    "order food online",
    "compare restaurant menus",
    "book table Nepal",
    "restaurant reviews Nepal",
    "QR menu",
    "online food ordering Nepal",
    "rate restaurants Nepal"
  ],
  openGraph: {
    title: "Best Restaurants in Nepal | Compare Menu, Order Online & Book Table",
    description: "Discover, compare menus, rate restaurants & order food online in Nepal. Book tables, scan QR menus and read real reviews.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {

const headersList = await headers()
  const isEnterprise = headersList.get('x-is-enterprise')

  if (isEnterprise) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    )
  }

  const content = await getWebsiteContent();

  const navbarProps = {
    logo: content?.site_settings?.logo,
    links: content?.navbar?.links,
    loginBtn: content?.navbar?.buttons?.login,
    registerBtn: content?.navbar?.buttons?.register_restaurant,
  };

  const footerData = content ? {
    brand: content.brand,
    columns: content.columns,
    socials: content.socials,
  } : null;
const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Best Restaurants in Nepal",
    "url": "https://yourdomain.com",
    "description": "Discover, compare menus, rate restaurants and order food online in Nepal.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://yourdomain.com/restaurants?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className="antialiased">
        <ClientLayout 
          navbarProps={navbarProps} 
          footerData={footerData}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}