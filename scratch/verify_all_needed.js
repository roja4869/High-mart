import https from 'https';

const candidates = {
  // Electronics
  speaker: '1608043152269-423dbba4e7e1',
  keyboard: '1587829741301-dc798b83add3',
  mouse: '1615663245857-ac93bb7c39e7',
  powerbank: '1609081219090-a6d81d3085bf',
  earbuds: '1590658268037-6bf12165a8df',
  monitor: '1527443224154-c4a3942d3acf',

  // Groceries
  coffee_beans: '1447041275666-b41d501d3772',
  honey: '1587049352846-4a222e784d38',
  tea_bags: '1576092768241-dec231879fc3',
  olive_oil: '1474979266404-7eaacbcd87c5',
  granola: '1509440159596-0249088772ff',
  maple_syrup: '1600189020840-e9218d6b5e0b',
  cashew: '1534422298391-e4f8c172dddb',

  // Home & Kitchen
  chair: '1505797149-43b0069ec26b',
  cookware: '1584269600464-37b1b58a9fe7',
  water_bottle: '1602143407151-7111542de6e8',
  desk_lamp: '1507473885765-e6ed057f782c',
  blender: '1578643463396-0997cb5328c1',
  air_fryer: '1621972750749-0fbb1abb7736',
  toaster: '1585238342024-78d387f4a707',

  // Beauty
  serum: '1620916566398-39f1143ab7be',
  cleanser: '1556228720-195a672e8a03',
  mask: '1608248597279-f99d160bfcbc',
  sunscreen: '1598440947619-2c35fc9aa908',
  shampoo: '1535585209827-a15fcdbc4c2d',
  lip_balm: '1617897903246-719242758050',

  // Toys
  board_game: '1610890716171-6b1bb98ffd09',
  action_figure: '1559884615-52d881691bb4',
  plush: '1559251606-c623743a6d76',
  model_kit: '1587654780291-39c9404d746b',
  card_game: '1611195974226-a6a9be9dd763',
  doll: '1596461404969-9ae70f2830c1',
  train_set: '1515488042361-404e92539b20',

  // Books
  ml_book: '1532012197267-da84d127e765',
  ds_book: '1544947950-fa07a98d237f',
  web_book: '1512820790803-83ca734da794',

  // Sports
  basketball: '1519766304817-4f37bda74a27',
  yoga_mat: '1592432678016-e910b452f9a2',
  racket: '1626224583764-f87db24ac4ea',
  dumbbell: '1517838277536-f5f99be501cd',
  punching_bag: '1599058917212-d750089bc07e',
  jump_rope: '1517838277536-f5f99be501cd',

  // Fashion Clothing
  men_shirt: '1598033129183-c4f50c736f10',
  men_jeans: '1541099649105-f69ad21f3246',
  men_trousers: '1624378439575-d8705ad7ae80',
  men_jacket: '1551028719-00167b16eac5',
  men_hoodie: '1620799140408-edc6dcb6d633',
  
  women_saree: '1610030469983-98e550d6193c',
  women_kurti: '1583391733956-3750e0ff4e8b',
  women_dress: '1494790108377-be9c29b29330',
  women_top: '1524504388940-b1c1722653e1',

  // Footwear
  sneakers: '1549298916-b41d501d3772',
  formal_shoes: '1533867617858-e75581373295',
  sandals: '1603553329474-9549f3e49e29',
  heels: '1595950653106-6c9ebd614d3a',
  flats: '1535043934128-cf0b28d52f95',

  // Accessories
  wallet: '1568252542512-9fe8fe9c87bb',
  belt: '1553062407-98eeb64c6a62',
  cap: '1588850561407-ed78c282e89b',
  hair_acc: '1522337360788-8b13dee7a37e',
  scarf: '1601924994987-69e26d50dc26'
};

function checkPhoto(key, id) {
  return new Promise((resolve) => {
    const url = `https://images.unsplash.com/photo-${id}?w=600&q=80`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ key, id, status: res.statusCode });
    });
    req.on('error', (err) => {
      resolve({ key, id, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  const list = Object.entries(candidates);
  console.log(`Checking ${list.length} candidate URLs...`);
  
  const results = [];
  // Run checks in chunks to prevent flooding
  for (let i = 0; i < list.length; i += 5) {
    const chunk = list.slice(i, i + 5);
    const chunkRes = await Promise.all(chunk.map(([key, id]) => checkPhoto(key, id)));
    results.push(...chunkRes);
  }

  const broken = results.filter(r => r.status !== 200);
  console.log(`\nChecked. Broken/Redirected: ${broken.length}`);
  if (broken.length > 0) {
    console.log(JSON.stringify(broken, null, 2));
  } else {
    console.log("All candidates returned 200 OK!");
  }
}

run();
