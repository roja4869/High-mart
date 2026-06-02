import { orders, carts, products, inventoryLogs } from '../data/mockDb.js';

/**
 * @desc    Create a new order from cart
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod, paymentStatus, transactionId } = req.body;

    if (!shippingAddress) {
      res.status(400);
      throw new Error('Please provide a shipping address');
    }

    const userCart = carts[userId] || [];
    if (userCart.length === 0) {
      res.status(400);
      throw new Error('Your cart is empty. Please add items to your cart before checking out');
    }

    // Double check stock availability and decrement stock
    let totalAmount = 0;
    const itemsToOrder = [];

    for (const cartItem of userCart) {
      const product = products.find(p => p.id === cartItem.productId);
      
      if (!product) {
        res.status(404);
        throw new Error(`Product '${cartItem.name}' (ID: ${cartItem.productId}) no longer exists`);
      }

      if (product.stock < cartItem.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for '${product.name}'. Only ${product.stock} items left`);
      }

      // Decrement stock
      product.stock -= cartItem.quantity;

      // Accumulate price
      totalAmount += product.price * cartItem.quantity;

      itemsToOrder.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: cartItem.quantity
      });
    }

    // Calculate dynamic pricing totals
    const expressShippingFee = totalAmount > 100 ? 0 : 5.99;
    const estTax = totalAmount * 0.08;
    const codFee = paymentMethod === 'Cash on Delivery (COD)' ? 9.00 : 0;
    const grandTotal = totalAmount + expressShippingFee + estTax + codFee;

    // Create the order
    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      userId,
      items: itemsToOrder,
      totalAmount: parseFloat(grandTotal.toFixed(2)),
      shippingAddress,
      status: 'Pending',
      paymentMethod: paymentMethod || 'Stripe',
      paymentStatus: paymentStatus || 'Paid',
      transactionId: transactionId || `ch_mock_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    // Add inventory logs for each decremented stock
    for (const item of itemsToOrder) {
      const product = products.find(p => p.id === item.productId);
      inventoryLogs.push({
        id: inventoryLogs.length > 0 ? Math.max(...inventoryLogs.map(l => l.id)) + 1 : 1,
        productId: item.productId,
        productName: item.name,
        activityType: "Order Deduction",
        quantityChange: -item.quantity,
        remainingStock: product ? product.stock : 0,
        performedBy: `Order #HM-${newOrder.id} (${req.user?.name || 'Shopper'})`,
        timestamp: newOrder.createdAt
      });
    }

    // Empty the cart
    carts[userId] = [];

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's orders (admin gets all)
 * @route   GET /api/orders
 * @access  Private
 */
export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let userOrders = [];

    if (userRole === 'admin') {
      userOrders = [...orders];
    } else {
      userOrders = orders.filter(o => o.userId === userId);
    }

    res.json({
      success: true,
      count: userOrders.length,
      orders: userOrders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      res.status(404);
      throw new Error(`Order with ID ${req.params.id} not found`);
    }

    // Access control: only owner or admin can view
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to access this order');
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Please provide a valid status: ${allowedStatuses.join(', ')}`);
    }

    const order = orders.find(o => o.id === orderId);

    if (!order) {
      res.status(404);
      throw new Error(`Order with ID ${req.params.id} not found`);
    }

    // If order was cancelled and is now being marked back to something else, or vice-versa, handle stock.
    // Specifically, if shifting to Cancelled, restore stock.
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          product.stock += item.quantity;
        }
      }
    }

    order.status = status;

    res.json({
      success: true,
      message: `Order status updated to ${status} successfully`,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an order
 * @route   DELETE /api/orders/:id
 * @access  Private
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      res.status(404);
      throw new Error(`Order with ID ${req.params.id} not found`);
    }

    // Access control: only owner or admin can cancel
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    // Order can only be cancelled if it hasn't been shipped or delivered
    if (order.status === 'Shipped' || order.status === 'Delivered') {
      res.status(400);
      throw new Error(`Cannot cancel order. It has already been ${order.status.toLowerCase()}`);
    }

    if (order.status === 'Cancelled') {
      res.status(400);
      throw new Error('Order is already cancelled');
    }

    // Restore stock back to products
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stock += item.quantity;
      }
    }

    order.status = 'Cancelled';

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};
