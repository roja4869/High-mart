import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../data/db.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

const uuidv4 = () => crypto.randomUUID();

// Detailed SQL error logger
const logSqlError = (tableName, query, params, err) => {
  console.error(`\n[SQL ERROR] Table Target: ${tableName}`);
  console.error(`SQL Query executed: ${query}`);
  console.error(`SQL Parameters bound:`, params);
  console.error(`Complete SQLite/Turso Error Message: ${err.message}`);
  if (err.stack) {
    console.error(`Stack trace:`, err.stack);
  }
  console.error('-------------------------------------\n');
};

// Compatibility mapper: DB snake_case with document_urls JSON -> Frontend camelCase
const mapRequestToCamel = (req) => {
  if (!req) return null;
  
  let docs = {};
  try {
    if (req.document_urls) {
      docs = JSON.parse(req.document_urls);
    }
  } catch (e) {
    console.error("Failed to parse document_urls JSON:", e.message);
  }

  return {
    id: req.id,
    sellerId: req.seller_id,
    fullName: req.full_name,
    email: req.email,
    phone: req.phone,
    businessName: req.business_name,
    gstNumber: req.gst_number,
    panNumber: req.pan_number,
    address: req.address,
    businessAddress: req.address, // compatibility
    city: req.city,
    state: req.state,
    pincode: req.pincode,
    bankName: req.branch_name, // branch_name -> bankName
    accountHolderName: req.account_holder_name,
    accountNumber: req.bank_account_number, // bank_account_number -> accountNumber
    ifscCode: req.ifsc_code,
    gstCertificate: docs.gstCertificate || null,
    panCard: docs.panCard || null,
    bankProof: docs.bankProof || null,
    cancelledCheque: docs.bankProof || null, // compatibility
    identityProof: docs.identityProof || null,
    businessLicense: docs.identityProof || null, // compatibility
    status: req.status,
    adminRemarks: req.admin_remarks,
    rejectionReason: req.admin_remarks, // compatibility
    submittedAt: req.submitted_at,
    approvedAt: req.approved_at,
    rejectedAt: req.rejected_at,
    createdAt: req.created_at,
    updatedAt: req.updated_at
  };
};

/**
 * @desc    Submit a seller registration request
 * @route   POST /api/seller/register
 * @access  Public
 */
export const submitSellerRequest = async (req, res, next) => {
  let query = '';
  let params = [];
  try {
    const {
      fullName, email, phone, password, confirmPassword,
      businessName, gstNumber, panNumber,
      businessAddress, city, state, pincode,
      accountHolderName, bankName, accountNumber, confirmAccountNumber,
      ifscCode
    } = req.body;

    // 1. Validation checks
    if (!fullName || !email || !phone || !password || !businessName || !gstNumber || !panNumber || !businessAddress || !city || !state || !pincode || !accountHolderName || !bankName || !accountNumber || !ifscCode) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({ error: 'Bank account numbers do not match.' });
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // IFSC validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid IFSC code format.' });
    }

    // Account number length check
    if (accountNumber.length < 9 || accountNumber.length > 18) {
      return res.status(400).json({ error: 'Account number must be between 9 and 18 digits.' });
    }

    const emailLower = email.toLowerCase();
    const phoneTrim = phone.trim();

    // Check unique constraints in users
    query = "SELECT id FROM users WHERE email = ? OR phone = ?";
    params = [emailLower, phoneTrim];
    const checkUser = await db.execute({ sql: query, args: params });
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email or phone number already exists.' });
    }

    // Check unique constraints in sellers
    query = "SELECT id, email, phone, gst_number, pan_number FROM sellers WHERE email = ? OR phone = ? OR gst_number = ? OR pan_number = ?";
    params = [emailLower, phoneTrim, gstNumber, panNumber];
    const checkSeller = await db.execute({ sql: query, args: params });
    if (checkSeller.rows.length > 0) {
      const match = checkSeller.rows[0];
      if (match.email === emailLower) return res.status(400).json({ error: 'Email already exists.' });
      if (match.phone === phoneTrim) return res.status(400).json({ error: 'Phone number already exists.' });
      if (match.gst_number === gstNumber) return res.status(400).json({ error: 'GST number already exists.' });
      if (match.pan_number === panNumber) return res.status(400).json({ error: 'PAN number already exists.' });
    }

    // Check unique constraints in pending requests
    query = "SELECT email, phone, gst_number, pan_number FROM seller_requests WHERE (email = ? OR phone = ? OR gst_number = ? OR pan_number = ?) AND status = 'Pending'";
    params = [emailLower, phoneTrim, gstNumber, panNumber];
    const checkRequest = await db.execute({ sql: query, args: params });
    if (checkRequest.rows.length > 0) {
      const match = checkRequest.rows[0];
      if (match.email === emailLower) return res.status(400).json({ error: 'A pending application with this email already exists.' });
      if (match.phone === phoneTrim) return res.status(400).json({ error: 'A pending application with this phone number already exists.' });
      if (match.gst_number === gstNumber) return res.status(400).json({ error: 'A pending application with this GST already exists.' });
      if (match.pan_number === panNumber) return res.status(400).json({ error: 'A pending application with this PAN already exists.' });
    }

    // 2. Validate document presence
    const files = req.files || {};
    const requiredDocs = ['gstCertificate', 'panCard', 'cancelledCheque', 'businessLicense'];
    for (const doc of requiredDocs) {
      if (!files[doc] || files[doc].length === 0) {
        return res.status(400).json({ error: `Document ${doc.replace(/([A-Z])/g, ' $1')} is required.` });
      }
    }

    // 3. Upload documents
    const documentUrls = {};
    const uploadFields = ['gstCertificate', 'panCard', 'cancelledCheque', 'businessLicense', 'profilePhoto'];
    for (const field of uploadFields) {
      if (files[field] && files[field].length > 0) {
        const fileObj = files[field][0];
        documentUrls[field] = await uploadToCloudinary(fileObj.path, 'seller_docs');
      }
    }

    // Map doc urls to a structured JSON object
    const docUrlsJson = JSON.stringify({
      gstCertificate: documentUrls.gstCertificate || null,
      panCard: documentUrls.panCard || null,
      bankProof: documentUrls.cancelledCheque || null,
      identityProof: documentUrls.businessLicense || null
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const requestId = uuidv4();

    // 4. Save request to seller_requests table
    query = `INSERT INTO seller_requests (
              id, seller_id, full_name, email, phone, password, business_name, gst_number, pan_number,
              bank_account_number, ifsc_code, account_holder_name, branch_name, address, city, state, pincode,
              document_urls, status
            ) VALUES (?, null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`;
    params = [
      requestId,
      fullName,
      emailLower,
      phoneTrim,
      hashedPassword,
      businessName,
      gstNumber,
      panNumber,
      accountNumber,
      ifscCode.toUpperCase(),
      accountHolderName,
      bankName,
      businessAddress,
      city,
      state,
      pincode,
      docUrlsJson
    ];

    await db.execute({ sql: query, args: params });

    // 4.1 Auto-provision user account with role='seller' so they can log in immediately
    await db.execute({
      sql: `INSERT INTO users (name, email, phone, password, role) 
            VALUES (?, ?, ?, ?, 'seller')`,
      args: [
        fullName,
        emailLower,
        phoneTrim,
        hashedPassword
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Seller application submitted successfully.'
    });
  } catch (err) {
    logSqlError('seller_requests', query, params, err);
    next(err);
  }
};

/**
 * @desc    Get all seller requests (newest first)
 * @route   GET /api/admin/seller-requests
 * @access  Private (Admin Only)
 */
export const getAllSellerRequests = async (req, res, next) => {
  let query = '';
  let params = [];
  try {
    query = "SELECT * FROM seller_requests ORDER BY created_at DESC";
    const result = await db.execute({ sql: query, args: params });
    const requests = result.rows.map(row => mapRequestToCamel(row));
    res.json({
      success: true,
      sellers: requests,
      requests: requests
    });
  } catch (err) {
    logSqlError('seller_requests', query, params, err);
    next(err);
  }
};

/**
 * @desc    Get single request detail
 * @route   GET /api/admin/seller-requests/:id
 * @access  Private (Admin Only)
 */
export const getSellerRequestById = async (req, res, next) => {
  let query = '';
  let params = [];
  try {
    query = "SELECT * FROM seller_requests WHERE id = ?";
    params = [req.params.id];
    const result = await db.execute({ sql: query, args: params });
    const request = result.rows[0];
    if (!request) {
      return res.status(404).json({ error: 'Seller request not found' });
    }
    const camelRequest = mapRequestToCamel(request);
    res.json({
      success: true,
      seller: camelRequest,
      request: camelRequest
    });
  } catch (err) {
    logSqlError('seller_requests', query, params, err);
    next(err);
  }
};

/**
 * @desc    Approve request, move into sellers table, create dashboard record, and user record
 * @route   PUT /api/admin/seller-requests/:id/approve
 * @access  Private (Admin Only)
 */
export const approveSellerRequest = async (req, res, next) => {
  let query = '';
  let params = [];
  try {
    query = "SELECT * FROM seller_requests WHERE id = ?";
    params = [req.params.id];
    const requestResult = await db.execute({ sql: query, args: params });
    const request = requestResult.rows[0];
    if (!request) {
      return res.status(404).json({ error: 'Seller request not found' });
    }

    if (request.status === 'Approved') {
      return res.status(400).json({ error: 'Request is already approved.' });
    }

    const currentDate = new Date().toISOString();
    const sellerId = uuidv4();

    // 1. Update status in seller_requests table
    query = `UPDATE seller_requests 
             SET status = 'Approved', seller_id = ?, approved_at = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`;
    params = [sellerId, currentDate, req.params.id];
    await db.execute({ sql: query, args: params });

    // 2. Move request into sellers table
    query = `INSERT INTO sellers (
              id, seller_request_id, full_name, email, phone, business_name, gst_number, pan_number,
              address, city, state, pincode, branch_name, account_holder_name, bank_account_number,
              ifsc_code, profile_image, document_urls, status, password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', ?)`;
    params = [
      sellerId,
      request.id,
      request.full_name,
      request.email.toLowerCase(),
      request.phone,
      request.business_name,
      request.gst_number,
      request.pan_number,
      request.address,
      request.city,
      request.state,
      request.pincode,
      request.branch_name,
      request.account_holder_name,
      request.bank_account_number,
      request.ifsc_code,
      null, // profile_image
      request.document_urls,
      request.password
    ];
    await db.execute({ sql: query, args: params });

    // 3. Automatically create dashboard record inside seller_dashboard
    query = `INSERT INTO seller_dashboard (
              id, seller_id, total_products, total_orders, pending_orders, completed_orders,
              cancelled_orders, total_revenue, wallet_balance, rating, application_status
            ) VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 'Approved')`;
    params = [uuidv4(), sellerId];
    await db.execute({ sql: query, args: params });

    // 4. Create user account in users table to enable login
    query = "SELECT id FROM users WHERE email = ?";
    params = [request.email.toLowerCase()];
    const checkUser = await db.execute({ sql: query, args: params });

    if (checkUser.rows.length === 0) {
      query = `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'seller')`;
      params = [
        request.full_name,
        request.email.toLowerCase(),
        request.phone,
        request.password
      ];
      await db.execute({ sql: query, args: params });
    }

    res.json({
      success: true,
      message: 'Seller request approved successfully.'
    });
  } catch (err) {
    logSqlError('Multiple-Tables', query, params, err);
    next(err);
  }
};

/**
 * @desc    Reject request with admin remarks
 * @route   PUT /api/admin/seller-requests/:id/reject
 * @access  Private (Admin Only)
 */
export const rejectSellerRequest = async (req, res, next) => {
  let query = '';
  let params = [];
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason remarks are required.' });
    }

    query = "SELECT * FROM seller_requests WHERE id = ?";
    params = [req.params.id];
    const requestResult = await db.execute({ sql: query, args: params });
    const request = requestResult.rows[0];
    if (!request) {
      return res.status(404).json({ error: 'Seller request not found' });
    }

    const currentDate = new Date().toISOString();

    // 1. Update status and admin_remarks in seller_requests
    query = `UPDATE seller_requests 
             SET status = 'Rejected', admin_remarks = ?, rejected_at = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`;
    params = [reason, currentDate, req.params.id];
    await db.execute({ sql: query, args: params });

    // 2. Also update status in sellers table if they exist there
    query = `UPDATE sellers SET status = 'Rejected', updated_at = CURRENT_TIMESTAMP WHERE seller_request_id = ?`;
    params = [request.id];
    await db.execute({ sql: query, args: params });

    // 3. Delete user account from users table if it exists (so they cannot log in)
    query = "DELETE FROM users WHERE email = ? AND role = 'seller'";
    params = [request.email.toLowerCase()];
    await db.execute({ sql: query, args: params });

    res.json({
      success: true,
      message: 'Seller request rejected successfully.'
    });
  } catch (err) {
    logSqlError('Multiple-Tables', query, params, err);
    next(err);
  }
};
