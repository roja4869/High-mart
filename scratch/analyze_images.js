import { db } from '../backend/data/db.js';

async function run() {
  try {
    const res = await db.execute(`
      SELECT p.id, p.name, p.image, c.name as category 
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `);
    const products = res.rows;
    console.log(`Total products checked: ${products.length}`);

    const placeholderKeywords = ['default', 'placeholder', 'no-image', 'stock', 'unsplash'];
    
    let localImagesCount = 0;
    let externalImagesCount = 0;
    const details = {};

    products.forEach(p => {
      const isHttp = p.image.startsWith('http');
      if (isHttp) {
        externalImagesCount++;
      } else {
        localImagesCount++;
      }

      if (!details[p.category]) {
        details[p.category] = {
          total: 0,
          local: 0,
          external: 0,
          uniqueImages: new Set(),
          placeholders: 0
        };
      }

      const catInfo = details[p.category];
      catInfo.total++;
      if (isHttp) catInfo.external++;
      else catInfo.local++;
      catInfo.uniqueImages.add(p.image);

      const isPlaceholder = placeholderKeywords.some(kw => p.image.toLowerCase().includes(kw));
      if (isPlaceholder) {
        catInfo.placeholders++;
      }
    });

    console.log(`\n=== IMAGE STATISTICS BY CATEGORY ===`);
    for (const [catName, info] of Object.entries(details)) {
      console.log(`\nCategory: ${catName}`);
      console.log(`  Total Products: ${info.total}`);
      console.log(`  Local Image Paths (e.g. upload files): ${info.local}`);
      console.log(`  External URLs (e.g. Unsplash): ${info.external}`);
      console.log(`  Unique Images: ${info.uniqueImages.size}`);
      console.log(`  Placeholders / Unsplash: ${info.placeholders}`);
      console.log(`  Sample Images (first 3):`, Array.from(info.uniqueImages).slice(0, 3));
    }

    process.exit(0);
  } catch (err) {
    console.error("Error analyzing images:", err);
    process.exit(1);
  }
}
run();
