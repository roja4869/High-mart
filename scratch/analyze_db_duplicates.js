import { db } from '../backend/data/db.js';

async function run() {
  try {
    const res = await db.execute("SELECT id, name, category_id, subcategory_id, image FROM products;");
    const products = res.rows;
    console.log(`Total products in database: ${products.length}`);
    
    const idMap = {};
    const nameMap = {};
    
    products.forEach(p => {
      idMap[p.id] = (idMap[p.id] || 0) + 1;
      nameMap[p.name] = (nameMap[p.name] || 0) + 1;
    });
    
    const duplicateIds = Object.entries(idMap).filter(([id, count]) => count > 1);
    const duplicateNames = Object.entries(nameMap).filter(([name, count]) => count > 1);
    
    console.log(`Duplicate IDs in DB: ${duplicateIds.length}`);
    duplicateIds.forEach(([id, count]) => console.log(`- ID: ${id}, Count: ${count}`));
    
    console.log(`Duplicate Names in DB: ${duplicateNames.length}`);
    duplicateNames.slice(0, 10).forEach(([name, count]) => console.log(`- Name: "${name}", Count: ${count}`));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
