import { db } from '../data/db.js';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    
    let sql = `
      SELECT p.*, c.name as category 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const args = [];

    // Filter by category name
    if (category) {
      sql += ` AND LOWER(c.name) = ?`;
      args.push(category.toLowerCase());
    }

    // Search by name or description
    if (search) {
      sql += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)`;
      const searchPattern = `%${search.toLowerCase()}%`;
      args.push(searchPattern, searchPattern);
    }

    const result = await db.execute({ sql, args });

    res.json({
      success: true,
      count: result.rows.length,
      products: result.rows
    });
  } catch (error) {
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
    
    const result = await db.execute({
      sql: `
        SELECT p.*, c.name as category 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `,
      args: [id]
    });

    const product = result.rows[0];

    if (!product) {
      res.status(404);
      throw new Error(`Product with ID ${req.params.id} not found`);
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
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
    const { name, description, price, category, stock } = req.body;

    if (!name || !price || !category || stock === undefined) {
      res.status(400);
      throw new Error('Please provide name, price, category, and stock quantity');
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);

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
        INSERT INTO products (name, description, price, category_id, image, stock)
        VALUES (?, ?, ?, ?, ?, ?) RETURNING id
      `,
      args: [name, description || '', priceNum, categoryId, image, stockNum]
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

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: finalResult.rows[0]
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

    const { name, description, price, category, stock } = req.body;

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
        SET name = ?, description = ?, price = ?, category_id = ?, image = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [updatedName, updatedDesc, priceNum, categoryId, updatedImage, stockNum, id]
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

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: finalResult.rows[0]
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
