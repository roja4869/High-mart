import { db } from '../backend/data/db.js';

async function check() {
  try {
    const res = await db.execute("SELECT id, name, image, images FROM products WHERE name LIKE '%Puma RFID%' OR name LIKE '%Tommy Hilfiger Snapback%' OR name LIKE '%Levis Genuine Leather%';");
    console.log("Products found in Turso DB:", res.rows);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
check();
