import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './data/db.js';

// Load environment variables
dotenv.config();

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// ES Module pathname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'High-Mart E-Commerce Platform Backend REST API is running.'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/categories', categoryRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const initializeTables = async () => {
  try {
    // 1. Create categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create subcategories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create category relationships table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS category_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER NOT NULL,
        child_id INTEGER NOT NULL,
        parent_type TEXT NOT NULL CHECK(parent_type IN ('category', 'subcategory')),
        child_type TEXT NOT NULL CHECK(child_type IN ('category', 'subcategory')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(parent_id, child_id, parent_type, child_type)
      )
    `);

    // 4. Add subcategory_id to products if not exists
    try {
      await db.execute("ALTER TABLE products ADD COLUMN subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL");
      await db.execute("CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id)");
      console.log("Added subcategory_id column and index to products table.");
    } catch (colError) {
      // Column already exists, safe to ignore
    }

    // 5. Add user transaction metadata columns to orders if not exists
    const orderCols = [
      { name: 'order_id', type: 'TEXT' },
      { name: 'customer_name', type: 'TEXT' },
      { name: 'customer_email', type: 'TEXT' },
      { name: 'customer_phone', type: 'TEXT' },
      { name: 'order_status', type: "TEXT DEFAULT 'Pending'" },
      { name: 'order_date', type: 'DATETIME' },
      { name: 'delivery_address', type: 'TEXT' }
    ];
    for (const col of orderCols) {
      try {
        await db.execute(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column ${col.name} to orders table.`);
      } catch (err) {
        // Column already exists, ignore
      }
    }

    // 6. Add product metadata columns to order_items if not exists
    const orderItemCols = [
      { name: 'product_name', type: 'TEXT' },
      { name: 'product_image', type: 'TEXT' }
    ];
    for (const col of orderItemCols) {
      try {
        await db.execute(`ALTER TABLE order_items ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column ${col.name} to order_items table.`);
      } catch (err) {
        // Column already exists, ignore
      }
    }

    console.log("Turso Category and Order tables verified/created successfully.");
  } catch (error) {
    console.error("Failed to automatically initialize database tables:", error.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await initializeTables();
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Trigger watch reload - fixed backend connection and verified syntax
