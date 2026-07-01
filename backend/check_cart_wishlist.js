import { db } from './data/db.js';

async function run() {
  try {
    const res = await db.execute("SELECT id, name FROM products WHERE id > 542;");
    console.log("Products with ID > 542 in DB:", res.rows);
  } catch (err) {
    console.error("Error querying db:", err);
  }
}

run();
