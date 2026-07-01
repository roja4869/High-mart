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
import supportRoutes from './routes/supportRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import sellerDashboardRoutes from './routes/sellerDashboardRoutes.js';
import adminSellerRequestsRoutes from './routes/adminSellerRequestsRoutes.js';

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
app.use('/api/support', supportRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin/sellers', sellerRoutes);
app.use('/api/seller', sellerDashboardRoutes);
app.use('/api/admin/seller-requests', adminSellerRequestsRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const initializeTables = async () => {
  try {
    // Enable foreign keys
    await db.execute("PRAGMA foreign_keys = ON;");
    console.log("Foreign key support enabled in SQLite/libSQL.");

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

    // 4.1 Add seller_id to products if not exists
    try {
      const tableInfo = await db.execute("PRAGMA table_info(products);");
      const columns = tableInfo.rows.map(row => row.name);
      if (!columns.includes('seller_id')) {
        console.log("Altering table 'products' to add column 'seller_id'...");
        await db.execute("ALTER TABLE products ADD COLUMN seller_id INTEGER REFERENCES sellers(id) ON DELETE SET NULL");
        await db.execute("CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id)");
        console.log("Added seller_id column and index to products table.");
      }
    } catch (colError) {
      console.error("Failed to alter products table to add seller_id:", colError.message);
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

    // 7. Create sellers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sellers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        businessName TEXT NOT NULL,
        gstNumber TEXT NOT NULL,
        panNumber TEXT NOT NULL,
        businessAddress TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        accountHolderName TEXT NOT NULL,
        bankName TEXT NOT NULL,
        accountNumber TEXT NOT NULL,
        ifscCode TEXT NOT NULL,
        upiId TEXT,
        gstCertificate TEXT,
        panCard TEXT,
        cancelledCheque TEXT,
        businessLicense TEXT,
        profilePhoto TEXT,
        status TEXT NOT NULL CHECK(status IN ('Pending Approval', 'Approved', 'Rejected', 'Pending')) DEFAULT 'Pending Approval',
        isApproved INTEGER NOT NULL DEFAULT 0,
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        approvedBy TEXT,
        approvedAt DATETIME,
        rejectedAt DATETIME,
        rejectionReason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Sellers table verified/created successfully.");

    // Alter table sellers to add approval metadata if not exists
    const sellerMetaCols = [
      { name: 'approvedBy', type: 'TEXT' },
      { name: 'approvedAt', type: 'DATETIME' },
      { name: 'rejectedAt', type: 'DATETIME' },
      { name: 'rejectionReason', type: 'TEXT' }
    ];
    for (const col of sellerMetaCols) {
      try {
        await db.execute(`ALTER TABLE sellers ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column ${col.name} to sellers table.`);
      } catch (err) {
        // Column already exists, ignore
      }
    }

    // Insert a test pending seller application if the table is currently empty
    const checkSellers = await db.execute("SELECT count(*) as count FROM sellers");
    if (checkSellers.rows[0].count === 0) {
      console.log("Inserting a mock pending seller application for testing...");
      try {
        await db.execute({
          sql: `INSERT INTO sellers (
                  fullName, email, phone, password, businessName, gstNumber, panNumber,
                  businessAddress, city, state, pincode, accountHolderName, bankName,
                  accountNumber, ifscCode, upiId, gstCertificate, panCard, cancelledCheque,
                  businessLicense, profilePhoto, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            "Ch.Dhanush",
            "dhanush2@gmail.com",
            "9876543210",
            "$2a$10$X877wK2N0b0R7gS987654.abcdefghijklmnopqrstu", // dummy bcrypt hash
            "dhanush pvt ltd",
            "29ABCDE1234F1Z5",
            "ABCDE1234F",
            "19-5-69, vivek nagar, hyderabad, Telangana",
            "hyderabad",
            "Telangana",
            "560001",
            "Dhanush Ch",
            "State Bank of India",
            "123456789012",
            "SBIN0001234",
            "dhanush@upi",
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80",
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80",
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80",
            null,
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80",
            "Pending"
          ]
        });
        console.log("Mock pending seller application inserted successfully.");
      } catch (err) {
        console.error("Failed to insert mock pending seller:", err.message);
      }
    }

    // Drop tables if legacy structure is detected
    try {
      const tableInfo = await db.execute("PRAGMA table_info(seller_requests);");
      const columns = tableInfo.rows.map(row => row.name);
      if (columns.length > 0 && !columns.includes('bank_account_number')) {
        console.log("Dropping legacy camelCase/old format seller tables...");
        await db.execute("DROP TABLE IF EXISTS seller_dashboard");
        await db.execute("DROP TABLE IF EXISTS sellers");
        await db.execute("DROP TABLE IF EXISTS seller_requests");
      }
    } catch (err) {
      console.log("No legacy seller tables found or unable to check.");
    }

    // 7.1 Create seller_requests table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS seller_requests (
        id TEXT PRIMARY KEY,
        seller_id TEXT UNIQUE,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        business_name TEXT NOT NULL,
        gst_number TEXT NOT NULL UNIQUE,
        pan_number TEXT NOT NULL UNIQUE,
        bank_account_number TEXT,
        ifsc_code TEXT,
        account_holder_name TEXT,
        branch_name TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        document_urls TEXT,
        status TEXT NOT NULL DEFAULT 'Pending',
        admin_remarks TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME,
        rejected_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        password TEXT
      )
    `);
    console.log("seller_requests table verified/created successfully.");

    // 7.2 Create sellers table (referencing seller_requests)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sellers (
        id TEXT PRIMARY KEY,
        seller_request_id TEXT,
        full_name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        business_name TEXT,
        gst_number TEXT UNIQUE,
        pan_number TEXT UNIQUE,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        branch_name TEXT,
        account_holder_name TEXT,
        bank_account_number TEXT,
        ifsc_code TEXT,
        profile_image TEXT,
        document_urls TEXT,
        status TEXT DEFAULT 'Approved',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        password TEXT,
        FOREIGN KEY (seller_request_id) REFERENCES seller_requests(id)
      )
    `);
    console.log("sellers table verified/created successfully.");

    // 7.3 Create seller_dashboard table (referencing sellers)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS seller_dashboard (
        id TEXT PRIMARY KEY,
        seller_id TEXT UNIQUE,
        total_products INTEGER DEFAULT 0,
        total_orders INTEGER DEFAULT 0,
        pending_orders INTEGER DEFAULT 0,
        completed_orders INTEGER DEFAULT 0,
        cancelled_orders INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        wallet_balance REAL DEFAULT 0,
        rating REAL DEFAULT 0,
        application_status TEXT DEFAULT 'Pending',
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES sellers(id)
      )
    `);
    console.log("seller_dashboard table verified/created successfully.");

    // 7.4 Create admin_users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password_hash TEXT,
        role TEXT DEFAULT 'Admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("admin_users table verified/created successfully.");

    console.log("Turso Category and Order tables verified/created successfully.");
  } catch (error) {
    console.error("Failed to automatically initialize database tables:", error.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, '127.0.0.1', async () => {
  await initializeTables();
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Trigger watch reload - fixed backend connection and verified syntax
