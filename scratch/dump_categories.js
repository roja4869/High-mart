import { db } from '../backend/data/db.js';

async function run() {
  try {
    const catsRes = await db.execute("SELECT * FROM categories;");
    console.log("=== CATEGORIES ===");
    console.table(catsRes.rows);

    const subcatsRes = await db.execute("SELECT id, category_id, name FROM subcategories;");
    console.log("\n=== SUBCATEGORIES ===");
    console.table(subcatsRes.rows);

    const relsRes = await db.execute("SELECT parent_id, child_id, parent_type, child_type FROM category_relationships;");
    console.log("\n=== RELATIONSHIPS ===");
    console.table(relsRes.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
