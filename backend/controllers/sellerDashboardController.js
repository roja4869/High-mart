import { db } from '../data/db.js';

// Helper to map request/seller/dashboard to camelCase for frontend
const mapSellerToCamel = (s) => {
  if (!s) return null;
  
  let docs = {};
  try {
    if (s.document_urls) {
      docs = JSON.parse(s.document_urls);
    }
  } catch (e) {
    console.error("Failed to parse document_urls in profile map:", e.message);
  }

  return {
    id: s.id,
    sellerRequestId: s.seller_request_id,
    fullName: s.full_name,
    email: s.email,
    phone: s.phone,
    businessName: s.business_name,
    gstNumber: s.gst_number,
    panNumber: s.pan_number,
    address: s.address,
    businessAddress: s.address,
    city: s.city,
    state: s.state,
    pincode: s.pincode,
    bankName: s.branch_name, // branch_name -> bankName
    accountHolderName: s.account_holder_name,
    accountNumber: s.bank_account_number, // bank_account_number -> accountNumber
    ifscCode: s.ifsc_code,
    profileImage: s.profile_image,
    profilePhoto: s.profile_image, // Compatibility
    gstCertificate: docs.gstCertificate || null,
    panCard: docs.panCard || null,
    bankProof: docs.bankProof || null,
    cancelledCheque: docs.bankProof || null,
    identityProof: docs.identityProof || null,
    businessLicense: docs.identityProof || null,
    status: s.status,
    createdAt: s.created_at,
    updatedAt: s.updated_at
  };
};

const mapDashboardToCamel = (d, status, businessName, registeredDate) => {
  if (!d) return null;
  return {
    status: status || d.application_status || 'Pending',
    businessName: businessName || '',
    registeredDate: registeredDate || d.created_at,
    totalProducts: d.total_products || 0,
    totalOrders: d.total_orders || 0,
    pendingOrders: d.pending_orders || 0,
    completedOrders: d.completed_orders || 0,
    cancelledOrders: d.cancelled_orders || 0,
    totalRevenue: d.total_revenue || 0,
    walletBalance: d.wallet_balance || 0,
    rating: d.rating || 0,
    lastLogin: d.last_login
  };
};

/**
 * @desc    Get Seller Dashboard stats
 * @route   GET /api/seller/dashboard
 * @access  Private (Seller Only)
 */
export const getSellerDashboard = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase();

    // 1. Fetch from sellers table
    const sellerResult = await db.execute({
      sql: "SELECT id, status, business_name, created_at FROM sellers WHERE email = ?",
      args: [userEmail]
    });

    const seller = sellerResult.rows[0];
    if (!seller) {
      // Fallback: Check seller_requests table to see if it is pending/rejected
      const requestResult = await db.execute({
        sql: "SELECT status, business_name, created_at, admin_remarks FROM seller_requests WHERE email = ?",
        args: [userEmail]
      });
      const request = requestResult.rows[0];
      if (!request) {
        return res.json({
          status: "NOT_REGISTERED",
          businessName: "",
          registeredDate: new Date().toISOString(),
          adminRemarks: "",
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          deliveredOrders: 0
        });
      }
      return res.json({
        status: request.status,
        businessName: request.business_name,
        registeredDate: request.created_at,
        adminRemarks: request.admin_remarks || '',
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        deliveredOrders: 0
      });
    }

    const sellerId = seller.id;

    // 2. Fetch stats from seller_dashboard
    const dashboardResult = await db.execute({
      sql: "SELECT * FROM seller_dashboard WHERE seller_id = ?",
      args: [sellerId]
    });

    const dbStats = dashboardResult.rows[0];
    if (!dbStats) {
      return res.json({
        status: seller.status,
        businessName: seller.business_name,
        registeredDate: seller.created_at,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        deliveredOrders: 0
      });
    }

    const stats = mapDashboardToCamel(dbStats, seller.status, seller.business_name, seller.created_at);
    stats.deliveredOrders = dbStats.completed_orders || 0;

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Seller Profile details
 * @route   GET /api/seller/profile
 * @access  Private (Seller Only)
 */
export const getSellerProfile = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase();

    const result = await db.execute({
      sql: "SELECT * FROM sellers WHERE email = ?",
      args: [userEmail]
    });

    const seller = result.rows[0];
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const profile = mapSellerToCamel(seller);
    res.json({
      success: true,
      profile
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Seller Profile
 * @route   PUT /api/seller/profile
 * @access  Private (Seller Only)
 */
export const updateSellerProfile = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase();

    // Find current seller record
    const sellerResult = await db.execute({
      sql: "SELECT * FROM sellers WHERE email = ?",
      args: [userEmail]
    });

    const currentSeller = sellerResult.rows[0];
    if (!currentSeller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const {
      phone, businessAddress, city, state, pincode,
      accountHolderName, bankName, ifscCode, profilePhoto
    } = req.body;

    const updatedPhone = phone !== undefined ? phone : currentSeller.phone;
    const updatedAddress = businessAddress !== undefined ? businessAddress : currentSeller.address;
    const updatedCity = city !== undefined ? city : currentSeller.city;
    const updatedState = state !== undefined ? state : currentSeller.state;
    const updatedPincode = pincode !== undefined ? pincode : currentSeller.pincode;
    const updatedHolder = accountHolderName !== undefined ? accountHolderName : currentSeller.account_holder_name;
    const updatedBank = bankName !== undefined ? bankName : currentSeller.branch_name; // bankName -> branch_name
    const updatedIfsc = ifscCode !== undefined ? ifscCode : currentSeller.ifsc_code;
    const updatedPhoto = profilePhoto !== undefined ? profilePhoto : currentSeller.profile_image;

    // Update sellers table
    await db.execute({
      sql: `UPDATE sellers SET 
              phone = ?, 
              address = ?, 
              city = ?, 
              state = ?, 
              pincode = ?, 
              account_holder_name = ?, 
              branch_name = ?, 
              ifsc_code = ?, 
              profile_image = ?,
              updated_at = CURRENT_TIMESTAMP 
            WHERE email = ?`,
      args: [
        updatedPhone,
        updatedAddress,
        updatedCity,
        updatedState,
        updatedPincode,
        updatedHolder,
        updatedBank,
        updatedIfsc,
        updatedPhoto,
        userEmail
      ]
    });

    // Update user record
    await db.execute({
      sql: `UPDATE users SET 
              phone = ?, 
              avatar = ?,
              updated_at = CURRENT_TIMESTAMP 
            WHERE email = ?`,
      args: [
        updatedPhone,
        updatedPhoto || null,
        userEmail
      ]
    });

    // Fetch updated seller
    const finalResult = await db.execute({
      sql: "SELECT * FROM sellers WHERE email = ?",
      args: [userEmail]
    });

    const profile = mapSellerToCamel(finalResult.rows[0]);

    res.json({
      success: true,
      message: 'Seller profile updated successfully',
      profile
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Seller Application Status
 * @route   GET /api/seller/status
 * @access  Private (Seller Only)
 */
export const getSellerStatus = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const result = await db.execute({
      sql: "SELECT status, admin_remarks, approved_at FROM seller_requests WHERE email = ?",
      args: [userEmail]
    });
    const request = result.rows[0];
    if (!request) {
      return res.json({
        status: "NOT_REGISTERED",
        adminRemarks: "",
        approvedAt: null
      });
    }
    res.json({
      status: request.status,
      adminRemarks: request.admin_remarks || "",
      approvedAt: request.approved_at || null
    });
  } catch (err) {
    next(err);
  }
};
