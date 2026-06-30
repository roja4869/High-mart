import { db } from '../backend/data/db.js';

async function run() {
  try {
    const cats = await db.execute("SELECT * FROM categories;");
    console.log("Categories in DB:", cats.rows);

    const subcats = await db.execute("SELECT * FROM subcategories LIMIT 10;");
    console.log("Subcategories sample in DB:", subcats.rows);

    const prods = await db.execute("SELECT id, name, category_id, subcategory_id, image FROM products LIMIT 5;");
    console.log("Products sample in DB:", prods.rows);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
