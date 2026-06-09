import https from 'https';
import { db } from '../backend/data/db.js';

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url.startsWith('http')) {
      resolve({ url, status: 'LOCAL' });
      return;
    }
    
    // Parse URL to handle timeouts
    const options = {
      method: 'HEAD',
      timeout: 5000
    };
    
    const req = https.request(url, options, (res) => {
      resolve({ url, status: res.statusCode });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 'TIMEOUT' });
    });
    
    req.on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message });
    });
    
    req.end();
  });
}

async function run() {
  try {
    const res = await db.execute("SELECT id, name, image, category_id FROM products;");
    const products = res.rows;
    console.log(`Total products fetched from database: ${products.length}`);
    
    const uniqueImages = [...new Set(products.map(p => p.image))];
    console.log(`Checking ${uniqueImages.length} unique image URLs...`);
    
    const results = [];
    // Check in batches of 10 to avoid overwhelming network / hitting rate limits
    const batchSize = 10;
    for (let i = 0; i < uniqueImages.length; i += batchSize) {
      const batch = uniqueImages.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(url => checkUrl(url)));
      results.push(...batchResults);
      console.log(`Progress: checked ${results.length}/${uniqueImages.length} images...`);
    }
    
    const statusMap = {};
    results.forEach(r => {
      statusMap[r.url] = r.status;
    });
    
    let brokenCount = 0;
    const brokenList = [];
    
    products.forEach(p => {
      const status = statusMap[p.image];
      if (status !== 200 && status !== 'LOCAL') {
        brokenCount++;
        brokenList.push({
          id: p.id,
          name: p.name,
          image: p.image,
          status: status
        });
      }
    });
    
    console.log(`\n=== IMAGE SCAN RESULTS ===`);
    console.log(`Total broken product assignments found: ${brokenCount}`);
    if (brokenCount > 0) {
      console.log("Broken products:");
      brokenList.forEach(item => {
        console.log(`  * ID ${item.id} | ${item.name} | Status: ${item.status} | URL: ${item.image}`);
      });
    } else {
      console.log("All image URLs returned 200 OK!");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error running image scan:", err);
    process.exit(1);
  }
}
run();
