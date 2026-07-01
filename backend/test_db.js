import { db } from './data/db.js';

async function testConnection() {
  console.log("Testing database connection to Turso...");
  try {
    const res = await db.execute("SELECT 1;");
    console.log("Connection successful! Query result:", res.rows);
  } catch (err) {
    console.error("Database connection failed:", err.message);
    console.error(err);
  }
}

testConnection();
