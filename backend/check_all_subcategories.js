import { db } from './data/db.js';

async function run() {
  try {
    const res = await db.execute("SELECT * FROM subcategories;");
    console.log("All subcategories in DB:");
    for (const row of res.rows) {
      console.log(`ID: ${row.id}, Category ID: ${row.category_id}, Name: '${row.name}', Desc: '${row.description}'`);
    }
  } catch (err) {
    console.error("Error querying db:", err);
  }
}

run();
