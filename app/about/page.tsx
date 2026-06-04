
import About from './aboutclient';

export const metadata = {
title: "About Us - Nepal's Best Restaurant Platform | QR Menu & Ordering",
description: "Learn about Nepal's leading restaurant platform. Discover how we help restaurants grow, enable customers to compare menus, scan QR codes, order online, book tables, and rate their experience.",  openGraph: {
    title: "About – Fine Indian, Western & Nepali Cuisine in Kathmandu",
    description: "Discover the story of restaurant, where we blend Indian spices, Western comfort foods, and Nepalese dishes to create an unforgettable dining experience in Kathmandu.",
    keywords: [
    "about restaurant platform Nepal",
    "QR menu Nepal",
    "online food ordering Nepal",
    "restaurant booking Nepal",
    "compare restaurant menus",
    "best restaurants Nepal"
  ],
  openGraph: {
    title: "About Us - Nepal's Restaurant Discovery Platform",
    description: "Connecting customers with multiple restaurants across Nepal.",
  },
    siteName: " Restaurant",
    images: [
      {
        url: "/5.jpg",
        width: 1200,
        height: 630,
        alt: " Restaurant Ambience",
      },
    ],
    locale: "en_US",
    type: "website",
  },
 
};


export default function Page() {
  return <About />; 
}