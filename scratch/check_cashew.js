import { db } from '../backend/data/db.js';

async function check() {
  try {
    const res = await db.execute("SELECT id, name, image, images FROM products WHERE name LIKE '%Cashew%';");
    console.log("Cashews found:", res.rows);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
check();
