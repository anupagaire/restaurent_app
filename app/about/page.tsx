
import About from './aboutclient';

export const metadata = {
  title: "About Restaurant | Authentic Indian, Western & Nepalese Cuisines",
  description: "Learn about , a multi-cuisine restaurant serving authentic Indian, Western and Nepalese cuisines with quality, tradition, and warm hospitality.",
  openGraph: {
    title: "About – Fine Indian, Western & Nepali Cuisine in Kathmandu",
    description: "Discover the story of restaurant, where we blend Indian spices, Western comfort foods, and Nepalese dishes to create an unforgettable dining experience in Kathmandu.",
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