import { db } from '../data/db.js';

// Helper to query orders and populate their items
const getOrderDetails = async (sqlWhere, args = []) => {
  const ordersResult = await db.execute({
    sql: `SELECT id, user_id as userId, total_amount as totalAmount, shipping_address as shippingAddress, 
                 status, payment_method as paymentMethod, payment_status as paymentStatus, 
                 transaction_id as transactionId, created_at as createdAt,
                 order_id as orderId, customer_name as customerName, customer_email as customerEmail,
                 customer_phone as customerPhone, order_status as orderStatus, order_date as orderDate,
                 delivery_address as deliveryAddress
          FROM orders WHERE ${sqlWhere} ORDER BY created_at DESC`,
    args
  });
  
  const formattedOrders = [];
  for (const row of ordersResult.rows) {
    const itemsResult = await db.execute({
      sql: `SELECT product_id as productId, name, price, image, quantity,
                   product_name as productName, product_image as productImage 
            FROM order_items WHERE order_id = ?`,
      args: [row.id]
    });
    formattedOrders.push({
      ...row,
      items: itemsResult.rows
    });
  }
  return formattedOrders;
};

/**
 * @desc    Create a new order from cart or request body
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod, paymentStatus, transactionId, totalAmount, customerName, customerEmail, customerPhone, items } = req.body;

    if (!shippingAddress) {
      res.status(400);
      throw new Error('Please provide a shipping address');
    }

    let orderItems = [];
    if (items && Array.isArray(items) && items.length > 0) {
      orderItems = items.map(item => ({
        productId: item.productId || item.id,
        name: item.name || item.productName || item.product_name,
        price: item.price,
        image: item.image || item.productImage || item.product_image,
        quantity: item.quantity
      }));
    }

    if (orderItems.length === 0) {
      // Retrieve cart items and current stocks
      const userCart = await db.execute({
        sql: `SELECT c.product_id as productId, p.name, p.price, p.image, c.quantity, p.stock
              FROM cart c
              JOIN products p ON c.product_id = p.id
              WHERE c.user_id = ?`,
        args: [userId]
      });
      orderItems = userCart.rows;
    }

    if (orderItems.length === 0) {
      res.status(400);
      throw new Error('Your cart is empty. Please add items to your cart before checking out');
    }

    // Double check stock availability and load current stock values
    for (const item of orderItems) {
      const prodResult = await db.execute({
        sql: "SELECT stock, name FROM products WHERE id = ?",
        args: [item.productId]
      });
      const product = prodResult.rows[0];
      const stock = product ? product.stock : 0;
      if (stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for '${item.name || item.productName}'. Only ${stock} items left`);
      }
      item.stock = stock;
    }

    // Calculate dynamic pricing totals
    let calculatedSubtotal = 0;
    for (const item of orderItems) {
      calculatedSubtotal += item.price * item.quantity;
    }
    const expressShippingFee = calculatedSubtotal > 100 ? 0 : 5.99;
    const estTax = calculatedSubtotal * 0.08;
    const codFee = paymentMethod === 'Cash on Delivery (COD)' ? 9.00 : 0;
    const grandTotal = totalAmount ? parseFloat(totalAmount) : parseFloat((calculatedSubtotal + expressShippingFee + estTax + codFee).toFixed(2));

    const txnId = transactionId || `ch_mock_${Date.now()}`;
    const pStatus = paymentStatus || (paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid');
    const orderIdStr = `HM-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    // Create the order
    const insertOrderResult = await db.execute({
      sql: `INSERT INTO orders (
              user_id, total_amount, shipping_address, status, payment_method, payment_status, transaction_id,
              order_id, customer_name, customer_email, customer_phone, order_status, order_date, delivery_address
            )
            VALUES (?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?) RETURNING id`,
      args: [
        userId,
        grandTotal,
        shippingAddress,
        paymentMethod || 'Stripe',
        pStatus,
        txnId,
        orderIdStr,
        customerName || req.user.name || 'Jane Doe',
        customerEmail || req.user.email || 'jane@example.com',
        customerPhone || '',
        new Date().toISOString(),
        shippingAddress
      ]
    });

    const newOrderId = insertOrderResult.rows[0].id;

    // Process each item: insert into order_items, decrement product stock, and log inventory activity
    for (const item of orderItems) {
      // 1. Insert order item
      await db.execute({
        sql: `INSERT INTO order_items (
                order_id, product_id, name, price, image, quantity,
                product_name, product_image
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newOrderId,
          item.productId,
          item.name,
          item.price,
          item.image,
          item.quantity,
          item.name,
          item.image
        ]
      });

      // 2. Decrement stock
      const newStock = item.stock - item.quantity;
      await db.execute({
        sql: `UPDATE products SET stock = ? WHERE id = ?`,
        args: [newStock, item.productId]
      });

      // 3. Log inventory activity
      await db.execute({
        sql: `INSERT INTO inventory_logs (product_id, product_name, activity_type, quantity_change, remaining_stock, performed_by)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          item.productId,
          item.name,
          "Order Deduction",
          -item.quantity,
          newStock,
          `Order #${orderIdStr} (${customerName || req.user?.name || 'Shopper'})`
        ]
      });
    }

    // Create a payment record in payments table
    const pStatusDetail = pStatus === 'Paid' ? 'Completed' : (pStatus === 'Failed' ? 'Failed' : 'Pending');
    await db.execute({
      sql: `INSERT INTO payments (order_id, user_id, amount, payment_method, status, transaction_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [newOrderId, userId, grandTotal, paymentMethod || 'Stripe', pStatusDetail, txnId]
    });

    // Empty the user's cart in DB
    await db.execute({
      sql: "DELETE FROM cart WHERE user_id = ?",
      args: [userId]
    });

    // Fetch full order to return
    const orderList = await getOrderDetails("id = ?", [newOrderId]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: orderList[0]
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
      userOrders = await getOrderDetails("1=1");
    } else {
      userOrders = await getOrderDetails("user_id = ?", [userId]);
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
    const orderList = await getOrderDetails("id = ?", [orderId]);
    const order = orderList[0];

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
 * @desc    Get user orders or single order dynamically
 * @route   GET /api/orders/:idOrUserId
 * @access  Private
 */
export const getOrdersOrOrderById = async (req, res, next) => {
  try {
    const param = parseInt(req.params.id);
    
    if (isNaN(param)) {
      res.status(400);
      throw new Error("Invalid parameter. ID must be an integer.");
    }

    // Check if the parameter matches an order ID first
    const orderCheck = await db.execute({
      sql: "SELECT id, user_id FROM orders WHERE id = ?",
      args: [param]
    });

    if (orderCheck.rows.length > 0) {
      // It is an order ID!
      const order = orderCheck.rows[0];
      
      // Access control: only owner or admin can view
      if (order.user_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to access this order');
      }

      const orderList = await getOrderDetails("id = ?", [param]);
      return res.json({
        success: true,
        order: orderList[0]
      });
    }

    // If it's not an order ID, check if it's a user ID
    const userCheck = await db.execute({
      sql: "SELECT id FROM users WHERE id = ?",
      args: [param]
    });

    if (userCheck.rows.length > 0) {
      // Access control: only the user themselves or an admin can fetch
      if (param !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to access these orders');
      }

      const rawOrders = await getOrderDetails("user_id = ?", [param]);
      
      // Map the orders to the flat array format expected by the frontend's OrderCard
      const formattedOrders = [];
      for (const order of rawOrders) {
        for (const item of order.items) {
          formattedOrders.push({
            orderId: order.orderId || order.id.toString(),
            date: order.orderDate || order.createdAt,
            productName: item.productName || item.name,
            price: item.price,
            productImage: item.productImage || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
            status: order.orderStatus || order.status || 'Pending',
            paymentMethod: order.paymentMethod,
            shippingAddress: {
              name: order.customerName || 'Customer',
              phone: order.customerPhone || '',
              street: order.deliveryAddress || order.shippingAddress,
              locality: '',
              city: '',
              state: '',
              pincode: ''
            }
          });
        }
      }

      return res.json({
        success: true,
        count: formattedOrders.length,
        orders: formattedOrders
      });
    }

    // If it matches neither, return 404
    res.status(404);
    throw new Error(`No user or order found with ID ${param}`);
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

    // Get order status
    const orderResult = await db.execute({
      sql: "SELECT id, status FROM orders WHERE id = ?",
      args: [orderId]
    });

    const currentOrder = orderResult.rows[0];
    if (!currentOrder) {
      res.status(404);
      throw new Error(`Order with ID ${req.params.id} not found`);
    }

    // Specifically, if shifting to Cancelled, restore stock.
    if (status === 'Cancelled' && currentOrder.status !== 'Cancelled') {
      const itemsResult = await db.execute({
        sql: "SELECT product_id, name, quantity FROM order_items WHERE order_id = ?",
        args: [orderId]
      });

      for (const item of itemsResult.rows) {
        const prodResult = await db.execute({
          sql: "SELECT stock, name FROM products WHERE id = ?",
          args: [item.product_id]
        });

        const product = prodResult.rows[0];
        if (product) {
          const newStock = product.stock + item.quantity;
          await db.execute({
            sql: "UPDATE products SET stock = ? WHERE id = ?",
            args: [newStock, item.product_id]
          });

          // Log inventory cancellation return
          await db.execute({
            sql: `INSERT INTO inventory_logs (product_id, product_name, activity_type, quantity_change, remaining_stock, performed_by)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [
              item.product_id,
              product.name,
              "Order Cancellation Return",
              item.quantity,
              newStock,
              req.user?.name || "Admin"
            ]
          });
        }
      }
    }

    // Update order status
    await db.execute({
      sql: "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [status, orderId]
    });

    const orderList = await getOrderDetails("id = ?", [orderId]);

    res.json({
      success: true,
      message: `Order status updated to ${status} successfully`,
      order: orderList[0]
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

    const orderResult = await db.execute({
      sql: "SELECT id, status, user_id FROM orders WHERE id = ?",
      args: [orderId]
    });

    const currentOrder = orderResult.rows[0];
    if (!currentOrder) {
      res.status(404);
      throw new Error(`Order with ID ${req.params.id} not found`);
    }

    // Access control: only owner or admin can cancel
    if (currentOrder.user_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    // Order can only be cancelled if it hasn't been shipped or delivered
    if (currentOrder.status === 'Shipped' || currentOrder.status === 'Delivered') {
      res.status(400);
      throw new Error(`Cannot cancel order. It has already been ${currentOrder.status.toLowerCase()}`);
    }

    if (currentOrder.status === 'Cancelled') {
      res.status(400);
      throw new Error('Order is already cancelled');
    }

    // Restore stock back to products
    const itemsResult = await db.execute({
      sql: "SELECT product_id, name, quantity FROM order_items WHERE order_id = ?",
      args: [orderId]
    });

    for (const item of itemsResult.rows) {
      const prodResult = await db.execute({
        sql: "SELECT stock, name FROM products WHERE id = ?",
        args: [item.product_id]
      });

      const product = prodResult.rows[0];
      if (product) {
        const newStock = product.stock + item.quantity;
        await db.execute({
          sql: "UPDATE products SET stock = ? WHERE id = ?",
          args: [newStock, item.product_id]
        });

        // Log cancellation return
        await db.execute({
          sql: `INSERT INTO inventory_logs (product_id, product_name, activity_type, quantity_change, remaining_stock, performed_by)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            item.product_id,
            product.name,
            "Order Cancellation Return",
            item.quantity,
            newStock,
            req.user?.name || "Shopper"
          ]
        });
      }
    }

    // Cancel the order
    await db.execute({
      sql: "UPDATE orders SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [orderId]
    });

    const orderList = await getOrderDetails("id = ?", [orderId]);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: orderList[0]
    });
  } catch (error) {
    next(error);
  }
};
