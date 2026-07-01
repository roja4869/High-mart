import { db } from '../data/db.js';

// Helper to parse JSON string columns from SQLite/libSQL
const formatProductRow = (row) => {
  if (!row) return row;
  const product = { ...row };
  
  try {
    product.images = product.images ? JSON.parse(product.images) : [];
  } catch (e) {
    product.images = [];
  }
  try {
    product.features = product.features ? JSON.parse(product.features) : [];
  } catch (e) {
    product.features = [];
  }
  try {
    product.variants = product.variants ? JSON.parse(product.variants) : {};
  } catch (e) {
    product.variants = {};
  }
  try {
    product.specifications = product.specifications ? JSON.parse(product.specifications) : {};
  } catch (e) {
    product.specifications = {};
  }
  
  // Compute stockStatus and stockCount expected by the client
  product.stockCount = product.stock;
  if (product.stock <= 0) {
    product.stockStatus = 'Out of Stock';
  } else if (product.stock <= 5) {
    product.stockStatus = 'Low Stock';
  } else {
    product.stockStatus = 'In Stock';
  }

  // Ensure there is at least one image in images array
  if (!product.images || product.images.length === 0) {
    product.images = [product.image ? (product.image.startsWith('http') ? product.image : `/uploads/${product.image}`) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'];
  }
  
  return product;
};

const FASHION_GENDER_IMAGE_MAP = {
  // Men Clothing
  'Men_T-Shirt': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
  'Men_Shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
  'Men_Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
  'Men_Trousers': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
  'Men_Jacket': 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80',
  'Men_Hoodie': 'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=600&q=80',

  // Men Footwear
  'Men_Sports Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'Men_Sneakers': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
  'Men_Formal Shoes': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80',
  'Men_Sandals': 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80',

  // Men Eyewear
  'Men_Sunglasses': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
  'Men_Reading Glasses': 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&q=80',
  'Men_Computer Glasses': 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&q=80',

  // Men Bags
  'Men_Backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  'Men_Handbag': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  'Men_Tote Bag': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  'Men_Duffle Bag': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  'Men_Sling Bag': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',

  // Men Watches
  'Men_Analog Watch': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
  'Men_Chronograph Watch': 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80',
  'Men_Smart Watch': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',

  // Men Accessories
  'Men_Belt': 'https://images.unsplash.com/photo-1624222247344-550fb8ec5b5d?w=600&q=80',
  'Men_Cap': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
  'Men_Wallet': 'https://images.unsplash.com/photo-1627124118303-624c8f94e224?w=600&q=80',

  // Women Clothing
  'Women_T-Shirt': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
  'Women_Shirt': 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80',
  'Women_Jeans': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
  'Women_Jacket': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
  'Women_Dress': 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
  'Women_Saree': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
  'Women_Kurti': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
  'Women_Top': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',

  // Women Footwear
  'Women_Heels': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
  'Women_Flats': 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80',
  'Women_Sneakers': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
  'Women_Sandals': 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80',
  'Women_Sports Shoes': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',

  // Women Eyewear
  'Women_Sunglasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
  'Women_Fashion Glasses': 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80',
  'Women_Reading Glasses': 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80',

  // Women Bags
  'Women_Backpack': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
  'Women_Handbag': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
  'Women_Tote Bag': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
  'Women_Duffle Bag': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
  'Women_Sling Bag': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',

  // Women Watches
  'Women_Analog Watch': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
  'Women_Smart Watch': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',

  // Women Accessories
  'Women_Jewellery': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
  'Women_Hair Accessories': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
  'Women_Scarf': 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80',
  'Women_Belt': 'https://images.unsplash.com/photo-1618403088890-3d9ff6f4c8b1?w=600&q=80',
  'Women_Cap': 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80',
  'Women_Wallet': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',

  // Kids Clothing
  'Kids_Boys Wear': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80',
  'Kids_Girls Wear': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80',
  'Kids_School Uniform': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80',
  'Kids_Party Wear': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80',

  // Kids Footwear
  'Kids_School Shoes': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80',
  'Kids_Casual Shoes': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
  'Kids_Sports Shoes': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80',

  // Kids Accessories
  'Kids_Cap': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80',
  'Kids_Scarf': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80',
  'Kids_Hair Accessories': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80'
};

const getAutoReplaceImage = (gender, subCategory, productType, currentImage) => {
  if (!currentImage || !currentImage.startsWith('http')) {
    return currentImage;
  }
  const key = `${gender}_${productType}`;
  if (FASHION_GENDER_IMAGE_MAP[key]) {
    return FASHION_GENDER_IMAGE_MAP[key];
  }
  const subCatKey = `${gender}_${subCategory}`;
  if (FASHION_GENDER_IMAGE_MAP[subCatKey]) {
    return FASHION_GENDER_IMAGE_MAP[subCatKey];
  }
  return currentImage;
};

const validateProductMapping = (categoryName, pathParts, name, description, image) => {
  const categoryLower = (categoryName || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const imageLower = (image || '').toLowerCase();

  if (categoryLower === 'fashion') {
    if (!pathParts || pathParts.length === 0) {
      throw new Error("Validation Error: Fashion products must have a valid subcategory path.");
    }

    const subCategory = pathParts[0] || '';
    let gender = null;
    if (['Men', 'Women', 'Kids'].includes(pathParts[1])) {
      gender = pathParts[1];
    } else {
      const allText = `${nameLower} ${descLower}`;
      if (/\bmen\b|\bmens\b|\bmale\b/.test(allText)) {
        gender = 'Men';
      } else if (/\bwomen\b|\bwomens\b|\bfemale\b|\blady\b|\bladies\b/.test(allText)) {
        gender = 'Women';
      } else if (/\bkids\b|\bboys\b|\bgirls\b|\bchild\b|\bchildren\b/.test(allText)) {
        gender = 'Kids';
      }
    }

    if (!gender) {
      throw new Error("Validation Error: Fashion products must specify a target gender (Men, Women, or Kids) in their subcategory or product details.");
    }

    if (gender === 'Men') {
      const femaleKeywords = /\b(women|womens|female|lady|ladies|girl|girls|saree|kurti|dress|heels|handbag)\b/;
      if (femaleKeywords.test(nameLower) || femaleKeywords.test(descLower) || femaleKeywords.test(imageLower)) {
        throw new Error("Validation Error: Men's category cannot contain female apparel, handbag, heels, or female keywords.");
      }
    }
    if (gender === 'Women') {
      const maleKeywords = /\b(men|mens|male|boy|boys|formal shoes)\b/;
      if (maleKeywords.test(nameLower) || maleKeywords.test(descLower) || maleKeywords.test(imageLower)) {
        throw new Error("Validation Error: Women's category cannot contain men's apparel, formal shoes, or male keywords.");
      }
    }
    if (gender === 'Kids') {
      if (!['Clothing', 'Footwear', 'Accessories'].includes(subCategory)) {
        throw new Error("Validation Error: Kids' category can only contain Clothing, Footwear, or Accessories.");
      }
      const adultKeywords = /\b(saree|formal shoes|heels)\b/;
      if (adultKeywords.test(nameLower) || adultKeywords.test(descLower) || adultKeywords.test(imageLower)) {
        throw new Error("Validation Error: Kids' category cannot contain sarees, heels, or adult formal shoes.");
      }
    }
  }
};

// Helper to construct subcategory path mappings dynamically
const getCategoryPathMap = async () => {
  try {
    const categories = (await db.execute("SELECT id, name FROM categories")).rows;
    const subcategories = (await db.execute("SELECT id, name, category_id FROM subcategories")).rows;
    const relationships = (await db.execute("SELECT parent_id, child_id, parent_type, child_type FROM category_relationships")).rows;

    const nodes = {};
    categories.forEach(cat => {
      nodes[`category_${cat.id}`] = { name: cat.name, type: 'category', children: [] };
    });
    subcategories.forEach(sub => {
      nodes[`subcategory_${sub.id}`] = { name: sub.name, type: 'subcategory', children: [] };
    });

    const childKeys = new Set();
    relationships.forEach(rel => {
      const parentKey = `${rel.parent_type}_${rel.parent_id}`;
      const childKey = `${rel.child_type}_${rel.child_id}`;
      if (nodes[parentKey] && nodes[childKey]) {
        nodes[parentKey].children.push(childKey);
        childKeys.add(childKey);
      }
    });

    const pathMap = {};
    const rootCategoryMap = {};

    const traverse = (nodeKey, parentPathList = [], rootCatName = '') => {
      const node = nodes[nodeKey];
      if (!node) return;

      const nextPathList = [...parentPathList, node.name];
      const currentRoot = node.type === 'category' ? node.name : rootCatName;

      if (node.type === 'subcategory') {
        const numericId = parseInt(nodeKey.split('_')[1]);
        pathMap[numericId] = nextPathList.slice(1);
        rootCategoryMap[numericId] = currentRoot;
      }

      if (node.children) {
        node.children.forEach(childKey => traverse(childKey, nextPathList, currentRoot));
      }
    };

    const roots = Object.keys(nodes).filter(key => !childKeys.has(key));
    roots.forEach(key => traverse(key, [], nodes[key].name));

    return { pathMap, rootCategoryMap };
  } catch (err) {
    console.error("Error building category path map:", err.message);
    return { pathMap: {}, rootCategoryMap: {} };
  }
};

const enrichProduct = (product, pathMap, rootCategoryMap) => {
  if (!product) return product;

  let subCategory = null;
  let gender = null;
  let productType = null;

  if (product.subcategory_id && pathMap[product.subcategory_id]) {
    const pathParts = pathMap[product.subcategory_id];
    subCategory = pathParts[0] || null;
    if (['Men', 'Women', 'Kids'].includes(pathParts[1])) {
      gender = pathParts[1];
      productType = pathParts[2] || null;
    } else {
      gender = null;
      productType = pathParts[1] || null;
    }
    
    if (rootCategoryMap[product.subcategory_id]) {
      product.category = rootCategoryMap[product.subcategory_id];
    }
  }

  // Fallback gender parsing if not resolved by subcategory path
  if (!gender) {
    const nameLower = (product.name || '').toLowerCase();
    const descLower = (product.description || '').toLowerCase();
    if (/\bmen\b|\bmens\b|\bmale\b/.test(nameLower) || /\bmen\b|\bmens\b|\bmale\b/.test(descLower)) {
      gender = 'Men';
    } else if (/\bwomen\b|\bwomens\b|\bfemale\b|\blady\b|\bladies\b/.test(nameLower) || /\bwomen\b|\bwomens\b|\bfemale\b|\blady\b|\bladies\b/.test(descLower)) {
      gender = 'Women';
    } else if (/\bkids\b|\bboys\b|\bgirls\b|\bchild\b|\bchildren\b/.test(nameLower) || /\bkids\b|\bboys\b|\bgirls\b|\bchild\b|\bchildren\b/.test(descLower)) {
      gender = 'Kids';
    }
  }

  return {
    ...product,
    subCategory,
    gender,
    productType
  };
};

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    console.log("getProducts query parameters:", req.query);
    const { category, search, category_id, subcategory_id, gender, seller_id } = req.query;
    
    let sql = `
      SELECT p.*, c.name as category,
             s1.name as s1_name,
             s2.name as s2_name,
             s3.name as s3_name
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s1 ON p.subcategory_id = s1.id
      LEFT JOIN category_relationships r1 ON s1.id = r1.child_id AND r1.parent_type = 'subcategory'
      LEFT JOIN subcategories s2 ON r1.parent_id = s2.id
      LEFT JOIN category_relationships r2 ON s2.id = r2.child_id AND r2.parent_type = 'subcategory'
      LEFT JOIN subcategories s3 ON r2.parent_id = s3.id
      WHERE 1=1
    `;
    const args = [];

    // Filter by seller ID
    if (seller_id) {
      sql += ` AND p.seller_id = ?`;
      args.push(parseInt(seller_id));
    }

    // Filter by category name
    if (category) {
      sql += ` AND LOWER(c.name) = ?`;
      args.push(category.toLowerCase());
    }

    // Filter by category ID
    if (category_id) {
      sql += ` AND p.category_id = ?`;
      args.push(parseInt(category_id));
    }

    // Filter by subcategory ID (including all descendants recursively)
    if (subcategory_id) {
      sql += ` AND p.subcategory_id IN (
        WITH RECURSIVE subcat_tree(id) AS (
          SELECT ?
          UNION ALL
          SELECT r.child_id
          FROM category_relationships r
          JOIN subcat_tree t ON r.parent_id = t.id AND r.parent_type = 'subcategory' AND r.child_type = 'subcategory'
        )
        SELECT id FROM subcat_tree
      )`;
      args.push(parseInt(subcategory_id));
    }

    // Search by name or description
    if (search) {
      sql += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)`;
      const searchPattern = `%${search.toLowerCase()}%`;
      args.push(searchPattern, searchPattern);
    }

    const result = await db.execute({ sql, args });
    const formattedProducts = result.rows.map(row => formatProductRow(row));

    // Enrich with dynamic subcategory hierarchies
    const { pathMap, rootCategoryMap } = await getCategoryPathMap();
    const enriched = formattedProducts.map(p => enrichProduct(p, pathMap, rootCategoryMap));

    const products = result.rows.map(row => {
      let subCategory = null;
      let gender = null;
      let productType = null;

      if (row.s3_name) {
        subCategory = row.s3_name;
        gender = row.s2_name;
        productType = row.s1_name;
      } else if (row.s2_name) {
        subCategory = row.s2_name;
        if (['Men', 'Women', 'Kids'].includes(row.s1_name)) {
          gender = row.s1_name;
        } else {
          productType = row.s1_name;
        }
      } else if (row.s1_name) {
        subCategory = row.s1_name;
      }

      const { s1_name, s2_name, s3_name, ...cleanRow } = row;
      return {
        ...cleanRow,
        subCategory,
        gender,
        productType
      };
    });

    console.log(`getProducts query returned ${products.length} products.`);

    let finalProducts = enriched;
    if (gender) {
      const selectedGenders = gender.split(',').map(g => g.trim().toLowerCase());
      finalProducts = enriched.filter(p => p.gender && selectedGenders.includes(p.gender.toLowerCase()));
    }

    res.json({
      success: true,
      count: finalProducts.length,
      products: finalProducts
    });
  } catch (error) {
    console.error("Error in getProducts controller:", error);
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`getProductById called with ID: ${id}`);
    
    const result = await db.execute({
      sql: `
        SELECT p.*, c.name as category,
               s1.name as s1_name,
               s2.name as s2_name,
               s3.name as s3_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s1 ON p.subcategory_id = s1.id
        LEFT JOIN category_relationships r1 ON s1.id = r1.child_id AND r1.parent_type = 'subcategory'
        LEFT JOIN subcategories s2 ON r1.parent_id = s2.id
        LEFT JOIN category_relationships r2 ON s2.id = r2.child_id AND r2.parent_type = 'subcategory'
        LEFT JOIN subcategories s3 ON r2.parent_id = s3.id
        WHERE p.id = ?
      `,
      args: [id]
    });

    const row = result.rows[0];

    if (!row) {
      res.status(404);
      throw new Error(`Product with ID ${req.params.id} not found`);
    }

    // Fetch reviews for this product
    const reviewsResult = await db.execute({
      sql: `
        SELECT r.id, u.name, r.rating as stars, r.comment, r.created_at as date
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
      `,
      args: [id]
    });
    
    const reviews = reviewsResult.rows.map(rev => ({
      ...rev,
      avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&q=80'
    }));

    const { pathMap, rootCategoryMap } = await getCategoryPathMap();
    const formatted = formatProductRow(row);
    const enriched = enrichProduct(formatted, pathMap, rootCategoryMap);

    res.json({
      success: true,
      product: {
        ...enriched,
        reviews
      }
    });
  } catch (error) {
    console.error(`Error in getProductById controller for ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, subcategory_id, stock } = req.body;

    if (!name || !price || !category || stock === undefined) {
      res.status(400);
      throw new Error('Please provide name, price, category, and stock quantity');
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);
    const subcatId = subcategory_id ? parseInt(subcategory_id) : null;

    if (isNaN(priceNum) || priceNum <= 0) {
      res.status(400);
      throw new Error('Product price must be a valid positive number');
    }

    if (isNaN(stockNum) || stockNum < 0) {
      res.status(400);
      throw new Error('Product stock must be a non-negative integer');
    }

    // Resolve category ID
    let categoryResult = await db.execute({
      sql: "SELECT id FROM categories WHERE LOWER(name) = ?",
      args: [category.toLowerCase()]
    });

    let categoryId;
    if (categoryResult.rows.length > 0) {
      categoryId = categoryResult.rows[0].id;
    } else {
      // Create new category if it doesn't exist
      const newCatResult = await db.execute({
        sql: "INSERT INTO categories (name, description) VALUES (?, ?) RETURNING id",
        args: [category, `${category} category products`]
      });
      categoryId = newCatResult.rows[0].id;
    }

    // Fetch path map to resolve details and validate
    const { pathMap, rootCategoryMap } = await getCategoryPathMap();
    let subCategory = null;
    let gender = null;
    let productType = null;
    let pathParts = null;

    if (subcatId && pathMap[subcatId]) {
      pathParts = pathMap[subcatId];
      subCategory = pathParts[0] || null;
      if (['Men', 'Women', 'Kids'].includes(pathParts[1])) {
        gender = pathParts[1];
        productType = pathParts[2] || null;
      } else {
        gender = null;
        productType = pathParts[1] || null;
      }
    }

    // Fallback gender parsing if not resolved by subcategory path
    if (category.toLowerCase() === 'fashion' && !gender) {
      const allText = `${name} ${description || ''}`.toLowerCase();
      if (/\bmen\b|\bmens\b|\bmale\b/.test(allText)) {
        gender = 'Men';
      } else if (/\bwomen\b|\bwomens\b|\bfemale\b|\blady\b|\bladies\b/.test(allText)) {
        gender = 'Women';
      } else if (/\bkids\b|\bboys\b|\bgirls\b|\bchild\b|\bchildren\b/.test(allText)) {
        gender = 'Kids';
      }
    }

    // Handle image file name
    let image = req.file ? req.file.filename : 'default_product.jpg';

    // Validate
    validateProductMapping(category, pathParts, name, description || '', image);

    // Auto replacement of Unsplash images
    if (category.toLowerCase() === 'fashion' && gender) {
      image = getAutoReplaceImage(gender, subCategory, productType || subCategory, image);
    }

    // Fetch seller_id if user is a seller
    let sellerId = null;
    if (req.user && req.user.role === 'seller') {
      const sellerRes = await db.execute({
        sql: "SELECT id FROM sellers WHERE email = ?",
        args: [req.user.email.toLowerCase()]
      });
      if (sellerRes.rows.length > 0) {
        sellerId = sellerRes.rows[0].id;
      }
    }

    // Insert Product
    const insertResult = await db.execute({
      sql: `
        INSERT INTO products (name, description, price, category_id, subcategory_id, image, images, stock, seller_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
      `,
      args: [name, description || '', priceNum, categoryId, subcatId, image, JSON.stringify([image]), stockNum, sellerId]
    });

    const newProductId = insertResult.rows[0].id;

    // Log the initial stock inbound
    if (stockNum > 0) {
      await db.execute({
        sql: `
          INSERT INTO inventory_logs (product_id, product_name, activity_type, quantity_change, remaining_stock, performed_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [newProductId, name, "Stock Inbound", stockNum, stockNum, req.user ? req.user.name : "Admin"]
      });
    }

    // Fetch full new product with category
    const finalResult = await db.execute({
      sql: `
        SELECT p.*, c.name as category 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `,
      args: [newProductId]
    });

    const formatted = formatProductRow(finalResult.rows[0]);
    const enriched = enrichProduct(formatted, pathMap, rootCategoryMap);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Get current product
    const currentResult = await db.execute({
      sql: "SELECT * FROM products WHERE id = ?",
      args: [id]
    });

    const currentProduct = currentResult.rows[0];
    if (!currentProduct) {
      res.status(404);
      throw new Error(`Product with ID ${req.params.id} not found`);
    }

    // Ownership check if user is a seller
    if (req.user && req.user.role === 'seller') {
      const sellerRes = await db.execute({
        sql: "SELECT id FROM sellers WHERE email = ?",
        args: [req.user.email.toLowerCase()]
      });
      const sellerId = sellerRes.rows[0]?.id;
      if (currentProduct.seller_id !== sellerId) {
        res.status(403);
        throw new Error('Access denied: You do not own this product');
      }
    }

    const { name, description, price, category, subcategory_id, stock } = req.body;

    let categoryId = currentProduct.category_id;
    if (category !== undefined) {
      // Resolve category ID
      let categoryResult = await db.execute({
        sql: "SELECT id FROM categories WHERE LOWER(name) = ?",
        args: [category.toLowerCase()]
      });

      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      } else {
        // Create new category if it doesn't exist
        const newCatResult = await db.execute({
          sql: "INSERT INTO categories (name, description) VALUES (?, ?) RETURNING id",
          args: [category, `${category} category products`]
        });
        categoryId = newCatResult.rows[0].id;
      }
    }

    let subcatId = currentProduct.subcategory_id;
    if (subcategory_id !== undefined) {
      subcatId = subcategory_id ? parseInt(subcategory_id) : null;
    }

    const updatedName = name !== undefined ? name : currentProduct.name;
    const updatedDesc = description !== undefined ? description : currentProduct.description;
    
    let priceNum = currentProduct.price;
    if (price !== undefined) {
      priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        res.status(400);
        throw new Error('Product price must be a valid positive number');
      }
    }

    let stockNum = currentProduct.stock;
    if (stock !== undefined) {
      stockNum = parseInt(stock);
      if (isNaN(stockNum) || stockNum < 0) {
        res.status(400);
        throw new Error('Product stock must be a non-negative integer');
      }
      
      const stockDelta = stockNum - currentProduct.stock;
      if (stockDelta !== 0) {
        await db.execute({
          sql: `
            INSERT INTO inventory_logs (product_id, product_name, activity_type, quantity_change, remaining_stock, performed_by)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          args: [currentProduct.id, updatedName, "Stock Adjustment", stockDelta, stockNum, req.user ? req.user.name : "Admin"]
        });
      }
    }

    // Fetch path map to resolve details and validate
    const { pathMap, rootCategoryMap } = await getCategoryPathMap();
    let subCategory = null;
    let gender = null;
    let productType = null;
    let pathParts = null;

    if (subcatId && pathMap[subcatId]) {
      pathParts = pathMap[subcatId];
      subCategory = pathParts[0] || null;
      if (['Men', 'Women', 'Kids'].includes(pathParts[1])) {
        gender = pathParts[1];
        productType = pathParts[2] || null;
      } else {
        gender = null;
        productType = pathParts[1] || null;
      }
    }

    let categoryName = category;
    if (categoryName === undefined && categoryId) {
      const catRes = await db.execute({
        sql: "SELECT name FROM categories WHERE id = ?",
        args: [categoryId]
      });
      if (catRes.rows.length > 0) {
        categoryName = catRes.rows[0].name;
      }
    }

    // Fallback gender parsing if not resolved by subcategory path
    if (categoryName && categoryName.toLowerCase() === 'fashion' && !gender) {
      const allText = `${updatedName} ${updatedDesc}`.toLowerCase();
      if (/\bmen\b|\bmens\b|\bmale\b/.test(allText)) {
        gender = 'Men';
      } else if (/\bwomen\b|\bwomens\b|\bfemale\b|\blady\b|\bladies\b/.test(allText)) {
        gender = 'Women';
      } else if (/\bkids\b|\bboys\b|\bgirls\b|\bchild\b|\bchildren\b/.test(allText)) {
        gender = 'Kids';
      }
    }

    // If new image is uploaded, use it
    let updatedImage = req.file ? req.file.filename : currentProduct.image;

    // Validate
    if (categoryName) {
      validateProductMapping(categoryName, pathParts, updatedName, updatedDesc, updatedImage);
    }

    // Auto replacement of Unsplash images
    if (categoryName && categoryName.toLowerCase() === 'fashion' && gender) {
      updatedImage = getAutoReplaceImage(gender, subCategory, productType || subCategory, updatedImage);
    }

    // Perform Update
    await db.execute({
      sql: `
        UPDATE products 
        SET name = ?, description = ?, price = ?, category_id = ?, subcategory_id = ?, image = ?, images = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [updatedName, updatedDesc, priceNum, categoryId, subcatId, updatedImage, JSON.stringify([updatedImage]), stockNum, id]
    });

    // Fetch updated product with category
    const finalResult = await db.execute({
      sql: `
        SELECT p.*, c.name as category 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `,
      args: [id]
    });

    const formatted = formatProductRow(finalResult.rows[0]);
    const enriched = enrichProduct(formatted, pathMap, rootCategoryMap);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const checkResult = await db.execute({
      sql: "SELECT id, seller_id FROM products WHERE id = ?",
      args: [id]
    });

    const currentProduct = checkResult.rows[0];
    if (!currentProduct) {
      res.status(404);
      throw new Error(`Product with ID ${req.params.id} not found`);
    }

    // Ownership check if user is a seller
    if (req.user && req.user.role === 'seller') {
      const sellerRes = await db.execute({
        sql: "SELECT id FROM sellers WHERE email = ?",
        args: [req.user.email.toLowerCase()]
      });
      const sellerId = sellerRes.rows[0]?.id;
      if (currentProduct.seller_id !== sellerId) {
        res.status(403);
        throw new Error('Access denied: You do not own this product');
      }
    }

    // Delete Product
    await db.execute({
      sql: "DELETE FROM products WHERE id = ?",
      args: [id]
    });

    res.json({
      success: true,
      message: `Product with ID ${id} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};
