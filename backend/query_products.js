import { db } from './data/db.js';

async function run() {
  try {
    const res = await db.execute("SELECT id, name, image FROM products LIMIT 12;");
    console.log("Products in DB:");
    console.log(res.rows);
  } catch (err) {
    console.error("Error query products:", err);
  }
}

run();
