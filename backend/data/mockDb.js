import bcrypt from 'bcryptjs';

// Pre-seeded products
export const products = [
  {
    id: 1,
    name: "Premium Coffee Maker",
    description: "Brew barista-quality espresso and drip coffee at home with this sleek stainless steel machine.",
    price: 129.99,
    category: "Appliances",
    image: "coffee_maker.jpg",
    stock: 15
  },
  {
    id: 2,
    name: "Wireless Noise-Cancelling Headphones",
    description: "Immerse yourself in rich, high-fidelity sound. Features active noise cancellation and 40-hour battery life.",
    price: 199.99,
    category: "Electronics",
    image: "headphones.jpg",
    stock: 25
  },
  {
    id: 3,
    name: "Ergonomic Office Chair",
    description: "Premium lumbar support, adjustable armrests, and high-density foam padding for long working hours.",
    price: 249.99,
    category: "Furniture",
    image: "office_chair.jpg",
    stock: 8
  },
  {
    id: 4,
    name: "Stainless Steel Water Bottle",
    description: "Double-walled vacuum insulated bottle that keeps beverages cold for 24 hours or hot for 12 hours.",
    price: 24.99,
    category: "Kitchenware",
    image: "water_bottle.jpg",
    stock: 50
  },
  {
    id: 5,
    name: "Ultra-Light Running Shoes",
    description: "Breathable mesh upper with high-rebound cushioning for maximum comfort during intense workouts.",
    price: 89.99,
    category: "Footwear",
    image: "running_shoes.jpg",
    stock: 12
  }
];

// In-memory tables
export const users = [];
export const carts = {}; // Map: userId -> Array of CartItems
export const orders = [];

// Initialize with a pre-seeded test user (password: password123)
const initializeSeedUser = async () => {
  const hashedPassword = await bcrypt.hash("password123", 10);
  users.push({
    id: 1,
    name: "Jane Doe",
    email: "jane@example.com",
    password: hashedPassword,
    role: "user"
  });
  
  // Seed an admin user (password: admin123)
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  users.push({
    id: 2,
    name: "Admin User",
    email: "admin@example.com",
    password: hashedAdminPassword,
    role: "admin"
  });
};

initializeSeedUser().catch(err => {
  console.error("Failed to initialize mock database seed user:", err);
});
