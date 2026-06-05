import { db } from '../data/db.js';

// Helper to get user's cart items from DB in standard format
const getUserCart = async (userId) => {
  const result = await db.execute({
    sql: `
      SELECT c.product_id as productId, p.name, p.price, p.image, c.quantity, p.discount, p.rating, c2.name as category, p.brand
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      LEFT JOIN categories c2 ON p.category_id = c2.id
      WHERE c.user_id = ?
    `,
    args: [userId]
  });
  return result.rows.map(row => {
    const isFullUrl = row.image && (row.image.startsWith('http://') || row.image.startsWith('https://'));
    return {
      ...row,
      image: isFullUrl ? row.image : `/uploads/${row.image}`,
      discount: row.discount || 0,
      rating: row.rating || 0.0
    };
  });
};

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      res.status(403);
      throw new Error('Access denied: Admins cannot view or manage a shopping cart');
    }
    const userId = req.user.id;
    const cart = await getUserCart(userId);
    
    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      res.status(403);
      throw new Error('Access denied: Admins cannot book or purchase products');
    }
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Please provide product ID');
    }

    const prodIdNum = parseInt(productId);
    const qtyNum = quantity !== undefined ? parseInt(quantity) : 1;

    if (isNaN(qtyNum) || qtyNum <= 0) {
      res.status(400);
      throw new Error('Quantity must be a positive integer');
    }

    // Find product in DB
    const prodResult = await db.execute({
      sql: "SELECT stock, name FROM products WHERE id = ?",
      args: [prodIdNum]
    });
    
    const product = prodResult.rows[0];
    if (!product) {
      res.status(404);
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Get existing item quantity in user cart
    const cartItemResult = await db.execute({
      sql: "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?",
      args: [userId, prodIdNum]
    });

    const existingQty = cartItemResult.rows.length > 0 ? cartItemResult.rows[0].quantity : 0;
    const targetQty = existingQty + qtyNum;

    // Check stock
    if (product.stock < targetQty) {
      res.status(400);
      throw new Error(`Insufficient stock. Only ${product.stock} items available`);
    }

    if (existingQty > 0) {
      // Update quantity
      await db.execute({
        sql: "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?",
        args: [targetQty, userId, prodIdNum]
      });
    } else {
      // Add new cart item with ON CONFLICT resolution for concurrent requests
      await db.execute({
        sql: `
          INSERT INTO cart (user_id, product_id, quantity) 
          VALUES (?, ?, ?)
          ON CONFLICT(user_id, product_id) 
          DO UPDATE SET 
            quantity = quantity + excluded.quantity,
            updated_at = CURRENT_TIMESTAMP
        `,
        args: [userId, prodIdNum, qtyNum]
      });
    }

    const updatedCart = await getUserCart(userId);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart quantity
 * @route   PUT /api/cart/:id
 * @access  Private
 */
export const updateCartQuantity = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      res.status(403);
      throw new Error('Access denied: Admins cannot manage a shopping cart');
    }
    const userId = req.user.id;
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      res.status(400);
      throw new Error('Please provide a valid positive quantity');
    }

    const qtyNum = parseInt(quantity);

    // Verify product exists in DB for stock comparison
    const prodResult = await db.execute({
      sql: "SELECT stock FROM products WHERE id = ?",
      args: [productId]
    });
    
    const product = prodResult.rows[0];
    if (!product) {
      res.status(404);
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Verify stock
    if (product.stock < qtyNum) {
      res.status(400);
      throw new Error(`Insufficient stock. Only ${product.stock} items available`);
    }

    // Verify item is already in user's cart
    const checkResult = await db.execute({
      sql: "SELECT id FROM cart WHERE user_id = ? AND product_id = ?",
      args: [userId, productId]
    });

    if (checkResult.rows.length === 0) {
      res.status(404);
      throw new Error(`Product ID ${productId} is not in your cart`);
    }

    // Update quantity in DB
    await db.execute({
      sql: "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?",
      args: [qtyNum, userId, productId]
    });

    const updatedCart = await getUserCart(userId);

    res.json({
      success: true,
      message: 'Cart quantity updated successfully',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:id
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      res.status(403);
      throw new Error('Access denied: Admins cannot manage a shopping cart');
    }
    const userId = req.user.id;
    const productId = parseInt(req.params.id);

    // Verify item is in cart
    const checkResult = await db.execute({
      sql: "SELECT id FROM cart WHERE user_id = ? AND product_id = ?",
      args: [userId, productId]
    });

    if (checkResult.rows.length === 0) {
      res.status(404);
      throw new Error(`Product ID ${productId} is not in your cart`);
    }

    // Delete item from cart DB
    await db.execute({
      sql: "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
      args: [userId, productId]
    });

    const updatedCart = await getUserCart(userId);

    res.json({
      success: true,
      message: 'Product removed from cart successfully',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await db.execute({
      sql: "DELETE FROM cart WHERE user_id = ?",
      args: [userId]
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: []
    });
  } catch (error) {
    next(error);
  }
};
