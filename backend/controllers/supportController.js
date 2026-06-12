import { db } from '../data/db.js';
import jwt from 'jsonwebtoken';

// Helper to authenticate user optionally
const getOptionalUser = async (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyhighmart2026');
      
      const result = await db.execute({
        sql: "SELECT id, name, email, role FROM users WHERE id = ?",
        args: [decoded.id]
      });

      if (result.rows.length > 0) {
        return result.rows[0];
      }
    } catch (err) {
      console.warn("Optional auth check failed:", err.message);
    }
  }
  return null;
};

/**
 * @desc    Handle chat messages for support chatbot
 * @route   POST /api/support/chat
 * @access  Public
 */
export const handleChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const user = await getOptionalUser(req);
    const cleanMsg = message.toLowerCase().trim();

    let reply = "";
    let options = ["📦 Track Orders", "🔍 Search Products", "💰 Refund Policy", "💬 Speak to Agent"];
    let data = {};
    let transferToAgent = false;

    // 1. Intent: Live Agent Handoff
    if (
      cleanMsg.includes('agent') || 
      cleanMsg.includes('human') || 
      cleanMsg.includes('representative') || 
      cleanMsg.includes('person') || 
      cleanMsg.includes('support staff') ||
      cleanMsg.includes('live chat') ||
      cleanMsg.includes('speak to') ||
      cleanMsg.includes('talk to')
    ) {
      reply = "Got it! I am transferring you to a customer support representative right now. A member of our team will join this chat in a moment.";
      transferToAgent = true;
      options = ["Cancel Handoff"];
    }
    // 2. Intent: Order Tracking
    else if (
      cleanMsg.includes('track') || 
      cleanMsg.includes('order') || 
      cleanMsg.includes('delivery') || 
      cleanMsg.includes('shipping') || 
      cleanMsg.includes('status') ||
      cleanMsg.includes('where is my') ||
      cleanMsg.includes('package')
    ) {
      if (!user) {
        reply = "I'd love to help you track your orders! Please log in to your account first so I can fetch your live order history.";
        options = ["Log In", "🔍 Search Products", "💰 Refund Policy"];
      } else {
        // Fetch user's orders
        const ordersResult = await db.execute({
          sql: `SELECT id, order_id, total_amount, status, created_at, customer_name, order_status, order_date, delivery_address 
                FROM orders 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 3`,
          args: [user.id]
        });

        if (ordersResult.rows.length === 0) {
          reply = `Hello ${user.name}, I checked your profile but it looks like you haven't placed any orders with us yet. Feel free to browse our products and add them to your cart!`;
          options = ["🔍 Browse Products", "💬 Speak to Agent"];
        } else {
          reply = `Here are your recent orders, ${user.name}. Click on the details below to view more information.`;
          
          // Format order items
          const formattedOrders = [];
          for (const row of ordersResult.rows) {
            const itemsResult = await db.execute({
              sql: `SELECT product_id, name, price, image, quantity FROM order_items WHERE order_id = ?`,
              args: [row.id]
            });
            formattedOrders.push({
              id: row.id,
              orderId: row.order_id || row.id.toString(),
              totalAmount: row.total_amount,
              status: row.order_status || row.status || 'Pending',
              date: row.order_date || row.created_at,
              items: itemsResult.rows
            });
          }
          data.orders = formattedOrders;
          options = ["🔍 Search Products", "💰 Refund Policy", "💬 Speak to Agent"];
        }
      }
    }
    // 3. Intent: Product Search
    else if (
      cleanMsg.includes('search') || 
      cleanMsg.includes('find') || 
      cleanMsg.includes('show me') || 
      cleanMsg.includes('buy') || 
      cleanMsg.includes('look for') || 
      cleanMsg.includes('do you have') ||
      cleanMsg.includes('shoes') ||
      cleanMsg.includes('headphones') ||
      cleanMsg.includes('chair') ||
      cleanMsg.includes('bottle') ||
      cleanMsg.includes('coffee')
    ) {
      // Extract keywords
      let searchKeyword = cleanMsg
        .replace(/search/g, '')
        .replace(/find/g, '')
        .replace(/show me/g, '')
        .replace(/buy/g, '')
        .replace(/look for/g, '')
        .replace(/do you have/g, '')
        .replace(/for/g, '')
        .replace(/any/g, '')
        .replace(/some/g, '')
        .trim();

      if (!searchKeyword) {
        reply = "What kind of products are you looking for? You can search for terms like 'shoes', 'headphones', or 'chair'!";
        options = ["Search Shoes", "Search Headphones", "Search Chair"];
      } else {
        // Query database
        const searchPattern = `%${searchKeyword}%`;
        const productsResult = await db.execute({
          sql: `SELECT p.id, p.name, p.price, p.image, p.stock, c.name as category 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(c.name) LIKE ?
                LIMIT 4`,
          args: [searchPattern, searchPattern, searchPattern]
        });

        if (productsResult.rows.length === 0) {
          reply = `I couldn't find any products matching "${searchKeyword}". Try checking our categories or search for another item.`;
          options = ["🔍 Browse Products", "📦 Track Orders", "💬 Speak to Agent"];
        } else {
          reply = `I found some matches for "${searchKeyword}"! Here they are:`;
          
          // Format images and fields for frontend display
          data.products = productsResult.rows.map(p => {
            let img = p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
            if (img && !img.startsWith('http')) {
              img = `/uploads/${img}`;
            }
            return {
              id: p.id,
              name: p.name,
              price: p.price,
              image: img,
              stock: p.stock
            };
          });
        }
      }
    }
    // 4. Intent: Refund Policy
    else if (
      cleanMsg.includes('refund') || 
      cleanMsg.includes('return') || 
      cleanMsg.includes('cancel') || 
      cleanMsg.includes('replace') || 
      cleanMsg.includes('policy')
    ) {
      reply = "Our policy allows free **returns & refunds within 30 days** of delivery. Items must be unused, in their original packaging, and with tags attached. Shipping is covered if the return is due to a defect or error on our end. To initiate a return, go to your order history and click 'Return Item' next to the completed order.";
      options = ["📦 Track Orders", "🔍 Search Products", "💬 Speak to Agent"];
    }
    // 5. Intent: Cart & Checkout Help
    else if (
      cleanMsg.includes('checkout') || 
      cleanMsg.includes('cart') || 
      cleanMsg.includes('payment') || 
      cleanMsg.includes('pay') || 
      cleanMsg.includes('discount') || 
      cleanMsg.includes('coupon')
    ) {
      reply = "To purchase items in your cart, click the shopping cart icon at the top right, review your selections, and click the 'Checkout' button. We support secure Stripe credit card payments, PayPal, and Cash on Delivery (COD) for your convenience.";
      options = ["📦 Track Orders", "🔍 Search Products"];
    }
    // 6. Intent: Greetings
    else if (
      cleanMsg.includes('hi') || 
      cleanMsg.includes('hello') || 
      cleanMsg.includes('hey') || 
      cleanMsg.includes('greetings') || 
      cleanMsg.includes('morning') || 
      cleanMsg.includes('evening') || 
      cleanMsg.includes('wassup')
    ) {
      const greetingName = user ? `, ${user.name}` : "";
      reply = `Hello${greetingName}! I'm the High-Mart virtual shopping assistant. 🛍️ How can I help you today? You can ask me to search products, track orders, or explain our refund policy.`;
    }
    // 7. Fallback Default Response
    else {
      reply = "I'm not sure I quite understand your question. I am a virtual assistant, but I can help you find products, check refund policies, track orders, or connect you to our support staff.";
    }

    // Send Response
    res.json({
      success: true,
      response: reply,
      options,
      data,
      transferToAgent
    });

  } catch (error) {
    next(error);
  }
};
