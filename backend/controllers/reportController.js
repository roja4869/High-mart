import { db } from '../data/db.js';

/**
 * @desc    Get reports overview stats
 * @route   GET /api/reports/stats
 * @access  Private/Admin
 */
export const getStats = async (req, res, next) => {
  try {
    // 1. Total Revenue
    const revResult = await db.execute("SELECT SUM(total_amount) as total FROM orders WHERE status != 'Cancelled'");
    const totalRevenue = revResult.rows[0].total || 0;

    // 2. Total Orders Count
    const ordersResult = await db.execute("SELECT COUNT(*) as count FROM orders");
    const totalOrders = ordersResult.rows[0].count || 0;

    // 3. Registered Users Count
    const usersResult = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const totalUsers = usersResult.rows[0].count || 0;

    // 4. Low stock count
    const stockResult = await db.execute("SELECT COUNT(*) as count FROM products WHERE stock <= 5");
    const lowStockAlerts = stockResult.rows[0].count || 0;

    // 5. Awaiting action (Pending or Processing orders)
    const actionResult = await db.execute("SELECT COUNT(*) as count FROM orders WHERE status IN ('Pending', 'Processing')");
    const awaitingAction = actionResult.rows[0].count || 0;

    res.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        totalUsers,
        lowStockAlerts,
        awaitingAction
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sales charts and breakdown details
 * @route   GET /api/reports/charts
 * @access  Private/Admin
 */
export const getCharts = async (req, res, next) => {
  try {
    // 1. Sales over time (last 7 days)
    const salesMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesMap[dateStr] = 0;
    }

    // Accumulate actual order amounts from last 7 days non-cancelled orders
    const ordersResult = await db.execute(
      "SELECT total_amount as totalAmount, created_at as createdAt FROM orders WHERE status != 'Cancelled'"
    );

    ordersResult.rows.forEach(order => {
      const orderDateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (salesMap[orderDateStr] !== undefined) {
        salesMap[orderDateStr] += order.totalAmount;
      }
    });

    const salesOverTime = Object.keys(salesMap).map(date => ({
      date,
      amount: parseFloat(salesMap[date].toFixed(2))
    }));

    // 2. Category Performance Shares
    const categoryResult = await db.execute(`
      SELECT COALESCE(c.name, 'General') as category, SUM(oi.price * oi.quantity) as value
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE o.status != 'Cancelled'
      GROUP BY category
    `);

    const categoryBreakdown = categoryResult.rows.map(row => ({
      category: row.category,
      value: parseFloat(row.value.toFixed(2))
    }));

    // 3. Top Products Sold
    const topProdResult = await db.execute(`
      SELECT oi.name, SUM(oi.quantity) as qty, SUM(oi.price * oi.quantity) as revenue, oi.image
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'Cancelled'
      GROUP BY oi.name, oi.image
      ORDER BY qty DESC
      LIMIT 3
    `);

    const topProducts = topProdResult.rows.map(p => ({
      name: p.name,
      qty: p.qty,
      revenue: parseFloat(p.revenue.toFixed(2)),
      image: p.image
    }));

    // 4. Recent activity log (past 4 orders)
    const recentResult = await db.execute(`
      SELECT o.id, u.name as customerName, o.total_amount as totalAmount, o.status, o.created_at as createdAt
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 4
    `);

    const recentOrders = recentResult.rows.map(o => ({
      id: o.id,
      customerName: o.customerName || 'Guest Shopper',
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt
    }));

    res.json({
      success: true,
      charts: {
        salesOverTime,
        categoryBreakdown,
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inventory logs list
 * @route   GET /api/reports/inventory-logs
 * @access  Private/Admin
 */
export const getInventoryLogs = async (req, res, next) => {
  try {
    const logsResult = await db.execute(`
      SELECT id, product_id as productId, product_name as productName, activity_type as activityType, 
             quantity_change as quantityChange, remaining_stock as remainingStock, performed_by as performedBy, 
             timestamp 
      FROM inventory_logs 
      ORDER BY timestamp DESC
    `);

    res.json({
      success: true,
      count: logsResult.rows.length,
      logs: logsResult.rows
    });
  } catch (error) {
    next(error);
  }
};
