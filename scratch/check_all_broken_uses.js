import fs from 'fs';
import path from 'path';

const mockDbPath = 'backend/data/mockDb.js';
const content = fs.readFileSync(mockDbPath, 'utf8');

const brokenIds = [
  '1541140111954',
  '1544224013',
  '1574269661728',
  '1508098682722',
  '1514989940723',
  '1627124118303',
  '1582142407894'
];

console.log("Searching for broken photo IDs in mockDb.js...");
brokenIds.forEach(id => {
  const regex = new RegExp(id, 'g');
  const matches = content.match(regex);
  console.log(`ID: ${id} -> Found ${matches ? matches.length : 0} times`);
});
