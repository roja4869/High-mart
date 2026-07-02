import { products } from '../backend/data/mockDb.js';

const nameMap = {};
products.forEach(p => {
  nameMap[p.name] = nameMap[p.name] || [];
  nameMap[p.name].push(p.id);
});

const duplicates = Object.entries(nameMap).filter(([name, ids]) => ids.length > 1);
console.log(`Duplicate names in raw mockDb.js products: ${duplicates.length}`);
duplicates.forEach(([name, ids]) => {
  console.log(`- "${name}": IDs ${ids.join(', ')}`);
});
