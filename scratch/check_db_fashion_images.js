import { db } from '../backend/data/db.js';

async function run() {
  try {
    const res = await db.execute(`
      SELECT p.id, p.name, p.gender, p.image, c.name as cat_name, s.name as subcat_name 
      FROM products p
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE c.name = 'Fashion';
    `);
    console.log(`Fashion products in DB: ${res.rows.length}`);
    res.rows.forEach(p => {
      console.log(`ID: ${p.id} | Name: "${p.name}" | Gender: ${p.gender} | Image: ${p.image}`);
    });
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
