import { db } from './data/db.js';

async function run() {
  try {
    const res = await db.execute("PRAGMA table_info(products);");
    console.log("products columns:", res.rows.map(r => `${r.name} (${r.type})`));
    
    const res2 = await db.execute("PRAGMA table_info(subcategories);");
    console.log("subcategories columns:", res2.rows.map(r => `${r.name} (${r.type})`));
  } catch (err) {
    console.error("Error querying db columns:", err);
  }
}

run();
