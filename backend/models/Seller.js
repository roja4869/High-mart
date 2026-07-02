import { db } from '../data/db.js';

export const SellerModel = {
  /**
   * Create a new seller application record.
   */
  create: async (data) => {
    const result = await db.execute({
      sql: `INSERT INTO sellers (
              fullName, email, phone, password, businessName, gstNumber, panNumber,
              businessAddress, city, state, pincode, accountHolderName, bankName,
              accountNumber, ifscCode, upiId, gstCertificate, panCard, cancelledCheque,
              businessLicense, profilePhoto
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id, fullName, email, phone, businessName, status, submittedAt`,
      args: [
        data.fullName,
        data.email.toLowerCase(),
        data.phone,
        data.password,
        data.businessName,
        data.gstNumber,
        data.panNumber,
        data.businessAddress,
        data.city,
        data.state,
        data.pincode,
        data.accountHolderName,
        data.bankName,
        data.accountNumber,
        data.ifscCode,
        data.upiId || null,
        data.gstCertificate || null,
        data.panCard || null,
        data.cancelledCheque || null,
        data.businessLicense || null,
        data.profilePhoto || null
      ]
    });
    return result.rows[0];
  },

  /**
   * Find seller by ID.
   */
  findById: async (id) => {
    const result = await db.execute({
      sql: "SELECT * FROM sellers WHERE id = ?",
      args: [id]
    });
    return result.rows[0] || null;
  },

  /**
   * Find seller by email or phone.
   */
  findByEmailOrPhone: async (email, phone) => {
    const result = await db.execute({
      sql: "SELECT id, email, phone FROM sellers WHERE email = ? OR phone = ?",
      args: [email.toLowerCase(), phone]
    });
    return result.rows;
  },

  /**
   * Find all seller applications.
   */
  findAll: async () => {
    const result = await db.execute({
      sql: "SELECT * FROM sellers ORDER BY submittedAt DESC"
    });
    return result.rows;
  },

  /**
   * Find all pending seller applications.
   */
  findPending: async () => {
    const result = await db.execute({
      sql: `SELECT * FROM sellers 
            WHERE status = 'Pending Approval' OR status = 'Pending'
            ORDER BY submittedAt DESC`
    });
    return result.rows;
  },

  /**
   * Find all approved sellers.
   */
  findApproved: async () => {
    const result = await db.execute({
      sql: "SELECT * FROM sellers WHERE status = 'Approved' ORDER BY submittedAt DESC"
    });
    return result.rows;
  },

  /**
   * Find all rejected sellers.
   */
  findRejected: async () => {
    const result = await db.execute({
      sql: "SELECT * FROM sellers WHERE status = 'Rejected' ORDER BY submittedAt DESC"
    });
    return result.rows;
  },

  /**
   * Approve seller application and record admin who approved it.
   */
  approveApplication: async (id, adminId) => {
    const currentDate = new Date().toISOString();
    const result = await db.execute({
      sql: `UPDATE sellers 
            SET status = 'Approved', 
                isApproved = 1, 
                approvedBy = ?, 
                approvedAt = ?, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? 
            RETURNING *`,
      args: [adminId, currentDate, id]
    });
    return result.rows[0] || null;
  },

  /**
   * Reject seller application with a rejection reason.
   */
  rejectApplication: async (id, reason) => {
    const currentDate = new Date().toISOString();
    const result = await db.execute({
      sql: `UPDATE sellers 
            SET status = 'Rejected', 
                isApproved = 0, 
                rejectionReason = ?, 
                rejectedAt = ?, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? 
            RETURNING *`,
      args: [reason, currentDate, id]
    });
    return result.rows[0] || null;
  }
};

export const Seller = {
  findOne: async (queryObj) => {
    const orArr = queryObj.$or || [];
    const emailItem = orArr.find(item => item.email !== undefined) || {};
    const phoneItem = orArr.find(item => item.phone !== undefined) || {};
    
    // Normalize values
    const emailVal = emailItem.email ? String(emailItem.email).toLowerCase().trim() : '';
    const phoneVal = phoneItem.phone ? String(phoneItem.phone).trim() : '';

    console.log('[MONGODB QUERY SIMULATION] Checking email or phone duplicate for:', { email: emailVal, phone: phoneVal });
    
    // Check sellers table
    const checkSeller = await db.execute({
      sql: "SELECT id, email, phone FROM sellers WHERE email = ? OR phone = ?",
      args: [emailVal, phoneVal]
    });
    if (checkSeller.rows.length > 0) {
      console.log('[MONGODB QUERY SIMULATION] Match found in sellers table:', checkSeller.rows[0]);
      return checkSeller.rows[0];
    }

    // Check seller_requests table (for pending requests)
    const checkRequest = await db.execute({
      sql: "SELECT id, email, phone FROM seller_requests WHERE email = ? OR phone = ?",
      args: [emailVal, phoneVal]
    });
    if (checkRequest.rows.length > 0) {
      console.log('[MONGODB QUERY SIMULATION] Match found in seller_requests table:', checkRequest.rows[0]);
      return checkRequest.rows[0];
    }

    // Check users table to prevent collision
    const checkUser = await db.execute({
      sql: "SELECT id, email, phone FROM users WHERE email = ? OR phone = ?",
      args: [emailVal, phoneVal]
    });
    if (checkUser.rows.length > 0) {
      console.log('[MONGODB QUERY SIMULATION] Match found in users table:', checkUser.rows[0]);
      return checkUser.rows[0];
    }

    console.log('[MONGODB QUERY SIMULATION] No duplicates found.');
    return null;
  }
};
