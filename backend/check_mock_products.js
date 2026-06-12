import { products } from './data/mockDb.js';

console.log("Number of mock products in mockDb.js:", products.length);
console.log("First 5 mock product IDs in mockDb.js:", products.slice(0, 5).map(p => ({ id: p.id, name: p.name })));
console.log("Last 5 mock product IDs in mockDb.js:", products.slice(-5).map(p => ({ id: p.id, name: p.name })));
