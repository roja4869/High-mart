import { db } from './data/db.js';

async function run() {
  try {
    const res = await db.execute("SELECT * FROM category_relationships;");
    console.log("All relationships:");
    for (const row of res.rows) {
      console.log(`ID: ${row.id}, Parent: ${row.parent_id} (${row.parent_type}), Child: ${row.child_id} (${row.child_type})`);
    }
  } catch (err) {
    console.error("Error querying db:", err);
  }
}

run();
