import https from 'https';

const candidates = {
  cashews: [
    '1534422298391-e4f8c172dddb',
    '1608797178974-15b35a61d121',
    '1600189020840-e9218d6b5e0b',
    '1509070076587-91903e7fab91',
    '1599599810769-bcde5a160d32'
  ],
  wallet: [
    '1627124118303-624c8f94e224',
    '1590424753852-f77d337f6d4d',
    '1606513542400-9cc1fdf72518',
    '1568252542512-9fe8fe9c87bb'
  ],
  belt: [
    '1624222247344-550fb8ee8b66',
    '1614031679232-05e8b4e7a6ad',
    '1553062407-98eeb64c6a62',
    '1603561591411-07134e71a2a9'
  ],
  cap: [
    '1534215754734-18e55d13e348',
    '1588850561407-ed78c282e89b',
    '1521572267360-ee0c2909d518'
  ],
  scarf: [
    '1601924994987-69e26d50dc26',
    '1520903074187-fc68d02df372',
    '1584917865442-de89df76afd3'
  ]
};

function checkPhoto(id) {
  return new Promise((resolve) => {
    const url = `https://images.unsplash.com/photo-${id}?w=600&q=80`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ id, status: res.statusCode });
    });
    req.on('error', (err) => {
      resolve({ id, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  for (const [key, list] of Object.entries(candidates)) {
    console.log(`\nChecking candidates for ${key}:`);
    for (const id of list) {
      const info = await checkPhoto(id);
      console.log(`- ${id}: status = ${info.status}`);
    }
  }
}

run();
