import { db } from './data/db.js';

async function run() {
  try {
    const res = await db.execute("SELECT id, name, category_id, subcategory_id FROM products WHERE id >= 140 AND id <= 160;");
    console.log("Products 140-160:", res.rows);
  } catch (err) {
    console.error("Error querying db:", err);
  }
}

run();
