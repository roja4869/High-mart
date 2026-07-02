import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { users, products, orders, inventoryLogs, FASHION_GENDER_IMAGE_MAP, PRODUCT_IMAGE_MAP } from './mockDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log("Starting Turso Database Migration...");
  
  // Wait for 1 second to ensure that mockDb.js has finished seeding the in-memory array elements (since it hashes passwords asynchronously)
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // 1. Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Strip comment lines first, then split by semicolon
    const cleanSql = schemaSql
      .split('\n')
      .map(line => line.trim())
      .filter(line => !line.startsWith('--'))
      .join('\n');

    const queries = cleanSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log("Dropping existing tables for clean migration...");
    const tables = [
      'inventory_logs',
      'reviews',
      'payments',
      'order_items',
      'orders',
      'cart',
      'wishlist',
      'products',
      'category_relationships',
      'subcategories',
      'users',
      'categories'
    ];
    for (const table of tables) {
      try {
        await db.execute(`DROP TABLE IF EXISTS ${table}`);
      } catch (err) {
        console.warn(`Failed to drop table ${table}:`, err.message);
      }
    }

    console.log(`Executing ${queries.length} schema statements...`);
    
    // Run schema setup queries
    for (const query of queries) {
      await db.execute(query);
    }
    console.log("Database schema created successfully.");

    // Check if categories already exist (so we don't duplicate/re-seed on every run)
    const checkCats = await db.execute("SELECT COUNT(*) as count FROM categories");
    const catCount = checkCats.rows[0].count;

    if (catCount > 0) {
      console.log("Database already seeded. Skipping seeding step.");
      return;
    }

    console.log("Seeding initial database data...");

    const brokenUrlsList = [
      'https://images.unsplash.com/photo-1541140111954-75a9e3b08e2f?w=600&q=80',
      'https://images.unsplash.com/photo-1544224013-c3b8a1c3e4a2?w=600&q=80',
      'https://images.unsplash.com/photo-1574269661728-79659b722d56?w=600&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e5163ccbe8?w=600&q=80',
      'https://images.unsplash.com/photo-1627124118303-624c8f94e224?w=600&q=80',
      'https://images.unsplash.com/photo-1582142407894-ec85a1268a4e?w=600&q=80',
      'https://images.unsplash.com/photo-1624222247344-550fb8ec5b5d?w=600&q=80'
    ];

    function resolveSubcatKey(p) {
      const name = p.name.toLowerCase();
      const cat = p.category;

      if (cat === 'Fashion') {
        if (p.subCategory === 'Bags' || p.subCategory === 'Watches') {
          return `${p.subCategory} > ${p.gender}`;
        } else if (p.subCategory === 'Accessories') {
          return `${p.subCategory} > ${p.productType}`;
        } else {
          return `${p.subCategory} > ${p.gender} > ${p.productType}`;
        }
      }

      if (cat === 'Electronics') {
        if (name.includes('mobile') || name.includes('phone')) return 'Mobiles';
        if (name.includes('laptop')) return 'Laptops';
        if (name.includes('tablet')) return 'Tablets';
        if (name.includes('headphones') || name.includes('earbuds') || name.includes('headset') || name.includes('soundlink')) return 'Headphones';
        if (name.includes('smartwatch') || name.includes('tracker') || name.includes('fitness band') || name.includes('watch') || name.includes('wearable')) return 'Smart Watches';
        if (name.includes('camera') || name.includes('dslr') || name.includes('lens')) return 'Cameras';
        return 'Accessories';
      }

      if (cat === 'Beauty') {
        if (name.includes('shampoo') || name.includes('conditioner') || name.includes('hair')) return 'Hair Care';
        if (name.includes('lipstick') || name.includes('mascara') || name.includes('makeup') || name.includes('palette')) return 'Makeup';
        if (name.includes('lotion') || name.includes('serum') || name.includes('cleanser') || name.includes('face mask') || name.includes('sunscreen') || name.includes('lip balm') || name.includes('cream')) return 'Skincare';
        return 'Personal Care';
      }

      if (cat === 'Books') {
        if (name.includes('python') || name.includes('programming') || name.includes('machine learning') || name.includes('algorithms') || name.includes('data science') || name.includes('software') || name.includes('web development') || name.includes('database') || name.includes('architecture') || name.includes('education') || name.includes('textbook')) return 'Education';
        if (name.includes('gatsby') || name.includes('fiction') || name.includes('novel') || name.includes('story') || name.includes('thriller')) return 'Fiction';
        if (name.includes('child') || name.includes('kids') || name.includes('toy') || name.includes('fairy')) return 'Children\'s Books';
        return 'Non-Fiction';
      }

      if (cat === 'Home & Kitchen') {
        if (name.includes('cookware') || name.includes('pan') || name.includes('pot') || name.includes('skillet')) return 'Cookware';
        if (name.includes('chair') || name.includes('desk') || name.includes('table') || name.includes('furniture') || name.includes('stool')) return 'Furniture';
        if (name.includes('lamp') || name.includes('decor') || name.includes('diffuser') || name.includes('vase')) return 'Home Decor';
        if (name.includes('storage') || name.includes('organizer') || name.includes('rack') || name.includes('bin') || name.includes('box')) return 'Storage';
        if (name.includes('cooker') || name.includes('blender') || name.includes('fryer') || name.includes('toaster') || name.includes('coffee maker') || name.includes('microwave') || name.includes('oven')) return 'Appliances';
        return 'Kitchen Essentials';
      }

      if (cat === 'Sports') {
        if (name.includes('dumbbell') || name.includes('fitness band') || name.includes('punching bag') || name.includes('jump rope') || name.includes('yoga mat') || name.includes('treadmill') || name.includes('kettlebell')) return 'Fitness Equipment';
        if (name.includes('wear') || name.includes('clothing') || name.includes('jersey') || name.includes('shorts') || name.includes('shirt')) return 'Sports Wear';
        return 'Outdoor Equipment';
      }

      if (cat === 'Toys') {
        if (name.includes('brick') || name.includes('model kit') || name.includes('educational') || name.includes('stem') || name.includes('blocks')) return 'Educational Toys';
        if (name.includes('board game') || name.includes('card game') || name.includes('games') || name.includes('puzzle')) return 'Games';
        return 'Action Figures';
      }

      if (cat === 'Groceries') {
        if (name.includes('coffee') || name.includes('tea') || name.includes('juice') || name.includes('beverage') || name.includes('drink')) return 'Beverages';
        return 'Pantry Staples';
      }

      return null;
    }

    const resolveProductType = (p) => {
      if (p.productType) return p.productType;
      const name = p.name.toLowerCase();
      if (name.includes('t-shirt') || name.includes('tee')) return 'T-Shirt';
      if (name.includes('shirt')) return 'Shirt';
      if (name.includes('jeans')) return 'Jeans';
      if (name.includes('trouser') || name.includes('pants')) return 'Trousers';
      if (name.includes('jacket')) return 'Jacket';
      if (name.includes('hoodie')) return 'Hoodie';
      if (name.includes('saree')) return 'Saree';
      if (name.includes('kurti')) return 'Kurti';
      if (name.includes('dress')) return 'Dress';
      if (name.includes('top')) return 'Top';
      if (name.includes('sports shoes')) return 'Sports Shoes';
      if (name.includes('sneakers')) return 'Sneakers';
      if (name.includes('formal shoes')) return 'Formal Shoes';
      if (name.includes('sandals')) return 'Sandals';
      if (name.includes('heels')) return 'Heels';
      if (name.includes('flats')) return 'Flats';
      if (name.includes('school shoes')) return 'School Shoes';
      if (name.includes('casual shoes')) return 'Casual Shoes';
      if (name.includes('sunglasses')) return 'Sunglasses';
      if (name.includes('reading glasses')) return 'Reading Glasses';
      if (name.includes('computer glasses')) return 'Computer Glasses';
      if (name.includes('fashion glasses')) return 'Fashion Glasses';
      if (name.includes('protective glasses')) return 'Protective Glasses';
      if (name.includes('backpack')) return 'Backpack';
      if (name.includes('handbag')) return 'Handbag';
      if (name.includes('tote')) return 'Tote Bag';
      if (name.includes('duffle')) return 'Duffle Bag';
      if (name.includes('sling')) return 'Sling Bag';
      if (name.includes('analog watch')) return 'Analog Watch';
      if (name.includes('chronograph')) return 'Chronograph Watch';
      if (name.includes('smart watch') || name.includes('smartwatch')) return 'Smart Watch';
      if (name.includes('belt')) return 'Belt';
      if (name.includes('cap')) return 'Cap';
      if (name.includes('wallet')) return 'Wallet';
      if (name.includes('jewellery') || name.includes('pendant') || name.includes('necklace')) return 'Jewellery';
      if (name.includes('scarf')) return 'Scarf';
      if (name.includes('hair')) return 'Hair Accessories';
      return p.subCategory || 'Clothing';
    };

    let auditReport = "=== PRODUCT DATA INTEGRITY AUDIT REPORT ===\n\n";
    let incorrectGenders = [];
    let incorrectImages = [];
    let preservedImagesCount = 0;
    let correctRecords = 0;

    const finalProductsToSeed = [];

    for (const p of products) {
      // 1. Gender classification resolve (Fashion only)
      let gender = p.gender || null;
      if (p.category === 'Fashion') {
        if (!gender) {
          const pathKey = resolveSubcatKey(p);
          if (pathKey && pathKey.includes(' > ')) {
            const parts = pathKey.split(' > ');
            if (['Men', 'Women', 'Kids'].includes(parts[1])) {
              gender = parts[1];
            }
          }
        }
        if (!gender) {
          const allText = `${p.name} ${p.description || ''}`.toLowerCase();
          if (/\bmen\b|\bmens\b|\bmale\b/.test(allText)) gender = 'Men';
          else if (/\bwomen\b|\bwomens\b|\bfemale\b|\blady\b|\bladies\b/.test(allText)) gender = 'Women';
          else if (/\bkids\b|\bboys\b|\bgirls\b|\bchild\b|\bchildren\b/.test(allText)) gender = 'Kids';
        }

        // Check if product gender is mismatching name/desc keywords (e.g. named "Men's" but category gender is "Women")
        let originalGender = gender;
        let genderCorrected = false;
        if (/\bmen's\b/i.test(p.name) && gender !== 'Men') {
          gender = 'Men';
          genderCorrected = true;
        } else if (/\bwomen's\b/i.test(p.name) && gender !== 'Women') {
          gender = 'Women';
          genderCorrected = true;
        } else if (/\bkids'\b/i.test(p.name) && gender !== 'Kids') {
          gender = 'Kids';
          genderCorrected = true;
        }

        if (genderCorrected) {
          incorrectGenders.push({
            id: p.id,
            name: p.name,
            originalGender,
            correctedGender: gender
          });
        }
      }

      // 2. Image validation check
      let image = p.image || (p.images && p.images[0]) || 'default_product.jpg';
      let originalImage = image;
      let imageCorrected = false;

      // Check if image is broken or missing
      const isBrokenOrMissing = !image || image === 'default_product.jpg' || !image.startsWith('http') || brokenUrlsList.some(bu => image.includes(bu.split('?')[0]));

      if (isBrokenOrMissing) {
        if (p.category === 'Fashion') {
          const type = resolveProductType(p);
          const key = `${gender || 'Men'}_${type}`;
          if (FASHION_GENDER_IMAGE_MAP[key]) {
            image = FASHION_GENDER_IMAGE_MAP[key];
            imageCorrected = true;
          } else {
            const subCatKey = `${gender || 'Men'}_${p.subCategory}`;
            if (FASHION_GENDER_IMAGE_MAP[subCatKey]) {
              image = FASHION_GENDER_IMAGE_MAP[subCatKey];
              imageCorrected = true;
            } else {
              image = PRODUCT_IMAGE_MAP[type] || PRODUCT_IMAGE_MAP[p.subCategory] || 'default_product.jpg';
              imageCorrected = true;
            }
          }
        } else {
          // Non-Fashion: attempt to recover by noun match in PRODUCT_IMAGE_MAP
          let restored = null;
          const sortedMapKeys = Object.keys(PRODUCT_IMAGE_MAP).sort((a, b) => b.length - a.length);
          for (const key of sortedMapKeys) {
            if (p.name.includes(key) || p.name.endsWith(key)) {
              restored = PRODUCT_IMAGE_MAP[key];
              break;
            }
          }
          if (restored) {
            image = restored;
            imageCorrected = true;
          } else {
            // Last resort: keep whatever it is, or use default
            image = originalImage;
          }
        }
      }

      if (imageCorrected) {
        incorrectImages.push({
          id: p.id,
          name: p.name,
          category: p.category,
          originalImage,
          correctedImage: image
        });
      } else {
        preservedImagesCount++;
        correctRecords++;
      }

      // Update product fields with corrected values
      const updatedProduct = {
        ...p,
        gender,
        image,
        images: [image]
      };
      finalProductsToSeed.push(updatedProduct);
    }

    auditReport += `Total products processed: ${finalProductsToSeed.length}\n`;
    auditReport += `Preserved original valid images: ${preservedImagesCount}\n`;
    auditReport += `Incorrect gender mappings corrected: ${incorrectGenders.length}\n`;
    auditReport += `Restored image mappings (broken/missing replaced): ${incorrectImages.length}\n`;
    auditReport += `Correct records (no changes needed): ${correctRecords}\n\n`;

    auditReport += "--- DETAILS OF GENDER CORRECTIONS ---\n";
    incorrectGenders.forEach(g => {
      auditReport += `ID: ${g.id} | Name: "${g.name}" | Original Gender: ${g.originalGender} -> Corrected Gender: ${g.correctedGender}\n`;
    });
    auditReport += "\n";

    auditReport += "--- DETAILS OF IMAGE RESTORATIONS ---\n";
    incorrectImages.forEach(img => {
      auditReport += `ID: ${img.id} | Name: "${img.name}" | Category: ${img.category}\n  Original Image: ${img.originalImage}\n  Restored Image: ${img.correctedImage}\n`;
    });

    const scratchDir = path.join(__dirname, '../../scratch');
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
    fs.writeFileSync(path.join(scratchDir, 'audit_report.txt'), auditReport);
    console.log(`Audited products. Corrected Genders: ${incorrectGenders.length}, Restored Images: ${incorrectImages.length}, Preserved Valid Images: ${preservedImagesCount}`);

    // 2. Seed Categories
    const categoryNames = [...new Set(finalProductsToSeed.map(p => p.category))];
    const categoryMap = {};
    
    for (const catName of categoryNames) {
      const result = await db.execute({
        sql: "INSERT INTO categories (name, description) VALUES (?, ?) RETURNING id",
        args: [catName, `${catName} category products`]
      });
      const catId = result.rows[0].id;
      categoryMap[catName] = catId;
    }
    console.log(`Seeded ${categoryNames.length} categories.`);

    // 2.1 Seed Subcategories & Relationships
    const fashionCatId = categoryMap['Fashion'];
    const leafSubcategoryMap = {};



    const OTHER_SUBCATS = {
      'Electronics': [
        { name: 'Mobiles' },
        { name: 'Laptops' },
        { name: 'Tablets' },
        { name: 'Headphones' },
        { name: 'Smart Watches' },
        { name: 'Cameras' },
        { name: 'Accessories' }
      ],
      'Groceries': [
        { name: 'Pantry Staples' },
        { name: 'Beverages' }
      ],
      'Home & Kitchen': [
        { name: 'Cookware' },
        { name: 'Appliances' },
        { name: 'Furniture' },
        { name: 'Home Decor' },
        { name: 'Storage' },
        { name: 'Kitchen Essentials' }
      ],
      'Beauty': [
        { name: 'Skincare' },
        { name: 'Makeup' },
        { name: 'Hair Care' },
        { name: 'Personal Care' }
      ],
      'Toys': [
        { name: 'Educational Toys' },
        { name: 'Action Figures' },
        { name: 'Games' }
      ],
      'Books': [
        { name: 'Fiction' },
        { name: 'Non-Fiction' },
        { name: 'Education' },
        { name: 'Children\'s Books' }
      ],
      'Sports': [
        { name: 'Fitness Equipment' },
        { name: 'Sports Wear' },
        { name: 'Outdoor Equipment' }
      ]
    };

    const FASHION_SUBCATS = [
      {
        name: 'Clothing',
        children: [
          {
            name: 'Men',
            children: [
              { name: 'T-Shirt' },
              { name: 'Shirt' },
              { name: 'Jeans' },
              { name: 'Trousers' },
              { name: 'Jacket' },
              { name: 'Hoodie' }
            ]
          },
          {
            name: 'Women',
            children: [
              { name: 'Saree' },
              { name: 'Kurti' },
              { name: 'Dress' },
              { name: 'Top' },
              { name: 'Jeans' },
              { name: 'Jacket' }
            ]
          },
          {
            name: 'Kids',
            children: [
              { name: 'Boys Wear' },
              { name: 'Girls Wear' },
              { name: 'School Uniform' },
              { name: 'Party Wear' }
            ]
          }
        ]
      },
      {
        name: 'Footwear',
        children: [
          {
            name: 'Men',
            children: [
              { name: 'Sports Shoes' },
              { name: 'Sneakers' },
              { name: 'Formal Shoes' },
              { name: 'Sandals' }
            ]
          },
          {
            name: 'Women',
            children: [
              { name: 'Heels' },
              { name: 'Flats' },
              { name: 'Sneakers' },
              { name: 'Sandals' }
            ]
          },
          {
            name: 'Kids',
            children: [
              { name: 'School Shoes' },
              { name: 'Casual Shoes' },
              { name: 'Sports Shoes' }
            ]
          }
        ]
      },
      {
        name: 'Eyewear',
        children: [
          {
            name: 'Men',
            children: [
              { name: 'Sunglasses' },
              { name: 'Reading Glasses' },
              { name: 'Computer Glasses' }
            ]
          },
          {
            name: 'Women',
            children: [
              { name: 'Sunglasses' },
              { name: 'Fashion Glasses' },
              { name: 'Reading Glasses' }
            ]
          },
          {
            name: 'Kids',
            children: [
              { name: 'Sunglasses' },
              { name: 'Protective Glasses' }
            ]
          }
        ]
      },
      {
        name: 'Bags',
        children: [
          { name: 'Men' },
          { name: 'Women' },
          { name: 'Kids' }
        ]
      },
      {
        name: 'Watches',
        children: [
          { name: 'Men' },
          { name: 'Women' },
          { name: 'Kids' }
        ]
      },
      {
        name: 'Accessories',
        children: [
          { name: 'Belt' },
          { name: 'Cap' },
          { name: 'Wallet' },
          { name: 'Jewellery' },
          { name: 'Hair Accessories' },
          { name: 'Scarf' }
        ]
      }
    ];

    async function seedSubcategoryNode(node, parentId, parentType, mainCatId, currentPathList = []) {
      const res = await db.execute({
        sql: "INSERT INTO subcategories (category_id, name, description) VALUES (?, ?, ?) RETURNING id",
        args: [mainCatId, node.name, `${node.name} subcategory`]
      });
      const subId = res.rows[0].id;
      
      await db.execute({
        sql: "INSERT INTO category_relationships (parent_id, child_id, parent_type, child_type) VALUES (?, ?, ?, ?)",
        args: [parentId, subId, parentType, 'subcategory']
      });

      const nextPathList = [...currentPathList, node.name];
      const pathKey = nextPathList.join(' > ');
      leafSubcategoryMap[pathKey] = subId;

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          await seedSubcategoryNode(child, subId, 'subcategory', mainCatId, nextPathList);
        }
      }
    }

    if (fashionCatId) {
      for (const node of FASHION_SUBCATS) {
        await seedSubcategoryNode(node, fashionCatId, 'category', fashionCatId, []);
      }
      console.log("Seeded Fashion subcategories and hierarchy relationships.");
    }

    for (const [catName, subcats] of Object.entries(OTHER_SUBCATS)) {
      const catId = categoryMap[catName];
      if (catId) {
        for (const node of subcats) {
          await seedSubcategoryNode(node, catId, 'category', catId, []);
        }
      }
    }
    console.log("Seeded subcategories for all other categories.");

    // 3. Seed Users (We use the actual data in users from mockDb.js)
    const userMap = {}; // mapping of old id -> new db id
    for (const u of users) {
      const result = await db.execute({
        sql: "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?) RETURNING id",
        args: [u.name, u.email, u.phone || null, u.password, u.role]
      });
      const userId = result.rows[0].id;
      userMap[u.id] = userId;
    }
    console.log(`Seeded ${users.length} users.`);

    // 4. Seed Products
    const productMap = {}; // mapping of old id -> new db id
    for (const p of finalProductsToSeed) {
      const catId = categoryMap[p.category] || null;
      const pathKey = resolveSubcatKey(p);
      const subcatId = (pathKey && leafSubcategoryMap[pathKey]) || null;

      const result = await db.execute({
        sql: `INSERT INTO products (id, name, description, price, category_id, subcategory_id, image, stock, brand, discount, rating, reviewCount, sku, images, features, variants, specifications) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        args: [
          p.id,
          p.name,
          p.description || '',
          p.price,
          catId,
          subcatId,
          p.image || (p.images && p.images[0]) || 'default_product.jpg',
          p.stock || 0,
          p.brand || '',
          p.discount || 0,
          p.rating || 0.0,
          p.reviewCount || 0,
          p.sku || '',
          JSON.stringify(p.images || []),
          JSON.stringify(p.features || []),
          JSON.stringify(p.variants || {}),
          JSON.stringify(p.specifications || {})
        ]
      });
      const prodId = result.rows[0].id;
      productMap[p.id] = prodId;
    }
    console.log(`Seeded ${finalProductsToSeed.length} products.`);

    // 5. Seed Orders, Order Items, and Payments
    for (const o of orders) {
      const dbUserId = userMap[o.userId] || o.userId;
      
      // Insert Order
      const orderResult = await db.execute({
        sql: `INSERT INTO orders (id, user_id, total_amount, shipping_address, status, payment_method, payment_status, transaction_id, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        args: [o.id, dbUserId, o.totalAmount, o.shippingAddress, o.status, o.paymentMethod, o.paymentStatus, o.transactionId, o.createdAt, o.createdAt]
      });
      const orderId = orderResult.rows[0].id;

      // Insert Order Items
      for (const item of o.items) {
        const dbProdId = productMap[item.productId] || item.productId;
        await db.execute({
          sql: `INSERT INTO order_items (order_id, product_id, name, price, image, quantity, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [orderId, dbProdId, item.name, item.price, item.image, item.quantity, o.createdAt]
        });
      }

      // Insert Payment record
      const paymentStatus = o.paymentStatus === 'Paid' ? 'Completed' : (o.paymentStatus === 'Failed' ? 'Failed' : 'Pending');
      await db.execute({
        sql: `INSERT INTO payments (order_id, user_id, amount, payment_method, status, transaction_id, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [orderId, dbUserId, o.totalAmount, o.paymentMethod, paymentStatus, o.transactionId, o.createdAt, o.createdAt]
      });
    }
    console.log(`Seeded ${orders.length} orders, order items, and payment transactions.`);

    // 6. Seed Reviews (adding some mock reviews for testing reviews functionality)
    const mockReviews = [
      { productId: 1, userId: 1, rating: 5, comment: "Absolutely love this coffee maker! Best purchase ever." },
      { productId: 2, userId: 1, rating: 4, comment: "Great noise cancelling. Battery life is amazing." },
      { productId: 4, userId: 1, rating: 5, comment: "Sturdy and keeps my water cold all day long." }
    ];

    for (const r of mockReviews) {
      const dbProdId = productMap[r.productId] || r.productId;
      const dbUserId = userMap[r.userId] || r.userId;
      await db.execute({
        sql: `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
        args: [dbProdId, dbUserId, r.rating, r.comment]
      });
    }
    console.log(`Seeded ${mockReviews.length} product reviews.`);

    // 7. Seed Inventory Logs
    for (const log of inventoryLogs) {
      const dbProdId = productMap[log.productId] || log.productId;
      await db.execute({
        sql: `INSERT INTO inventory_logs (product_id, product_name, activity_type, quantity_change, remaining_stock, performed_by, timestamp) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [dbProdId, log.productName, log.activityType, log.quantityChange, log.remainingStock, log.performedBy, log.timestamp]
      });
    }
    console.log(`Seeded ${inventoryLogs.length} inventory logs.`);

    console.log("Turso Database migration and seeding completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runMigration();
