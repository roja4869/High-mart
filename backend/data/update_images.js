import { db } from './db.js';

const PRODUCT_IMAGE_MAP = {
  // Electronics
  'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  'Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
  'Keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
  'Mouse': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80',
  'Powerbank': 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&q=80',
  'Earbuds': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
  'Smartwatch': 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&q=80',
  'Monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',

  // Groceries
  'Almonds': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80',
  'Oats': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80',
  'Coffee Beans': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
  'Honey': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',
  'Tea Bags': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80',
  'Olive Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
  'Granola': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  'Maple Syrup': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&q=80',
  'Cashew': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&q=80',

  // Home & Kitchen
  'Office Chair': 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&q=80',
  'Rice Cooker': 'https://images.unsplash.com/photo-1596306499317-8490232098fa?w=600&q=80',
  'Cookware Set': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80',
  'Water Bottle': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
  'Desk Lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
  'Blender': 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&q=80',
  'Air Fryer': 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=600&q=80',
  'Toaster': 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&q=80',

  // Beauty
  'Lotion': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
  'Serum': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
  'Cleanser': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
  'Face Mask': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80',
  'Sunscreen': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80',
  'Shampoo': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80',
  'Conditioner': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80',
  'Lip Balm': 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&q=80',

  // Toys
  'Brick Builder': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
  'Board Game': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&q=80',
  'Action Figure': 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=600&q=80',
  'Plush Toy': 'https://images.unsplash.com/photo-1559251606-c623743a6d76?w=600&q=80',
  'Model Kit': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
  'Card Game': 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=600&q=80',
  'Doll': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80',
  'Train Set': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',

  // Books
  'Python Programming': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80',
  'Machine Learning': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80',
  'Algorithms': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
  'Data Science': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
  'Software Engineering': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
  'Web Development': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
  'Database Systems': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
  'System Architecture': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80',

  // Sports
  'Soccer Ball': 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=600&q=80',
  'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
  'Yoga Mat': 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80',
  'Tennis Racket': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80',
  'Dumbbell Set': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80',
  'Fitness Band': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80',
  'Punching Bag': 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80',
  'Jump Rope': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80',

  // Fashion Clothing
  'T-Shirt': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
  'Shirt': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80',
  'Jeans': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
  'Trousers': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
  'Jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
  'Hoodie': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
  'Saree': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
  'Kurti': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
  'Dress': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
  'Top': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
  'Boys Wear': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80',
  'Girls Wear': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80',
  'School Uniform': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80',
  'Party Wear': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80',

  // Footwear
  'Sports Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'Sneakers': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
  'Formal Shoes': 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',
  'Sandals': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
  'Heels': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
  'Flats': 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80',
  'School Shoes': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80',
  'Casual Shoes': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',

  // Eyewear
  'Sunglasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
  'Reading Glasses': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
  'Computer Glasses': 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80',
  'Fashion Glasses': 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80',
  'Protective Glasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',

  // Watches
  'Analog Watch': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
  'Chronograph Watch': 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80',
  'Smart Watch': 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&q=80',

  // Bags
  'Backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  'Handbag': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
  'Tote Bag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  'Duffle Bag': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  'Sling Bag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',

  // Accessories
  'Belt': 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80',
  'Cap': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
  'Wallet': 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&q=80',
  'Jewellery': 'https://images.unsplash.com/photo-1618403088890-3d9ff6f4c8b1?w=600&q=80',
  'Hair Accessories': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
  'Scarf': 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80'
};

const replacements = {
  'https://images.unsplash.com/photo-1541140111954-75a9e3b08e2f?w=600&q=80': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80',
  'https://images.unsplash.com/photo-1544224013-c3b8a1c3e4a2?w=600&q=80': 'https://images.unsplash.com/photo-1596306499317-8490232098fa?w=600&q=80',
  'https://images.unsplash.com/photo-1574269661728-79659b722d56?w=600&q=80': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80': 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=600&q=80',
  'https://images.unsplash.com/photo-1514989940723-e8e5163ccbe8?w=600&q=80': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80',
  'https://images.unsplash.com/photo-1627124118303-624c8f94e224?w=600&q=80': 'https://images.unsplash.com/photo-1618403088890-3d9ff6f4c8b1?w=600&q=80',
  'https://images.unsplash.com/photo-1582142407894-ec85a1268a4e?w=600&q=80': 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80'
};

async function run() {
  try {
    console.log("Starting database image URL updates for all products...");
    
    // Fetch all products with their category names to filter/identify Fashion products
    const res = await db.execute(
      "SELECT p.id, p.name, p.image, p.images, c.name as category_name " +
      "FROM products p " +
      "LEFT JOIN subcategories s ON p.subcategory_id = s.id " +
      "LEFT JOIN categories c ON s.category_id = c.id;"
    );
    const products = res.rows;
    console.log(`Found ${products.length} products to check.`);

    let updatedCount = 0;

    // Sort keys descending to match longer keywords first (e.g. "Coffee Beans" before "Beans")
    const sortedMapKeys = Object.keys(PRODUCT_IMAGE_MAP).sort((a, b) => b.length - a.length);

    for (const p of products) {
      if (p.category_name === 'Fashion') {
        continue;
      }
      let needsUpdate = false;
      let newImage = p.image;
      
      // Parse images array
      let imagesArr = [];
      try {
        imagesArr = p.images ? JSON.parse(p.images) : [];
      } catch (e) {
        imagesArr = [];
      }

      // 1. If it's a generated product (id >= 13) or named "Cashew", match by noun/type in name
      if (p.id >= 13 || p.name.toLowerCase() === 'cashew') {
        let matchedImage = null;
        for (const key of sortedMapKeys) {
          if (p.name.includes(key) || p.name.endsWith(key)) {
            matchedImage = PRODUCT_IMAGE_MAP[key];
            break;
          }
        }
        
        if (matchedImage && p.image !== matchedImage) {
          newImage = matchedImage;
          imagesArr = [matchedImage];
          needsUpdate = true;
        }
      }

      // 2. For manually seeded products (id 1 to 12), check against replacements
      if (p.id >= 1 && p.id <= 12) {
        if (replacements[p.image]) {
          newImage = replacements[p.image];
          needsUpdate = true;
        }
        
        // Also check images array
        const newImagesArr = imagesArr.map(img => {
          if (replacements[img]) {
            needsUpdate = true;
            return replacements[img];
          }
          return img;
        });
        if (needsUpdate) {
          imagesArr = newImagesArr;
        }
      }

      if (needsUpdate) {
        await db.execute({
          sql: "UPDATE products SET image = ?, images = ? WHERE id = ?;",
          args: [newImage, JSON.stringify(imagesArr), p.id]
        });
        updatedCount++;
        console.log(`Updated product ${p.id} (${p.name}): ${p.image} -> ${newImage}`);
      }
    }

    console.log(`Finished. Total products updated: ${updatedCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Error updating database images:", err);
    process.exit(1);
  }
}

run();
