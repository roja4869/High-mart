import { db } from '../backend/data/db.js';
import { products as mockProducts } from '../backend/data/mockDb.js';

async function run() {
  try {
    const res = await db.execute("SELECT id, name FROM products;");
    const dbProducts = res.rows;
    
    const mockIds = new Set(mockProducts.map(p => p.id));
    const dbIds = new Set(dbProducts.map(p => p.id));
    
    console.log(`mockDb count: ${mockProducts.length}`);
    console.log(`db count: ${dbProducts.length}`);
    
    const inMockNotDb = mockProducts.filter(p => !dbIds.has(p.id));
    const inDbNotMock = dbProducts.filter(p => !mockIds.has(p.id));
    
    console.log(`In mockDb but not in DB count: ${inMockNotDb.length}`);
    inMockNotDb.forEach(p => console.log(`- ID: ${p.id}, Name: "${p.name}"`));
    
    console.log(`In DB but not in mockDb count: ${inDbNotMock.length}`);
    inDbNotMock.forEach(p => console.log(`- ID: ${p.id}, Name: "${p.name}"`));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
