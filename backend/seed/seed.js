import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import bcrypt from "bcryptjs";

dotenv.config();

const categories = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    icon: "💻",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
    description: "Phones, laptops, audio and smart devices",
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Grocery",
    slug: "grocery",
    icon: "🛒",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    description: "Fresh produce, daily essentials, and pantry items",
    color: "#22c55e",
  },
  {
    id: 3,
    name: "Fashion",
    slug: "fashion",
    icon: "👗",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
    description: "Trending outfits and accessories",
    color: "#ec4899",
  },
  {
    id: 4,
    name: "Home",
    slug: "home",
    icon: "🏠",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80",
    description: "Essentials for modern living",
    color: "#f97316",
  },
  {
    id: 5,
    name: "Beauty",
    slug: "beauty",
    icon: "✨",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
    description: "Skincare, haircare, and beauty must-haves",
    color: "#a855f7",
  },
  {
    id: 6,
    name: "Sports",
    slug: "sports",
    icon: "🏋️",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
    description: "Performance gear and active lifestyle essentials",
    color: "#f97316",
  },
];

const products = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones",
    slug: "wireless-noise-cancelling-headphones",
    category: "electronics",
    price: 149.99,
    originalPrice: 199.99,
    discount: 25,
    rating: 4.6,
    reviewCount: 1203,
    stock: 34,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
    description: "Immersive audio, long battery life, and all-day comfort.",
    features: ["ANC", "Bluetooth 5.3", "30h battery"],
    brand: "SoundMax",
    tags: ["audio", "headphones"],
    isFeatured: true,
    isTrending: true,
  },
  {
    id: 2,
    name: "Fresh Organic Apples (1kg)",
    slug: "fresh-organic-apples",
    category: "grocery",
    price: 4.99,
    originalPrice: 6.99,
    discount: 28,
    rating: 4.8,
    reviewCount: 412,
    stock: 120,
    images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=800&q=80"],
    description: "Crisp, sweet, and locally sourced organic apples.",
    features: ["Organic", "Farm Fresh", "No pesticides"],
    brand: "NatureFarm",
    tags: ["fruits", "healthy", "organic"],
    isFeatured: true,
    isTrending: true,
  },
  {
    id: 3,
    name: "Premium Leather Crossbody Bag",
    slug: "premium-leather-crossbody",
    category: "fashion",
    price: 89.99,
    originalPrice: 120.0,
    discount: 25,
    rating: 4.5,
    reviewCount: 231,
    stock: 45,
    images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=80"],
    description: "Elegant leather bag perfect for everyday use or special occasions.",
    features: ["Genuine Leather", "Adjustable strap", "Multiple compartments"],
    brand: "ModeLine",
    tags: ["bag", "accessory", "leather"],
    isFeatured: true,
    isTrending: false,
  },
  {
    id: 4,
    name: "Ceramic Minimalist Vase",
    slug: "ceramic-minimalist-vase",
    category: "home",
    price: 24.5,
    originalPrice: 35.0,
    discount: 30,
    rating: 4.7,
    reviewCount: 89,
    stock: 60,
    images: ["https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&q=80"],
    description: "A beautiful, handcrafted vase to elevate your living room decor.",
    features: ["Handcrafted", "Matte finish", "Water-tight"],
    brand: "NordicNest",
    tags: ["decor", "vase", "ceramic"],
    isFeatured: false,
    isTrending: true,
  },
  {
    id: 5,
    name: "Vitamin C Brightening Serum",
    slug: "vitamin-c-brightening-serum",
    category: "beauty",
    price: 34.99,
    originalPrice: 45.0,
    discount: 22,
    rating: 4.9,
    reviewCount: 543,
    stock: 85,
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"],
    description: "Potent antioxidant serum for a radiant and glowing complexion.",
    features: ["15% Vitamin C", "Hyaluronic Acid", "Cruelty-free"],
    brand: "PureGlow",
    tags: ["skincare", "serum", "face"],
    isFeatured: true,
    isTrending: true,
  },
  {
    id: 6,
    name: "Artisan Sourdough Bread",
    slug: "artisan-sourdough-bread",
    category: "grocery",
    price: 6.5,
    originalPrice: 8.0,
    discount: 18,
    rating: 4.9,
    reviewCount: 220,
    stock: 20,
    images: ["https://images.unsplash.com/photo-1585478259715-876a6a81fa08?w=800&q=80"],
    description: "Freshly baked sourdough with a crispy crust and chewy interior.",
    features: ["Freshly baked", "No preservatives", "Vegan"],
    brand: "DailyBake",
    tags: ["bread", "bakery", "fresh"],
    isFeatured: false,
    isTrending: true,
  },
  {
    id: 7,
    name: "Smart 4K Ultra HD TV",
    slug: "smart-4k-ultra-hd-tv",
    category: "electronics",
    price: 399.99,
    originalPrice: 499.99,
    discount: 20,
    rating: 4.5,
    reviewCount: 154,
    stock: 12,
    images: ["https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80"],
    description: "Vibrant colors and immersive sound for the ultimate home theater.",
    features: ["4K HDR", "Smart OS", "Dolby Audio"],
    brand: "VisionPro",
    tags: ["tv", "smart home"],
    isFeatured: true,
    isTrending: false,
  },
  {
    id: 8,
    name: "Cozy Knit Sweater",
    slug: "cozy-knit-sweater",
    category: "fashion",
    price: 45.0,
    originalPrice: 60.0,
    discount: 25,
    rating: 4.6,
    reviewCount: 334,
    stock: 55,
    images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80"],
    description: "Warm, chunky knit sweater perfect for chilly evenings.",
    features: ["Cotton blend", "Oversized fit", "Machine wash"],
    brand: "ThreadCraft",
    tags: ["clothing", "winter", "sweater"],
    isFeatured: false,
    isTrending: true,
  },
  {
    id: 9,
    name: "Organic Honey Jar",
    slug: "organic-honey-jar",
    category: "grocery",
    price: 12.99,
    originalPrice: 15.99,
    discount: 18,
    rating: 4.8,
    reviewCount: 890,
    stock: 200,
    images: ["https://images.unsplash.com/photo-1587049352847-4d4b127a5524?w=800&q=80"],
    description: "Pure, raw, and unfiltered organic honey.",
    features: ["Raw", "Unfiltered", "Locally sourced"],
    brand: "NatureFarm",
    tags: ["honey", "organic", "pantry"],
    isFeatured: true,
    isTrending: true,
  },
  {
    id: 10,
    name: "Adjustable Dumbbell Set",
    slug: "adjustable-dumbbell-set",
    category: "sports",
    price: 129.99,
    originalPrice: 169.99,
    discount: 24,
    rating: 4.7,
    reviewCount: 504,
    stock: 22,
    images: ["https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80"],
    description: "Space-saving dumbbells for effective home workouts.",
    features: ["2.5-25kg range", "Quick-lock", "Compact stand"],
    brand: "IronCore",
    tags: ["gym", "strength", "sports"],
    isFeatured: true,
    isTrending: true,
  }
];



const users = [
  {
    id: 1,
    name: "Grostore Admin",
    email: "admin@grostore.com",
    password: "Admin@123",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Grostore+Admin&background=C47A5A&color=fff",
    joinedAt: "2026-01-01",
    isActive: true,
  },
  {
    id: 2,
    name: "Demo User",
    email: "user@grostore.com",
    password: "User@123",
    role: "user",
    avatar: "https://ui-avatars.com/api/?name=Demo+User&background=0ea5e9&color=fff",
    joinedAt: "2026-01-10",
    isActive: true,
  },
];

const seed = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";
  await connectDB(MONGO_URI);

  console.log("Clearing existing data...");
  await User.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Order.deleteMany({});

  console.log("Importing inline seed data...");

  // Insert users with hashed passwords and keep originalId
  const createdUsers = [];
  for (const u of users) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(u.password || "password", salt);
    const doc = await User.create({
      originalId: u.id,
      name: u.name,
      email: u.email,
      password: hashed,
      role: u.role || "user",
      avatar: u.avatar,
      phone: u.phone,
      address: u.address,
      joinedAt: u.joinedAt ? new Date(u.joinedAt) : new Date(),
      isActive: u.isActive ?? true,
    });
    createdUsers.push(doc);
  }

  // Insert categories
  const createdCategories = [];
  for (const c of categories) {
    const doc = await Category.create({
      originalId: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      image: c.image,
      productCount: c.productCount,
      description: c.description,
      color: c.color,
    });
    createdCategories.push(doc);
  }

  // Insert products
  const createdProducts = [];
  for (const p of products) {
    const doc = await Product.create({
      originalId: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discount,
      rating: p.rating,
      reviewCount: p.reviewCount,
      stock: p.stock,
      images: p.images,
      description: p.description,
      features: p.features,
      brand: p.brand,
      tags: p.tags,
      isFeatured: p.isFeatured,
      isTrending: p.isTrending,
    });
    createdProducts.push(doc);
  }

  // Start with a clean orders collection for a fresh demo state.
  await Order.deleteMany({});

  console.log("Seeding complete.");
  console.log("Admin login -> email: admin@grostore.com | password: Admin@123");
  console.log("User login  -> email: user@grostore.com  | password: User@123");
  process.exit();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
