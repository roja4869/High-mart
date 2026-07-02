import { products, FASHION_GENDER_IMAGE_MAP, PRODUCT_IMAGE_MAP } from '../backend/data/mockDb.js';
import https from 'https';

const allUrls = new Set();

products.forEach(p => {
  if (p.image) allUrls.add(p.image);
  if (p.images) p.images.forEach(img => allUrls.add(img));
});

Object.values(FASHION_GENDER_IMAGE_MAP).forEach(url => allUrls.add(url));
Object.values(PRODUCT_IMAGE_MAP).forEach(url => allUrls.add(url));

const urlList = [...allUrls].filter(url => url && url.startsWith('http'));

console.log(`Checking ${urlList.length} distinct image URLs...`);

function check(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  const results = [];
  // check in parallel batches of 10
  for (let i = 0; i < urlList.length; i += 10) {
    const batch = urlList.slice(i, i + 10);
    const batchRes = await Promise.all(batch.map(url => check(url)));
    results.push(...batchRes);
  }
  
  const broken = results.filter(r => r.status !== 200);
  console.log(`\nVerification complete. Found ${broken.length} broken/redirected URLs:`);
  broken.forEach(r => {
    console.log(`- Status ${r.status}: ${r.url}`);
  });
}

run();
