import { db } from './data/db.js';

async function run() {
  try {
    const info = await db.execute("PRAGMA table_info(category_relationships);");
    console.log("category_relationships columns:", info.rows.map(r => `${r.name} (${r.type})`));
    
    const res = await db.execute("SELECT * FROM category_relationships;");
    console.log("Relationships:", res.rows);
  } catch (err) {
    console.error("Error querying category_relationships:", err);
  }
}

run();
