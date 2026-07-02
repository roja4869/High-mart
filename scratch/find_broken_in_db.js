import { db } from '../backend/data/db.js';

const brokenUrlsList = [
  'https://images.unsplash.com/photo-1541140111954-75a9e3b08e2f?w=600&q=80',
  'https://images.unsplash.com/photo-1544224013-c3b8a1c3e4a2?w=600&q=80',
  'https://images.unsplash.com/photo-1574269661728-79659b722d56?w=600&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
  'https://images.unsplash.com/photo-1514989940723-e8e5163ccbe8?w=600&q=80',
  'https://images.unsplash.com/photo-1627124118303-624c8f94e224?w=600&q=80',
  'https://images.unsplash.com/photo-1582142407894-ec85a1268a4e?w=600&q=80'
];

async function run() {
  try {
    const res = await db.execute("SELECT id, name, image FROM products;");
    console.log(`Checking ${res.rows.length} products in DB...`);
    res.rows.forEach(p => {
      if (brokenUrlsList.includes(p.image) || !p.image || p.image === 'default_product.jpg' || !p.image.startsWith('http')) {
        console.log(`- DB Product ID: ${p.id}, Name: "${p.name}", Image: ${p.image}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
