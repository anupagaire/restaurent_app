// src/data/mockData.js
export const restaurantInfo = {
  name: "SpiceRoute",
  tagline: "Where every plate tells a story",
  description: "Experience the finest fusion of Himalayan spices and global flavors.",
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
    description: "Steamed dumplings with chicken, veg & buff filling + three sauces",
    price: 450,
    image: "https://picsum.photos/id/1080/600/400",
    isPopular: true,
    isVeg: false,
  },
  {
    id: 2,
    category: "Main Course",
    name: "Butter Chicken",
    description: "Tender chicken in rich tomato & butter gravy with aromatic spices",
    price: 680,
    image: "https://picsum.photos/id/201/600/400",
    isPopular: true,
    isVeg: false,
  },
  {
    id: 3,
    category: "Main Course",
    name: "Dal Makhani",
    description: "Black lentils slow-cooked with cream and butter",
    price: 420,
    image: "https://picsum.photos/id/292/600/400",
    isPopular: false,
    isVeg: true,
  },
  {
    id: 4,
    category: "Noodles & Rice",
    name: "Himalayan Thukpa",
    description: "Spicy noodle soup with vegetables and choice of protein",
    price: 380,
    image: "https://picsum.photos/id/431/600/400",
    isPopular: true,
    isVeg: false,
  },
  {
    id: 5,
    category: "Desserts",
    name: "Gulab Jamun with Ice Cream",
    description: "Warm gulab jamun served with vanilla ice cream",
    price: 280,
    image: "https://picsum.photos/id/1083/600/400",
    isPopular: false,
    isVeg: true,
  },
];

export const galleryImages = [
  "https://picsum.photos/id/1015/800/600",
  "https://picsum.photos/id/133/800/600",
  "https://picsum.photos/id/201/800/600",
  "https://picsum.photos/id/292/800/600",
  "https://picsum.photos/id/431/800/600",
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