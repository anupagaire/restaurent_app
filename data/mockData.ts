// data/mockData.ts

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  cuisine: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  reviewCount: number;
  openingHours: string;
  deliveryTime: string;
  priceRange: string;
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

// ─────────────────────────────────────────────
// SHARED MENU BANKS
// ─────────────────────────────────────────────

const spicerouteMenu: MenuItem[] = [
  // Starters
  { id: 1,  category: "Starters",     name: "Momo Platter",          description: "Chicken, veg & buff momo served with 3 signature sauces",          price: 450,  image: "https://picsum.photos/id/1080/600/400", isPopular: true,  isVeg: false },
  { id: 2,  category: "Starters",     name: "Veg Spring Rolls",       description: "Crispy golden rolls stuffed with cabbage, carrot & noodles",        price: 320,  image: "https://picsum.photos/id/488/600/400",  isPopular: false, isVeg: true  },
  { id: 3,  category: "Starters",     name: "Chicken Chilli",         description: "Indo-Chinese style crispy chicken tossed in spicy chilli sauce",    price: 520,  image: "https://picsum.photos/id/431/600/400",  isPopular: true,  isVeg: false },
  { id: 4,  category: "Starters",     name: "Paneer Tikka",           description: "Marinated cottage cheese grilled in tandoor with bell peppers",     price: 480,  image: "https://picsum.photos/id/102/600/400",  isPopular: false, isVeg: true  },

  // Main Course
  { id: 5,  category: "Main Course",  name: "Butter Chicken",         description: "Tender chicken in rich, creamy tomato-butter gravy",               price: 680,  image: "https://picsum.photos/id/201/600/400",  isPopular: true,  isVeg: false },
  { id: 6,  category: "Main Course",  name: "Dal Makhani",            description: "Slow-cooked black lentils simmered overnight in butter & cream",    price: 420,  image: "https://picsum.photos/id/292/600/400",  isPopular: true,  isVeg: true  },
  { id: 7,  category: "Main Course",  name: "Lamb Rogan Josh",        description: "Kashmiri style slow-braised lamb with aromatic whole spices",       price: 780,  image: "https://picsum.photos/id/139/600/400",  isPopular: false, isVeg: false },
  { id: 8,  category: "Main Course",  name: "Palak Paneer",           description: "Cottage cheese cubes in silky spiced spinach gravy",                price: 440,  image: "https://picsum.photos/id/429/600/400",  isPopular: false, isVeg: true  },
  { id: 9,  category: "Main Course",  name: "Mutton Curry",           description: "Traditional Nepali style mutton in onion-tomato masala",            price: 720,  image: "https://picsum.photos/id/170/600/400",  isPopular: false, isVeg: false },

  // Rice & Bread
  { id: 10, category: "Rice & Bread", name: "Jeera Rice",             description: "Fragrant basmati rice tempered with cumin and ghee",               price: 180,  image: "https://picsum.photos/id/493/600/400",  isPopular: false, isVeg: true  },
  { id: 11, category: "Rice & Bread", name: "Garlic Naan",            description: "Soft leavened bread brushed with garlic butter, baked in tandoor",  price: 120,  image: "https://picsum.photos/id/1081/600/400", isPopular: true,  isVeg: true  },
  { id: 12, category: "Rice & Bread", name: "Chicken Biryani",        description: "Slow-cooked basmati rice layered with spiced chicken & saffron",    price: 650,  image: "https://picsum.photos/id/312/600/400",  isPopular: true,  isVeg: false },

  // Desserts
  { id: 13, category: "Desserts",     name: "Gulab Jamun",            description: "Soft milk-solid dumplings soaked in rose-flavored sugar syrup",     price: 180,  image: "https://picsum.photos/id/1060/600/400", isPopular: true,  isVeg: true  },
  { id: 14, category: "Desserts",     name: "Mango Kulfi",            description: "Traditional Indian ice cream made with condensed milk & real mango", price: 220,  image: "https://picsum.photos/id/102/600/400",  isPopular: false, isVeg: true  },

  // Drinks
  { id: 15, category: "Drinks",       name: "Mango Lassi",            description: "Thick chilled yogurt drink blended with fresh Alphonso mango",      price: 220,  image: "https://picsum.photos/id/1080/600/400", isPopular: true,  isVeg: true  },
  { id: 16, category: "Drinks",       name: "Masala Chai",            description: "Spiced milk tea brewed with ginger, cardamom & cinnamon",           price: 120,  image: "https://picsum.photos/id/225/600/400",  isPopular: false, isVeg: true  },
];

const himalayanMenu: MenuItem[] = [
  // Starters
  { id: 1,  category: "Starters",     name: "Veg Momo",               description: "Steamed dumplings with cabbage, carrot & cottage cheese filling",   price: 280,  image: "https://picsum.photos/id/1080/600/400", isPopular: true,  isVeg: true  },
  { id: 2,  category: "Starters",     name: "Buff Momo",              description: "Steamed dumplings with spiced water buffalo minced filling",         price: 320,  image: "https://picsum.photos/id/431/600/400",  isPopular: true,  isVeg: false },
  { id: 3,  category: "Starters",     name: "Aloo Sadeko",            description: "Spicy Nepali-style marinated potato salad with mustard oil",        price: 200,  image: "https://picsum.photos/id/429/600/400",  isPopular: false, isVeg: true  },
  { id: 4,  category: "Starters",     name: "Chicken Choila",         description: "Chargrilled spiced chicken with roasted mustard seed dressing",      price: 420,  image: "https://picsum.photos/id/139/600/400",  isPopular: true,  isVeg: false },

  // Main Course
  { id: 5,  category: "Main Course",  name: "Dal Bhat Set",           description: "Traditional Nepali thali — lentil soup, rice, vegetable curry, pickle", price: 520, image: "https://picsum.photos/id/292/600/400", isPopular: true, isVeg: true },
  { id: 6,  category: "Main Course",  name: "Dal Bhat with Chicken",  description: "Full Nepali thali with tender chicken curry & seasonal greens",     price: 620,  image: "https://picsum.photos/id/201/600/400",  isPopular: true,  isVeg: false },
  { id: 7,  category: "Main Course",  name: "Thukpa",                 description: "Tibetan noodle soup with vegetables in a warming broth",             price: 380,  image: "https://picsum.photos/id/312/600/400",  isPopular: false, isVeg: true  },
  { id: 8,  category: "Main Course",  name: "Chicken Thukpa",         description: "Hearty Tibetan noodle broth with shredded chicken & herbs",         price: 450,  image: "https://picsum.photos/id/170/600/400",  isPopular: false, isVeg: false },
  { id: 9,  category: "Main Course",  name: "Gundruk Ko Jhol",        description: "Fermented leafy greens soup — a Nepali comfort food classic",       price: 280,  image: "https://picsum.photos/id/493/600/400",  isPopular: false, isVeg: true  },

  // Snacks
  { id: 10, category: "Snacks",       name: "Sel Roti",               description: "Traditional Nepali ring-shaped sweet rice bread, fried crispy",     price: 150,  image: "https://picsum.photos/id/1060/600/400", isPopular: true,  isVeg: true  },
  { id: 11, category: "Snacks",       name: "Chatamari",              description: "Newari rice crepe topped with minced meat and egg",                  price: 320,  image: "https://picsum.photos/id/488/600/400",  isPopular: true,  isVeg: false },
  { id: 12, category: "Snacks",       name: "Veg Chatamari",          description: "Newari rice crepe with fresh vegetables and cheese topping",         price: 260,  image: "https://picsum.photos/id/102/600/400",  isPopular: false, isVeg: true  },

  // Desserts
  { id: 13, category: "Desserts",     name: "Juju Dhau",              description: "Famous Bhaktapur king curd — thick, creamy and mildly sweet",       price: 200,  image: "https://picsum.photos/id/1081/600/400", isPopular: true,  isVeg: true  },
  { id: 14, category: "Desserts",     name: "Yomari",                 description: "Steamed Newari sweet dumpling filled with chaku & sesame",           price: 180,  image: "https://picsum.photos/id/225/600/400",  isPopular: false, isVeg: true  },

  // Drinks
  { id: 15, category: "Drinks",       name: "Tongba",                 description: "Traditional Limbu millet beer served warm in a bamboo vessel",      price: 350,  image: "https://picsum.photos/id/1080/600/400", isPopular: true,  isVeg: true  },
  { id: 16, category: "Drinks",       name: "Masala Tea",             description: "Nepali spiced milk tea with cardamom, ginger & clove",              price: 100,  image: "https://picsum.photos/id/431/600/400",  isPopular: false, isVeg: true  },
];

const momoKingdomMenu: MenuItem[] = [
  // Steamed Momos
  { id: 1,  category: "Steamed Momos",  name: "Chicken Steam Momo",    description: "Classic juicy chicken dumplings with house dipping sauce",         price: 300,  image: "https://picsum.photos/id/1080/600/400", isPopular: true,  isVeg: false },
  { id: 2,  category: "Steamed Momos",  name: "Veg Steam Momo",        description: "Garden fresh vegetable dumplings, light and wholesome",             price: 240,  image: "https://picsum.photos/id/488/600/400",  isPopular: true,  isVeg: true  },
  { id: 3,  category: "Steamed Momos",  name: "Buff Steam Momo",       description: "Traditional buff minced momo — a Kathmandu street food staple",     price: 280,  image: "https://picsum.photos/id/431/600/400",  isPopular: true,  isVeg: false },
  { id: 4,  category: "Steamed Momos",  name: "Cheese Corn Momo",      description: "Gooey mozzarella & sweet corn filling in delicate steamed wrappers", price: 320, image: "https://picsum.photos/id/102/600/400",  isPopular: false, isVeg: true  },

  // Fried Momos
  { id: 5,  category: "Fried Momos",    name: "Chicken Fried Momo",    description: "Golden crispy deep-fried momo with tangy tomato chutney",           price: 340,  image: "https://picsum.photos/id/201/600/400",  isPopular: true,  isVeg: false },
  { id: 6,  category: "Fried Momos",    name: "Veg Fried Momo",        description: "Crispy vegetable momo, perfect with sesame dipping sauce",          price: 280,  image: "https://picsum.photos/id/292/600/400",  isPopular: false, isVeg: true  },
  { id: 7,  category: "Fried Momos",    name: "Paneer Fried Momo",     description: "Rich cottage cheese stuffed momo, pan-fried until golden",          price: 360,  image: "https://picsum.photos/id/429/600/400",  isPopular: false, isVeg: true  },

  // Special Momos
  { id: 8,  category: "Special Momos",  name: "C-Momo",                description: "Jhol momo — steamed dumplings drenched in spicy sesame broth",     price: 380,  image: "https://picsum.photos/id/170/600/400",  isPopular: true,  isVeg: false },
  { id: 9,  category: "Special Momos",  name: "Veg C-Momo",            description: "Veg jhol momo in rich achar broth with mustard & tomato",          price: 340,  image: "https://picsum.photos/id/493/600/400",  isPopular: false, isVeg: true  },
  { id: 10, category: "Special Momos",  name: "Kothey Momo",           description: "Pan-fried bottom, steamed top — crispy yet soft in one bite",      price: 360,  image: "https://picsum.photos/id/312/600/400",  isPopular: true,  isVeg: false },
  { id: 11, category: "Special Momos",  name: "Tandoori Momo",         description: "Marinated momo grilled in clay oven, served with mint chutney",     price: 420,  image: "https://picsum.photos/id/139/600/400",  isPopular: true,  isVeg: false },
  { id: 12, category: "Special Momos",  name: "Veg Tandoori Momo",     description: "Smoky tandoor-grilled paneer & veg momo with green chutney",       price: 380,  image: "https://picsum.photos/id/1060/600/400", isPopular: false, isVeg: true  },

  // Sides & Drinks
  { id: 13, category: "Sides & Drinks", name: "Achar Sauce (Extra)",   description: "Extra portion of our signature tomato-sesame dipping sauce",       price: 80,   image: "https://picsum.photos/id/1081/600/400", isPopular: false, isVeg: true  },
  { id: 14, category: "Sides & Drinks", name: "Mango Lassi",           description: "Chilled thick mango yogurt drink to cool you down",                 price: 220,  image: "https://picsum.photos/id/225/600/400",  isPopular: true,  isVeg: true  },
  { id: 15, category: "Sides & Drinks", name: "Lemon Soda",            description: "Fresh lemon with soda, mint and a pinch of black salt",             price: 150,  image: "https://picsum.photos/id/1080/600/400", isPopular: false, isVeg: true  },
];

const royalSpiceMenu: MenuItem[] = [
  // Appetizers
  { id: 1,  category: "Appetizers",   name: "Royal Kebab Platter",    description: "Assorted seekh, tikka & reshmi kebabs with mint chutney",           price: 880,  image: "https://picsum.photos/id/431/600/400",  isPopular: true,  isVeg: false },
  { id: 2,  category: "Appetizers",   name: "Paneer Shashlik",        description: "Skewered marinated paneer & peppers grilled over charcoal",         price: 620,  image: "https://picsum.photos/id/102/600/400",  isPopular: false, isVeg: true  },
  { id: 3,  category: "Appetizers",   name: "Prawn Koliwada",         description: "Crispy battered prawns seasoned with coastal Indian spices",         price: 780,  image: "https://picsum.photos/id/488/600/400",  isPopular: true,  isVeg: false },
  { id: 4,  category: "Appetizers",   name: "Dahi Ke Sholay",         description: "Fried bread rolls stuffed with spiced hung curd & dry fruits",      price: 480,  image: "https://picsum.photos/id/1080/600/400", isPopular: false, isVeg: true  },

  // Signature Mains
  { id: 5,  category: "Signature Mains", name: "Royal Laal Maas",     description: "Rajasthani slow-braised mutton in fiery red chilli gravy",          price: 980,  image: "https://picsum.photos/id/139/600/400",  isPopular: true,  isVeg: false },
  { id: 6,  category: "Signature Mains", name: "Murgh Nawabi",        description: "Whole leg chicken braised in saffron & royal spice masala",         price: 880,  image: "https://picsum.photos/id/201/600/400",  isPopular: true,  isVeg: false },
  { id: 7,  category: "Signature Mains", name: "Paneer Lababdar",     description: "Paneer in velvety onion-tomato-cream gravy with dried fenugreek",   price: 620,  image: "https://picsum.photos/id/429/600/400",  isPopular: false, isVeg: true  },
  { id: 8,  category: "Signature Mains", name: "Subz Miloni",         description: "Seasonal vegetables in a rich cashew & poppy seed gravy",           price: 540,  image: "https://picsum.photos/id/292/600/400",  isPopular: false, isVeg: true  },

  // Biryani
  { id: 9,  category: "Biryani",      name: "Royal Mutton Biryani",   description: "Dum-cooked saffron basmati with tender mutton & crispy onions",     price: 980,  image: "https://picsum.photos/id/312/600/400",  isPopular: true,  isVeg: false },
  { id: 10, category: "Biryani",      name: "Veg Dum Biryani",        description: "Fragrant dum biryani with seasonal veg, nuts & caramelized onion",  price: 680,  image: "https://picsum.photos/id/493/600/400",  isPopular: false, isVeg: true  },

  // Breads
  { id: 11, category: "Breads",       name: "Roomali Roti",           description: "Paper-thin handkerchief bread cooked on inverted griddle",          price: 100,  image: "https://picsum.photos/id/170/600/400",  isPopular: false, isVeg: true  },
  { id: 12, category: "Breads",       name: "Stuffed Naan",           description: "Tandoor naan filled with spiced potato and paneer",                  price: 180,  image: "https://picsum.photos/id/1081/600/400", isPopular: true,  isVeg: true  },

  // Desserts
  { id: 13, category: "Desserts",     name: "Shahi Tukda",            description: "Fried bread pudding soaked in saffron rabdi & garnished with silver", price: 320, image: "https://picsum.photos/id/1060/600/400", isPopular: true, isVeg: true  },
  { id: 14, category: "Desserts",     name: "Rasmalai",               description: "Soft cottage cheese patties in chilled cardamom-scented cream",      price: 280,  image: "https://picsum.photos/id/225/600/400",  isPopular: false, isVeg: true  },

  // Drinks
  { id: 15, category: "Drinks",       name: "Royal Rose Lassi",       description: "Thick yogurt drink with rose syrup, cardamom & pistachio",          price: 280,  image: "https://picsum.photos/id/1080/600/400", isPopular: true,  isVeg: true  },
  { id: 16, category: "Drinks",       name: "Fresh Lime Soda",        description: "Zesty freshly squeezed lime with sparkling water & black salt",      price: 180,  image: "https://picsum.photos/id/431/600/400",  isPopular: false, isVeg: true  },
];

const kathmanduKitchenMenu: MenuItem[] = [
  // Small Plates
  { id: 1,  category: "Small Plates", name: "Newari Sampler",          description: "Chiura, saag, achar, bara & kwati — a Newari feast in miniature",  price: 580,  image: "https://picsum.photos/id/488/600/400",  isPopular: true,  isVeg: false },
  { id: 2,  category: "Small Plates", name: "Veg Bara",                description: "Crispy lentil patties — the Newari black lentil street classic",    price: 260,  image: "https://picsum.photos/id/102/600/400",  isPopular: true,  isVeg: true  },
  { id: 3,  category: "Small Plates", name: "Egg Bara",                description: "Golden lentil patties topped with fried egg & spiced onion",        price: 300,  image: "https://picsum.photos/id/1080/600/400", isPopular: false, isVeg: false },
  { id: 4,  category: "Small Plates", name: "Sandheko Momo",           description: "Cold spicy momo salad tossed in sesame-chilli-lemon dressing",      price: 360,  image: "https://picsum.photos/id/431/600/400",  isPopular: true,  isVeg: false },

  // Mains
  { id: 5,  category: "Mains",        name: "Contemporary Dal Bhat",   description: "Modern plating of classic thali with three rotating curries",        price: 680,  image: "https://picsum.photos/id/292/600/400",  isPopular: true,  isVeg: true  },
  { id: 6,  category: "Mains",        name: "Grilled Chicken Khana",   description: "Herb-marinated grilled chicken with mountain herb rice & raita",    price: 780,  image: "https://picsum.photos/id/201/600/400",  isPopular: true,  isVeg: false },
  { id: 7,  category: "Mains",        name: "Buckwheat Pasta",         description: "Kathmandu twist — local buckwheat pasta in tomato-herb sauce",      price: 580,  image: "https://picsum.photos/id/429/600/400",  isPopular: false, isVeg: true  },
  { id: 8,  category: "Mains",        name: "Lamb Sekuwa Plate",       description: "Chargrilled Nepali spiced lamb skewers with garlic bread & salad",  price: 880,  image: "https://picsum.photos/id/139/600/400",  isPopular: false, isVeg: false },

  // Bowls
  { id: 9,  category: "Bowls",        name: "Grain Buddha Bowl",       description: "Quinoa, roasted veg, poached egg, avocado & miso tahini",           price: 620,  image: "https://picsum.photos/id/312/600/400",  isPopular: false, isVeg: true  },
  { id: 10, category: "Bowls",        name: "Chicken Rice Bowl",       description: "Hainanese-style poached chicken over jasmine rice & ginger broth",  price: 680,  image: "https://picsum.photos/id/170/600/400",  isPopular: true,  isVeg: false },

  // Desserts
  { id: 11, category: "Desserts",     name: "Sikarni",                 description: "Strained yogurt dessert with saffron, pistachios & cardamom",       price: 280,  image: "https://picsum.photos/id/1060/600/400", isPopular: true,  isVeg: true  },
  { id: 12, category: "Desserts",     name: "Chocolate Kwati Brownie", description: "Dense brownie made with sprouted bean flour — uniquely Nepali",     price: 320,  image: "https://picsum.photos/id/493/600/400",  isPopular: false, isVeg: true  },

  // Drinks
  { id: 13, category: "Drinks",       name: "Himalayan Mint Cooler",   description: "Chilled lemon-mint agua fresca with Himalayan pink salt",           price: 200,  image: "https://picsum.photos/id/225/600/400",  isPopular: true,  isVeg: true  },
  { id: 14, category: "Drinks",       name: "Cold Brew Coffee",        description: "18-hour cold brewed with high-altitude Nepali arabica beans",        price: 280,  image: "https://picsum.photos/id/1081/600/400", isPopular: false, isVeg: true  },
];

// ─────────────────────────────────────────────
// RESTAURANTS
// ─────────────────────────────────────────────

export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "SpiceRoute",
    slug: "spiceroute",
    cuisine: "Indian Fusion",
    tagline: "Where every plate tells a story",
    description: "Experience the finest fusion of Himalayan spices and global flavors in the heart of Thamel.",
    address: "Thamel, Kathmandu",
    phone: "+977 980-1234567",
    image: "/food.jpg",
    rating: 4.98,
    reviewCount: 1284,
    openingHours: "11:00 AM – 11:00 PM",
    deliveryTime: "25–35 min",
    priceRange: "$$",
    menuItems: spicerouteMenu,
  },
  {
    id: 2,
    name: "Himalayan Flavors",
    slug: "himalayan-flavors",
    cuisine: "Nepali & Tibetan",
    tagline: "Taste of the Mountains",
    description: "Authentic Nepali and Tibetan cuisine crafted with fresh local ingredients and age-old recipes.",
    address: "Lazimpat, Kathmandu",
    phone: "+977 981-2345678",
    image: "/food11.jpg",
    rating: 4.85,
    reviewCount: 932,
    openingHours: "10:00 AM – 10:00 PM",
    deliveryTime: "20–30 min",
    priceRange: "$",
    menuItems: himalayanMenu,
  },
  {
    id: 3,
    name: "Momo Kingdom",
    slug: "momo-kingdom",
    cuisine: "Momo Specialist",
    tagline: "Momo Lovers Paradise",
    description: "Kathmandu's most beloved momo destination — steamed, fried, jhol, tandoori and beyond.",
    address: "Boudha, Kathmandu",
    phone: "+977 986-1234567",
    image: "/food1.jpg",
    rating: 4.9,
    reviewCount: 2140,
    openingHours: "12:00 PM – 10:00 PM",
    deliveryTime: "15–25 min",
    priceRange: "$",
    menuItems: momoKingdomMenu,
  },
  {
    id: 4,
    name: "The Royal Spice",
    slug: "royal-spice",
    cuisine: "Fine Dining Indian",
    tagline: "Royal Taste Since 2018",
    description: "Fine dining experience with regal Mughlai and North Indian recipes passed down through generations.",
    address: "Jhamsikhel, Lalitpur",
    phone: "+977 984-1122334",
    image: "/food.jpg",
    rating: 4.75,
    reviewCount: 678,
    openingHours: "11:30 AM – 10:30 PM",
    deliveryTime: "30–45 min",
    priceRange: "$$$",
    menuItems: royalSpiceMenu,
  },
  {
    id: 5,
    name: "Kathmandu Kitchen",
    slug: "kathmandu-kitchen",
    cuisine: "Modern Nepali",
    tagline: "Modern Nepali Cuisine",
    description: "A contemporary twist on classic Nepali dishes — where heritage meets innovation.",
    address: "Pulchowk, Lalitpur",
    phone: "+977 980-8765432",
    image: "/food11.jpg",
    rating: 4.92,
    reviewCount: 845,
    openingHours: "10:00 AM – 11:00 PM",
    deliveryTime: "20–35 min",
    priceRange: "$$",
    menuItems: kathmanduKitchenMenu,
  },
];