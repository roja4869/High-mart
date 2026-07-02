import https from 'https';

const urls = [
  'https://images.unsplash.com/photo-1624222247344-550fb8ec5b5d?w=600&q=80',
  'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&q=80',
  'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80'
];

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
  for (const url of urls) {
    const res = await check(url);
    console.log(`${res.url} -> ${res.status}`);
  }
}
run();
