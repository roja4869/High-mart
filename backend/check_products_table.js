import { db } from './data/db.js';

async function run() {
  try {
    const res = await db.execute(`
      SELECT p.category_id, c.name as cat_name, p.subcategory_id, s.name as sub_name, COUNT(*) as count 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      GROUP BY p.category_id, p.subcategory_id;
    `);
    console.log("Products grouped by category & subcategory:");
    console.log(res.rows);
  } catch (err) {
    console.error("Error querying product groups:", err);
  }
}

run();
