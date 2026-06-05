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
    gender = pathParts[1] || null;
    productType = pathParts[2] || null;
    
    if (rootCategoryMap[product.subcategory_id]) {
      product.category = rootCategoryMap[product.subcategory_id];
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
    const { category, search, category_id, subcategory_id } = req.query;
    
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

    res.json({
      success: true,
      count: enriched.length,
      products: enriched
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

    const formatted = formatProductRow(product);
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

    // Handle image file name
    const image = req.file ? req.file.filename : 'default_product.jpg';

    // Insert Product
    const insertResult = await db.execute({
      sql: `
        INSERT INTO products (name, description, price, category_id, subcategory_id, image, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id
      `,
      args: [name, description || '', priceNum, categoryId, subcatId, image, stockNum]
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

    const { pathMap, rootCategoryMap } = await getCategoryPathMap();
    const enriched = enrichProduct(finalResult.rows[0], pathMap, rootCategoryMap);

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

    // If new image is uploaded, use it
    const updatedImage = req.file ? req.file.filename : currentProduct.image;

    // Perform Update
    await db.execute({
      sql: `
        UPDATE products 
        SET name = ?, description = ?, price = ?, category_id = ?, subcategory_id = ?, image = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [updatedName, updatedDesc, priceNum, categoryId, subcatId, updatedImage, stockNum, id]
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

    const { pathMap, rootCategoryMap } = await getCategoryPathMap();
    const enriched = enrichProduct(finalResult.rows[0], pathMap, rootCategoryMap);

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
      sql: "SELECT id FROM products WHERE id = ?",
      args: [id]
    });

    if (checkResult.rows.length === 0) {
      res.status(404);
      throw new Error(`Product with ID ${req.params.id} not found`);
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
