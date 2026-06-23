import { db } from './data/db.js';

async function run() {
  try {
    const result = await db.execute({
      sql: `
        SELECT p.*, c.name as category,
               s1.name as s1_name,
               s2.name as s2_name,
               s3.name as s3_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s1 ON p.subcategory_id = s1.id
        LEFT JOIN category_relationships r1 ON s1.id = r1.child_id AND r1.parent_type = 'subcategory'
        LEFT JOIN subcategories s2 ON r1.parent_id = s2.id
        LEFT JOIN category_relationships r2 ON s2.id = r2.child_id AND r2.parent_type = 'subcategory'
        LEFT JOIN subcategories s3 ON r2.parent_id = s3.id
        LIMIT 1
      `,
      args: []
    });
    console.log("Returned row columns:", Object.keys(result.rows[0]));
    console.log("Returned row sample:", result.rows[0]);
  } catch (err) {
    console.error("Error querying db:", err);
  }
}

run();
