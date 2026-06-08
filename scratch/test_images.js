import https from 'https';

const candidates = {
  cashews: [
    'photo-1599599810769-bcde5a160d32',
    'photo-1607604276583-eef5d076aa5f',
    'photo-1623428187969-5da2d877f157',
    'photo-1509070076587-91903e7fab91'
  ],
  wallet: [
    'photo-1627124118303-624c8f94e224',
    'photo-1590424753852-f77d337f6d4d',
    'photo-1606513542400-9cc1fdf72518'
  ],
  belt: [
    'photo-1624222247344-550fb8ee8b66',
    'photo-1614031679232-05e8b4e7a6ad',
    'photo-1553062407-98eeb64c6a62',
    'photo-1603561591411-07134e71a2a9'
  ],
  cap: [
    'photo-1534215754734-18e55d13e348',
    'photo-1588850561407-ed78c282e89b',
    'photo-1521572267360-ee0c2909d518'
  ],
  scarf: [
    'photo-1601924994987-69e26d50dc26',
    'photo-1520903074187-fc68d02df372',
    'photo-1584917865442-de89df76afd3'
  ]
};

function getPhotoStatus(id) {
  return new Promise((resolve) => {
    const url = `https://images.unsplash.com/photo-${id}?w=600&q=80`;
    https.get(url, (res) => {
      resolve({ id, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ id, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  for (const [key, ids] of Object.entries(candidates)) {
    console.log(`\nChecking resource URLs for: ${key}`);
    for (const id of ids) {
      const info = await getPhotoStatus(id);
      console.log(`- ${id}: Status=${info.status}`);
    }
  }
}

run();
