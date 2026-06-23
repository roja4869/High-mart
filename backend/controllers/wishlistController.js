import { db } from '../data/db.js';

/**
 * @desc    Get user's wishlist items
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await db.execute({
      sql: `
        SELECT p.*, c.name as category 
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = ?
      `,
      args: [userId]
    });

    res.json({
      success: true,
      count: result.rows.length,
      wishlist: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const prodIdNum = parseInt(productId);

    if (!productId || isNaN(prodIdNum)) {
      res.status(400);
      throw new Error('Please provide a valid product ID');
    }

    // Verify product exists in DB
    const prodCheck = await db.execute({
      sql: "SELECT id FROM products WHERE id = ?",
      args: [prodIdNum]
    });

    if (prodCheck.rows.length === 0) {
      res.status(404);
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Insert into wishlist, ignoring if already exists (via UNIQUE constraint)
    await db.execute({
      sql: "INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)",
      args: [userId, prodIdNum]
    });

    // Fetch updated wishlist to return
    const updatedResult = await db.execute({
      sql: `
        SELECT p.*, c.name as category 
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = ?
      `,
      args: [userId]
    });

    res.json({
      success: true,
      message: 'Product added to wishlist successfully',
      wishlist: updatedResult.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);

    if (isNaN(productId)) {
      res.status(400);
      throw new Error('Please provide a valid product ID');
    }

    // Verify item is in wishlist
    const checkResult = await db.execute({
      sql: "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
      args: [userId, productId]
    });

    if (checkResult.rows.length === 0) {
      res.status(404);
      throw new Error(`Product ID ${productId} is not in your wishlist`);
    }

    // Delete from wishlist
    await db.execute({
      sql: "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      args: [userId, productId]
    });

    // Fetch updated wishlist to return
    const updatedResult = await db.execute({
      sql: `
        SELECT p.*, c.name as category 
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = ?
      `,
      args: [userId]
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist successfully',
      wishlist: updatedResult.rows
    });
  } catch (error) {
    next(error);
  }
};
