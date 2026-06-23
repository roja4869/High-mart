import { db } from './data/db.js';

const FASHION_GENERATOR_CONFIG = [
  // 1. Men's Clothing (52 products)
  {
    subCategory: 'Clothing',
    gender: 'Men',
    types: ['T-Shirt', 'Shirt', 'Jeans', 'Trousers', 'Jacket', 'Hoodie'],
    count: 52
  },
  // 2. Women's Clothing (52 products)
  {
    subCategory: 'Clothing',
    gender: 'Women',
    types: ['Saree', 'Kurti', 'Dress', 'Top', 'Jeans', 'Jacket'],
    count: 52
  },
  // 3. Kids' Clothing (32 products)
  {
    subCategory: 'Clothing',
    gender: 'Kids',
    types: ['Boys Wear', 'Girls Wear', 'School Uniform', 'Party Wear'],
    count: 32
  },
  // 4. Men's Footwear (42 products)
  {
    subCategory: 'Footwear',
    gender: 'Men',
    types: ['Sports Shoes', 'Sneakers', 'Formal Shoes', 'Sandals'],
    count: 42
  },
  // 5. Women's Footwear (42 products)
  {
    subCategory: 'Footwear',
    gender: 'Women',
    types: ['Heels', 'Flats', 'Sneakers', 'Sandals'],
    count: 42
  },
  // 6. Kids' Footwear (22 products)
  {
    subCategory: 'Footwear',
    gender: 'Kids',
    types: ['School Shoes', 'Casual Shoes', 'Sports Shoes'],
    count: 22
  },
  // 7. Eyewear (32 products)
  {
    subCategory: 'Eyewear',
    gender: 'General',
    types: ['Sunglasses', 'Reading Glasses', 'Computer Glasses', 'Fashion Glasses', 'Protective Glasses'],
    count: 32
  },
  // 8. Watches (32 products)
  {
    subCategory: 'Watches',
    gender: 'General',
    types: ['Analog Watch', 'Chronograph Watch', 'Smart Watch'],
    count: 32
  },
  // 9. Bags (32 products)
  {
    subCategory: 'Bags',
    gender: 'General',
    types: ['Backpack', 'Handbag', 'Tote Bag', 'Duffle Bag', 'Sling Bag'],
    count: 32
  },
  // 10. Accessories (52 products)
  {
    subCategory: 'Accessories',
    gender: 'General',
    types: ['Belt', 'Cap', 'Wallet', 'Jewellery', 'Hair Accessories', 'Scarf'],
    count: 52
  }
];

function getSubcategoryId(subCategory, gender, pType) {
  if (subCategory === 'Clothing') {
    if (gender === 'Men') {
      if (pType === 'T-Shirt') return 3;
      if (pType === 'Shirt') return 4;
      if (pType === 'Jeans') return 5;
      if (pType === 'Trousers') return 6;
      if (pType === 'Jacket') return 7;
      if (pType === 'Hoodie') return 8;
    } else if (gender === 'Women') {
      if (pType === 'Saree') return 10;
      if (pType === 'Kurti') return 11;
      if (pType === 'Dress') return 12;
      if (pType === 'Top') return 13;
      if (pType === 'Jeans') return 14;
      if (pType === 'Jacket') return 15;
    } else if (gender === 'Kids') {
      if (pType === 'Boys Wear') return 17;
      if (pType === 'Girls Wear') return 18;
      if (pType === 'School Uniform') return 19;
      if (pType === 'Party Wear') return 20;
    }
  } else if (subCategory === 'Footwear') {
    if (gender === 'Men') {
      if (pType === 'Sports Shoes') return 23;
      if (pType === 'Sneakers') return 24;
      if (pType === 'Formal Shoes') return 25;
      if (pType === 'Sandals') return 26;
    } else if (gender === 'Women') {
      if (pType === 'Heels') return 28;
      if (pType === 'Flats') return 29;
      if (pType === 'Sneakers') return 30;
      if (pType === 'Sandals') return 31;
    } else if (gender === 'Kids') {
      if (pType === 'School Shoes') return 33;
      if (pType === 'Casual Shoes') return 34;
      if (pType === 'Sports Shoes') return 35;
    }
  } else if (subCategory === 'Eyewear') {
    if (gender === 'Men') {
      if (pType === 'Sunglasses') return 38;
      if (pType === 'Reading Glasses') return 39;
      if (pType === 'Computer Glasses') return 40;
    } else if (gender === 'Women') {
      if (pType === 'Sunglasses') return 42;
      if (pType === 'Fashion Glasses') return 43;
      if (pType === 'Reading Glasses') return 44;
    } else if (gender === 'Kids') {
      if (pType === 'Sunglasses') return 46;
      if (pType === 'Protective Glasses') return 47;
    }
  } else if (subCategory === 'Bags') {
    if (gender === 'Men') return 49;
    if (gender === 'Women') return 50;
    if (gender === 'Kids') return 51;
  } else if (subCategory === 'Watches') {
    if (gender === 'Men') return 53;
    if (gender === 'Women') return 54;
    if (gender === 'Kids') return 55;
  } else if (subCategory === 'Accessories') {
    if (pType === 'Belt') return 57;
    if (pType === 'Cap') return 58;
    if (pType === 'Wallet') return 59;
    if (pType === 'Jewellery') return 60;
    if (pType === 'Hair Accessories') return 61;
    if (pType === 'Scarf') return 62;
  }
  return null;
}

async function run() {
  try {
    console.log("Seeding subcategory IDs for products...");

    // Update ID 2 and ID 8
    await db.execute({
      sql: "UPDATE products SET subcategory_id = ? WHERE id = ?",
      args: [53, 2] // Watches > Men
    });
    await db.execute({
      sql: "UPDATE products SET subcategory_id = ? WHERE id = ?",
      args: [49, 8] // Bags > Men
    });
    console.log("Updated mock products ID 2 and 8.");

    let currentId = 153;
    let updateCount = 2;

    for (const cfg of FASHION_GENERATOR_CONFIG) {
      const subCategory = cfg.subCategory;
      for (let i = 0; i < cfg.count; i++) {
        const pType = cfg.types[i % cfg.types.length];
        
        let gender = cfg.gender;
        if (gender === 'General') {
          gender = ['Men', 'Women', 'Kids'][i % 3];
        }

        const subcatId = getSubcategoryId(subCategory, gender, pType);
        if (subcatId) {
          await db.execute({
            sql: "UPDATE products SET subcategory_id = ? WHERE id = ?",
            args: [subcatId, currentId]
          });
          updateCount++;
        }
        currentId++;
      }
    }

    console.log(`Successfully mapped and updated ${updateCount} Fashion products in DB.`);
    
    // Verify by listing counts grouped by subcategory
    const checkRes = await db.execute(`
      SELECT p.subcategory_id, s.name, COUNT(*) as count 
      FROM products p 
      JOIN subcategories s ON p.subcategory_id = s.id 
      GROUP BY p.subcategory_id;
    `);
    console.log("Updated subcategory counts:");
    console.log(checkRes.rows);

  } catch (err) {
    console.error("Migration error:", err);
  }
}

run();
