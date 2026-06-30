import { db } from './data/db.js';

async function run() {
  try {
    const res = await db.execute("SELECT * FROM subcategories WHERE category_id = 2 AND id < 25;");
    console.log("Fashion subcategories (<25):", res.rows);
  } catch (err) {
    console.error("Error querying db:", err);
  }
}

run();
