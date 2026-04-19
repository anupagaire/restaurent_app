// data/mockData.ts
export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  reviewCount: number;
  openingHours: string;
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isPopular?: boolean;
  isVeg: boolean;
}

// 5 Sample Restaurants (Super Admin can add more later)
export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "SpiceRoute",
    slug: "spiceroute",
    tagline: "Where every plate tells a story",
    description: "Experience the finest fusion of Himalayan spices and global flavors.",
    address: "Thamel, Kathmandu",
    phone: "+977 980-1234567",
    image: "/food.jpg",
    rating: 4.98,
    reviewCount: 1284,
    openingHours: "11:00 AM - 11:00 PM",
    menuItems: [
      { id: 1, category: "Starters", name: "Momo Platter", description: "Chicken, veg & buff momo with 3 sauces", price: 450, image: "https://picsum.photos/id/1080/600/400", isPopular: true, isVeg: false },
      { id: 2, category: "Main Course", name: "Butter Chicken", description: "Tender chicken in rich tomato gravy", price: 680, image: "https://picsum.photos/id/201/600/400", isPopular: true, isVeg: false },
    ]
  },
  {
    id: 2,
    name: "Himalayan Flavors",
    slug: "himalayan-flavors",
    tagline: "Taste of the Mountains",
    description: "Authentic Nepali and Tibetan cuisine with fresh ingredients.",
    address: "Lazimpat, Kathmandu",
    phone: "+977 981-2345678",
    image: "/food11.jpg",
    rating: 4.85,
    reviewCount: 932,
    openingHours: "10:00 AM - 10:00 PM",
    menuItems: [
      { id: 1, category: "Main Course", name: "Dal Bhat Set", description: "Traditional Nepali thali", price: 520, image: "https://picsum.photos/id/292/600/400", isVeg: true },
    ]
  },
  {
    id: 3,
    name: "Momo Kingdom",
    slug: "momo-kingdom",
    tagline: "Momo Lovers Paradise",
    description: "Best steamed & fried momos in town.",
    address: "Boudha, Kathmandu",
    phone: "+977 986-1234567",
    image: "/food1.jpg",
    rating: 4.9,
    reviewCount: 2140,
    openingHours: "12:00 PM - 10:00 PM",
    menuItems: []
  },
  {
    id: 4,
    name: "The Royal Spice",
    slug: "royal-spice",
    tagline: "Royal Taste Since 2018",
    description: "Fine dining with traditional Nepali recipes.",
    address: "Jhamsikhel, Lalitpur",
    phone: "+977 984-1122334",
    image: "/food.jpg",
    rating: 4.75,
    reviewCount: 678,
    openingHours: "11:30 AM - 10:30 PM",
    menuItems: []
  },
  {
    id: 5,
    name: "SpiceRoute",
    slug: "spiceroute",
    tagline: "Where every plate tells a story",
    description: "Experience the finest fusion of Himalayan spices and global flavors.",
    address: "Thamel, Kathmandu",
    phone: "+977 980-1234567",
    image: "/food.jpg",
    rating: 4.98,
    reviewCount: 1284,
    openingHours: "11:00 AM - 11:00 PM",
    menuItems: [
      { id: 1, category: "Starters", name: "Momo Platter", description: "Chicken, veg & buff momo with 3 sauces", price: 450, image: "https://picsum.photos/id/1080/600/400", isPopular: true, isVeg: false },
      { id: 2, category: "Main Course", name: "Butter Chicken", description: "Tender chicken in rich tomato gravy", price: 680, image: "https://picsum.photos/id/201/600/400", isPopular: true, isVeg: false },
    ]
  },
  {
    id: 6,
    name: "Route",
    slug: "spiceroute",
    tagline: "Where every plate tells a story",
    description: "Experience the finest fusion of Himalayan spices and global flavors.",
    address: "Thamel, Kathmandu",
    phone: "+977 980-1234567",
    image: "/food.jpg",
    rating: 4.98,
    reviewCount: 1284,
    openingHours: "11:00 AM - 11:00 PM",
    menuItems: [
      { id: 1, category: "Starters", name: "Momo Platter", description: "Chicken, veg & buff momo with 3 sauces", price: 450, image: "https://picsum.photos/id/1080/600/400", isPopular: true, isVeg: false },
      { id: 2, category: "Main Course", name: "Butter Chicken", description: "Tender chicken in rich tomato gravy", price: 680, image: "https://picsum.photos/id/201/600/400", isPopular: true, isVeg: false },
    ]
  },
  {
    id: 7,
    name: "Spice",
    slug: "spiceroute",
    tagline: "Where every plate tells a story",
    description: "Experience the finest fusion of Himalayan spices and global flavors.",
    address: "Thamel, Kathmandu",
    phone: "+977 980-1234567",
    image: "/food11.jpg",
    rating: 4.98,
    reviewCount: 1284,
    openingHours: "11:00 AM - 11:00 PM",
    menuItems: [
      { id: 1, category: "Starters", name: "Momo Platter", description: "Chicken, veg & buff momo with 3 sauces", price: 450, image: "https://picsum.photos/id/1080/600/400", isPopular: true, isVeg: false },
      { id: 2, category: "Main Course", name: "Butter Chicken", description: "Tender chicken in rich tomato gravy", price: 680, image: "https://picsum.photos/id/201/600/400", isPopular: true, isVeg: false },
    ]
  },
  {
    id: 8,
    name: "SpiceRoute",
    slug: "spiceroute",
    tagline: "Where every plate tells a story",
    description: "Experience the finest fusion of Himalayan spices and global flavors.",
    address: "Thamel, Kathmandu",
    phone: "+977 980-1234567",
    image: "/food1.jpg",
    rating: 4.98,
    reviewCount: 1284,
    openingHours: "11:00 AM - 11:00 PM",
    menuItems: [
      { id: 1, category: "Starters", name: "Momo Platter", description: "Chicken, veg & buff momo with 3 sauces", price: 450, image: "https://picsum.photos/id/1080/600/400", isPopular: true, isVeg: false },
      { id: 2, category: "Main Course", name: "Butter Chicken", description: "Tender chicken in rich tomato gravy", price: 680, image: "https://picsum.photos/id/201/600/400", isPopular: true, isVeg: false },
    ]
  },
  {
    id: 9,
    name: "Kathmandu Kitchen",
    slug: "kathmandu-kitchen",
    tagline: "Modern Nepali Cuisine",
    description: "Contemporary twist on classic Nepali dishes.",
    address: "Pulchowk, Lalitpur",
    phone: "+977 980-8765432",
    image: "/food.jpg",
    rating: 4.92,
    reviewCount: 845,
    openingHours: "10:00 AM - 11:00 PM",
    menuItems: []
  }
];