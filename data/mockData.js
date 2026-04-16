// data/mockData.ts
export const restaurantInfo = {
  name: "SpiceRoute",
  tagline: "Where every plate tells a story",
  description: "Experience the finest fusion of Himalayan spices and global flavors in the heart of Kathmandu. Fresh ingredients, authentic recipes, and unforgettable dining.",
  address: "Thamel, Kathmandu, Nepal",
  phone: "+977 980-1234567",
  email: "hello@spiceroute.com",
  rating: 4.98,
  reviewCount: 1284,
  openingHours: "11:00 AM - 11:00 PM",
};

export const menuCategories = [
  { id: 1, name: "Starters", icon: "🥟" },
  { id: 2, name: "Main Course", icon: "🍛" },
  { id: 3, name: "Noodles & Rice", icon: "🍜" },
  { id: 4, name: "Desserts", icon: "🍮" },
  { id: 5, name: "Beverages", icon: "🥤" },
];

export const menuItems = [
  {
    id: 1,
    category: "Starters",
    name: "Momo Platter",
    description: "Steamed dumplings with chicken, veg & buff filling served with three signature sauces",
    price: 450,
    image: "https://picsum.photos/id/1080/600/400",
    isPopular: true,
    isVeg: false,
  },
  {
    id: 2,
    category: "Main Course",
    name: "Butter Chicken",
    description: "Tender chicken simmered in rich tomato, butter and aromatic spice gravy",
    price: 680,
    image: "https://picsum.photos/id/201/600/400",
    isPopular: true,
    isVeg: false,
  },
  // ... you can keep the rest
];

export const testimonials = [
  {
    name: "Ramesh Shrestha",
    role: "Food Blogger",
    text: "Best Butter Chicken I've had in Nepal. The ambiance is incredible!",
    rating: 5,
  },
  {
    name: "Priya Lama",
    role: "Regular Customer",
    text: "Their Momo platter is addictive. Highly recommend for family dinners.",
    rating: 5,
  },
];