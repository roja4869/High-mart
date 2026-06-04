import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { users, products, orders, inventoryLogs } from './mockDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log("Starting Turso Database Migration...");
  
  // Wait for 1 second to ensure that mockDb.js has finished seeding the in-memory array elements (since it hashes passwords asynchronously)
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // 1. Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Strip comment lines first, then split by semicolon
    const cleanSql = schemaSql
      .split('\n')
      .map(line => line.trim())
      .filter(line => !line.startsWith('--'))
      .join('\n');

    const queries = cleanSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log(`Executing ${queries.length} schema statements...`);
    
    // Run schema setup queries
    for (const query of queries) {
      await db.execute(query);
    }
    console.log("Database schema created successfully.");

    // Check if categories already exist (so we don't duplicate/re-seed on every run)
    const checkCats = await db.execute("SELECT COUNT(*) as count FROM categories");
    const catCount = checkCats.rows[0].count;

    if (catCount > 0) {
      console.log("Database already seeded. Skipping seeding step.");
      return;
    }

    console.log("Seeding initial database data...");

    // 2. Seed Categories
    const categoryNames = [...new Set(products.map(p => p.category))];
    const categoryMap = {};
    
    for (const catName of categoryNames) {
      const result = await db.execute({
        sql: "INSERT INTO categories (name, description) VALUES (?, ?) RETURNING id",
        args: [catName, `${catName} category products`]
      });
      const catId = result.rows[0].id;
      categoryMap[catName] = catId;
    }
    console.log(`Seeded ${categoryNames.length} categories.`);

    // 3. Seed Users (We use the actual data in users from mockDb.js)
    const userMap = {}; // mapping of old id -> new db id
    for (const u of users) {
      const result = await db.execute({
        sql: "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?) RETURNING id",
        args: [u.name, u.email, u.phone || null, u.password, u.role]
      });
      const userId = result.rows[0].id;
      userMap[u.id] = userId;
    }
    console.log(`Seeded ${users.length} users.`);

    // 4. Seed Products
    const productMap = {}; // mapping of old id -> new db id
    for (const p of products) {
      const catId = categoryMap[p.category] || null;
      const result = await db.execute({
        sql: "INSERT INTO products (id, name, description, price, category_id, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
        args: [p.id, p.name, p.description, p.price, catId, p.image, p.stock]
      });
      const prodId = result.rows[0].id;
      productMap[p.id] = prodId;
    }
    console.log(`Seeded ${products.length} products.`);

    // 5. Seed Orders, Order Items, and Payments
    for (const o of orders) {
      const dbUserId = userMap[o.userId] || o.userId;
      
      // Insert Order
      const orderResult = await db.execute({
        sql: `INSERT INTO orders (id, user_id, total_amount, shipping_address, status, payment_method, payment_status, transaction_id, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        args: [o.id, dbUserId, o.totalAmount, o.shippingAddress, o.status, o.paymentMethod, o.paymentStatus, o.transactionId, o.createdAt, o.createdAt]
      });
      const orderId = orderResult.rows[0].id;

      // Insert Order Items
      for (const item of o.items) {
        const dbProdId = productMap[item.productId] || item.productId;
        await db.execute({
          sql: `INSERT INTO order_items (order_id, product_id, name, price, image, quantity, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [orderId, dbProdId, item.name, item.price, item.image, item.quantity, o.createdAt]
        });
      }

      // Insert Payment record
      const paymentStatus = o.paymentStatus === 'Paid' ? 'Completed' : (o.paymentStatus === 'Failed' ? 'Failed' : 'Pending');
      await db.execute({
        sql: `INSERT INTO payments (order_id, user_id, amount, payment_method, status, transaction_id, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [orderId, dbUserId, o.totalAmount, o.paymentMethod, paymentStatus, o.transactionId, o.createdAt, o.createdAt]
      });
    }
    console.log(`Seeded ${orders.length} orders, order items, and payment transactions.`);

    // 6. Seed Reviews (adding some mock reviews for testing reviews functionality)
    const mockReviews = [
      { productId: 1, userId: 1, rating: 5, comment: "Absolutely love this coffee maker! Best purchase ever." },
      { productId: 2, userId: 1, rating: 4, comment: "Great noise cancelling. Battery life is amazing." },
      { productId: 4, userId: 1, rating: 5, comment: "Sturdy and keeps my water cold all day long." }
    ];

    for (const r of mockReviews) {
      const dbProdId = productMap[r.productId] || r.productId;
      const dbUserId = userMap[r.userId] || r.userId;
      await db.execute({
        sql: `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
        args: [dbProdId, dbUserId, r.rating, r.comment]
      });
    }
    console.log(`Seeded ${mockReviews.length} product reviews.`);

    // 7. Seed Inventory Logs
    for (const log of inventoryLogs) {
      const dbProdId = productMap[log.productId] || log.productId;
      await db.execute({
        sql: `INSERT INTO inventory_logs (product_id, product_name, activity_type, quantity_change, remaining_stock, performed_by, timestamp) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [dbProdId, log.productName, log.activityType, log.quantityChange, log.remainingStock, log.performedBy, log.timestamp]
      });
    }
    console.log(`Seeded ${inventoryLogs.length} inventory logs.`);

    console.log("Turso Database migration and seeding completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runMigration();
