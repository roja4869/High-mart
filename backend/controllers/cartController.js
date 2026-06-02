import { carts, products } from '../data/mockDb.js';

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Initialize cart if not exists
    if (!carts[userId]) {
      carts[userId] = [];
    }

    res.json({
      success: true,
      cart: carts[userId]
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
    const product = products.find(p => p.id === prodIdNum);
    if (!product) {
      res.status(404);
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Initialize cart if not exists
    if (!carts[userId]) {
      carts[userId] = [];
    }

    const userCart = carts[userId];
    const existingItemIndex = userCart.findIndex(item => item.productId === prodIdNum);

    // Calculate total quantity needed
    const targetQty = existingItemIndex > -1 ? userCart[existingItemIndex].quantity + qtyNum : qtyNum;

    // Check stock
    if (product.stock < targetQty) {
      res.status(400);
      throw new Error(`Insufficient stock. Only ${product.stock} items available`);
    }

    if (existingItemIndex > -1) {
      // Update quantity
      userCart[existingItemIndex].quantity = targetQty;
    } else {
      // Add new cart item
      userCart.push({
        productId: prodIdNum,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qtyNum
      });
    }

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: userCart
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
    const userId = req.user.id;
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      res.status(400);
      throw new Error('Please provide a valid positive quantity');
    }

    const qtyNum = parseInt(quantity);

    // Verify product exists in store for stock comparison
    const product = products.find(p => p.id === productId);
    if (!product) {
      res.status(404);
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Verify stock
    if (product.stock < qtyNum) {
      res.status(400);
      throw new Error(`Insufficient stock. Only ${product.stock} items available`);
    }

    // Initialize cart if not exists
    if (!carts[userId]) {
      carts[userId] = [];
    }

    const userCart = carts[userId];
    const itemIndex = userCart.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      res.status(404);
      throw new Error(`Product ID ${productId} is not in your cart`);
    }

    // Update quantity
    userCart[itemIndex].quantity = qtyNum;

    res.json({
      success: true,
      message: 'Cart quantity updated successfully',
      cart: userCart
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
    const userId = req.user.id;
    const productId = parseInt(req.params.id);

    if (!carts[userId]) {
      carts[userId] = [];
    }

    const userCart = carts[userId];
    const itemIndex = userCart.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      res.status(404);
      throw new Error(`Product ID ${productId} is not in your cart`);
    }

    // Remove item from cart array
    userCart.splice(itemIndex, 1);

    res.json({
      success: true,
      message: 'Product removed from cart successfully',
      cart: userCart
    });
  } catch (error) {
    next(error);
  }
};
