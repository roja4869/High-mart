import { orders, users, products, inventoryLogs } from '../data/mockDb.js';

/**
 * @desc    Get reports overview stats
 * @route   GET /api/reports/stats
 * @access  Private/Admin
 */
export const getStats = async (req, res, next) => {
  try {
    const activeOrders = orders.filter(o => o.status !== 'Cancelled');
    
    // 1. Total Revenue
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Total Orders Count
    const totalOrders = orders.length;

    // 3. Registered Users Count (excluding admins if we want, or total)
    const totalUsers = users.filter(u => u.role === 'user').length;

    // 4. Low stock count
    const lowStockAlerts = products.filter(p => p.stock <= 5).length;

    // 5. Awaiting action (Pending or Processing orders)
    const awaitingAction = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;

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
    const salesOverTime = [];
    const dateMap = {};

    // Pre-populate past 7 days with 0s
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap[dateStr] = 0;
    }

    // Accumulate actual order amounts
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        const orderDateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dateMap[orderDateStr] !== undefined) {
          dateMap[orderDateStr] += order.totalAmount;
        } else {
          // Fallback or older date
          dateMap[orderDateStr] = order.totalAmount;
        }
      }
    });

    Object.keys(dateMap).forEach(date => {
      salesOverTime.push({
        date,
        amount: parseFloat(dateMap[date].toFixed(2))
      });
    });

    // 2. Category Performance Shares
    const categoryShares = {};
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        order.items.forEach(item => {
          // Find matching category from pre-seeded or item list
          const prod = products.find(p => p.id === item.productId);
          const category = prod ? prod.category : 'General';
          
          if (!categoryShares[category]) {
            categoryShares[category] = 0;
          }
          categoryShares[category] += item.price * item.quantity;
        });
      }
    });

    const categoryBreakdown = Object.keys(categoryShares).map(category => ({
      category,
      value: parseFloat(categoryShares[category].toFixed(2))
    }));

    // 3. Top Products Sold
    const productQuantities = {};
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        order.items.forEach(item => {
          if (!productQuantities[item.name]) {
            productQuantities[item.name] = {
              name: item.name,
              qty: 0,
              revenue: 0,
              image: item.image
            };
          }
          productQuantities[item.name].qty += item.quantity;
          productQuantities[item.name].revenue += item.price * item.quantity;
        });
      }
    });

    const topProducts = Object.values(productQuantities)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3)
      .map(p => ({
        ...p,
        revenue: parseFloat(p.revenue.toFixed(2))
      }));

    // 4. Recent activity log (past 4 orders)
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
      .map(o => {
        const u = users.find(user => user.id === o.userId);
        return {
          id: o.id,
          customerName: u ? u.name : 'Guest Shopper',
          totalAmount: o.totalAmount,
          status: o.status,
          createdAt: o.createdAt
        };
      });

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
    const sortedLogs = [...inventoryLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({
      success: true,
      count: sortedLogs.length,
      logs: sortedLogs
    });
  } catch (error) {
    next(error);
  }
};
