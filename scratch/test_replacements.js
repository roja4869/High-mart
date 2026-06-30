import https from 'https';

const candidates = {
  coffee_beans: [
    '1509042239860-f550ce710b93',
    '1514432324607-a09d9b4aefdd',
    '1497515114629-f71d768fd07c'
  ],
  maple_syrup: [
    '1589182373726-e4f658abde1f',
    '1608039829572-78524f79c4c7',
    '1584269600464-37b1b58a9fe7'
  ],
  action_figure: [
    '1608889175123-8ec330b86f84',
    '1566577134770-3d85bb3a9cc4',
    '1608889175280-57827e5e3a3e'
  ],
  train_set: [
    '1515488042361-404e92539b20',
    '1531746020798-e6953c6e8e04',
    '1587654780291-39c9404d746b'
  ],
  basketball: [
    '1546519638-68e109498ffc',
    '1519766304817-4f37bda74a27',
    '1508098682722-e99c43a406b2'
  ],
  formal_shoes: [
    '1600185365483-26d7a4cc7519',
    '1486308512493-ae6a7e9d3781',
    '1533867617858-e75581373295'
  ],
  sandals: [
    '1562273589-2ab214847b8a',
    '1621434533720-f59da39ffec9',
    '1603553329474-9549f3e49e29'
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
