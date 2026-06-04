import type { Metadata } from "next";
import "./globals.css";

import { getWebsiteContent } from "@/lib/websiteContent";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Best Restaurants in Nepal | Compare Menu, Order Online & Book Table",
  description: "Discover, compare menus, rate restaurants & order food online in Nepal. Book tables, scan QR menu and read real reviews from multiple restaurants on one platform.",
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
    description: "Discover, compare menus, rate restaurants & order food online in Nepal. Book tables and scan QR menu.",
    images: [
      {
        url: "/og-image.jpg", // Change this later with your actual image
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <html lang="en">
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