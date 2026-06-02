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
  // Seed some initial orders for rich Reports & Order Management
  orders.push({
    id: 101,
    userId: 1, // Jane Doe
    items: [
      { productId: 1, name: "Premium Coffee Maker", price: 129.99, image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80", quantity: 1 }
    ],
    totalAmount: 129.99,
    shippingAddress: "123 Main St, New York, NY 10001",
    status: "Delivered",
    paymentMethod: "Stripe",
    paymentStatus: "Paid",
    transactionId: "ch_mock_1",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  });

  orders.push({
    id: 102,
    userId: 1,
    items: [
      { productId: 4, name: "Stainless Steel Water Bottle", price: 24.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", quantity: 2 }
    ],
    totalAmount: 49.98,
    shippingAddress: "123 Main St, New York, NY 10001",
    status: "Shipped",
    paymentMethod: "Razorpay",
    paymentStatus: "Paid",
    transactionId: "pay_mock_2",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  });

  orders.push({
    id: 103,
    userId: 1,
    items: [
      { productId: 3, name: "Ergonomic Office Chair", price: 249.99, image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=400&q=80", quantity: 1 },
      { productId: 4, name: "Stainless Steel Water Bottle", price: 24.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", quantity: 1 }
    ],
    totalAmount: 274.98,
    shippingAddress: "123 Main St, New York, NY 10001",
    status: "Pending",
    paymentMethod: "Stripe",
    paymentStatus: "Paid",
    transactionId: "ch_mock_3",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  });

  orders.push({
    id: 104,
    userId: 1,
    items: [
      { productId: 2, name: "Wireless Noise-Cancelling Headphones", price: 199.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", quantity: 1 }
    ],
    totalAmount: 199.99,
    shippingAddress: "456 Oak Rd, Los Angeles, CA 90001",
    status: "Processing",
    paymentMethod: "Stripe",
    paymentStatus: "Paid",
    transactionId: "ch_mock_4",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
  });

  orders.push({
    id: 105,
    userId: 1,
    items: [
      { productId: 5, name: "Ultra-Light Running Shoes", price: 89.99, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80", quantity: 1 }
    ],
    totalAmount: 89.99,
    shippingAddress: "123 Main St, New York, NY 10001",
    status: "Cancelled",
    paymentMethod: "Stripe",
    paymentStatus: "Failed",
    transactionId: "ch_mock_5",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
  });
};

initializeSeedUser().catch(err => {
  console.error("Failed to initialize mock database seed user:", err);
});
