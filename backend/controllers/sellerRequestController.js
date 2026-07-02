import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../data/db.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { Seller } from '../models/Seller.js';

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
    profilePhoto: docs.profilePhoto || null,
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
    console.log('[REGISTRATION] Incoming request body:', req.body);
    console.log('[REGISTRATION] Uploaded files metadata:', req.files);

    const {
      fullName, email, phone, password, confirmPassword,
      businessName, gstNumber, panNumber,
      businessAddress, city, state, pincode,
      accountHolderName, bankName, accountNumber, confirmAccountNumber,
      ifscCode
    } = req.body;

    // 1. Validation checks
    if (!fullName || !email || !phone || !password || !businessName || !gstNumber || !panNumber || !businessAddress || !city || !state || !pincode || !accountHolderName || !bankName || !accountNumber || !ifscCode) {
      console.warn('[REGISTRATION] Validation failed: missing required fields');
      return res.status(400).json({ success: false, message: 'All fields are required.', error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      console.warn('[REGISTRATION] Validation failed: passwords do not match');
      return res.status(400).json({ success: false, message: 'Passwords do not match.', error: 'Passwords do not match.' });
    }

    if (accountNumber !== confirmAccountNumber) {
      console.warn('[REGISTRATION] Validation failed: bank account numbers do not match');
      return res.status(400).json({ success: false, message: 'Bank account numbers do not match.', error: 'Bank account numbers do not match.' });
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn('[REGISTRATION] Validation failed: invalid email format');
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.', error: 'Please enter a valid email address.' });
    }

    // IFSC validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      console.warn('[REGISTRATION] Validation failed: invalid IFSC format');
      return res.status(400).json({ success: false, message: 'Invalid IFSC code format.', error: 'Invalid IFSC code format.' });
    }

    // Account number length check
    if (accountNumber.length < 9 || accountNumber.length > 18) {
      console.warn('[REGISTRATION] Validation failed: invalid account number length');
      return res.status(400).json({ success: false, message: 'Account number must be between 9 and 18 digits.', error: 'Account number must be between 9 and 18 digits.' });
    }

    const emailLower = email.toLowerCase();
    const phoneTrim = phone.trim();

    // Console logs required by user instructions
    console.log('[REGISTRATION] Incoming request body:', req.body);
    console.log('[REGISTRATION] Email:', req.body.email);
    console.log('[REGISTRATION] Phone:', req.body.phone);

    const mongoQuery = {
      $or: [
        { email: req.body.email },
        { phone: req.body.phone }
      ]
    };
    console.log('[REGISTRATION] MongoDB duplicate query:', JSON.stringify(mongoQuery));

    const existingSeller = await Seller.findOne(mongoQuery);
    console.log('[REGISTRATION] Query result:', existingSeller);

    if (existingSeller) {
      // Check if the matching record is a pending request (or an unapproved seller user)
      let isPending = false;
      const checkReq = await db.execute({
        sql: "SELECT status FROM seller_requests WHERE email = ? OR phone = ?",
        args: [emailLower, phoneTrim]
      });
      const checkSel = await db.execute({
        sql: "SELECT status FROM sellers WHERE email = ? OR phone = ?",
        args: [emailLower, phoneTrim]
      });

      const reqStatus = checkReq.rows[0]?.status;
      if (checkReq.rows.length > 0 && (reqStatus === 'Pending' || reqStatus === 'Pending Approval') && checkSel.rows.length === 0) {
        isPending = true;
      }

      if (isPending) {
        console.log('[REGISTRATION] Found existing pending application. Deleting to allow overwrite/resubmission.');
        await db.execute({
          sql: "DELETE FROM seller_requests WHERE email = ? OR phone = ?",
          args: [emailLower, phoneTrim]
        });
        await db.execute({
          sql: "DELETE FROM users WHERE (email = ? OR phone = ?) AND role = 'seller'",
          args: [emailLower, phoneTrim]
        });
        console.log('[REGISTRATION] Deleted pending request and user record. Proceeding with registration.');
      } else {
        console.warn('[REGISTRATION] Unique constraint failed: account email or phone already exists');
        return res.status(400).json({ 
          success: false, 
          message: 'An account with this email or phone number already exists.', 
          error: 'An account with this email or phone number already exists.' 
        });
      }
    }

    // Check unique constraints for GST number and PAN number in sellers
    query = "SELECT id, gst_number, pan_number FROM sellers WHERE gst_number = ? OR pan_number = ?";
    params = [gstNumber, panNumber];
    console.log(`[SQL EXECUTE] Query: ${query} | Params:`, params);
    const checkSeller = await db.execute({ sql: query, args: params });
    if (checkSeller.rows.length > 0) {
      const match = checkSeller.rows[0];
      if (match.gst_number === gstNumber) {
        return res.status(400).json({ success: false, message: 'GST number already exists.', error: 'GST number already exists.' });
      }
      if (match.pan_number === panNumber) {
        return res.status(400).json({ success: false, message: 'PAN number already exists.', error: 'PAN number already exists.' });
      }
    }

    // Check unique constraints for GST number and PAN number in pending requests.
    // If a request exists under Pending, we delete it to allow overwrite.
    query = "SELECT id, gst_number, pan_number, email, phone FROM seller_requests WHERE (gst_number = ? OR pan_number = ?) AND status = 'Pending'";
    params = [gstNumber, panNumber];
    console.log(`[SQL EXECUTE] Query: ${query} | Params:`, params);
    const checkRequest = await db.execute({ sql: query, args: params });
    if (checkRequest.rows.length > 0) {
      const match = checkRequest.rows[0];
      console.log('[REGISTRATION] Found pending request with same GST/PAN. Deleting to allow overwrite:', match.id);
      
      // Delete the request and the user record
      await db.execute({
        sql: "DELETE FROM seller_requests WHERE id = ?",
        args: [match.id]
      });
      await db.execute({
        sql: "DELETE FROM users WHERE (email = ? OR phone = ?) AND role = 'seller'",
        args: [match.email, match.phone]
      });
    }

    // 2. Validate document presence (profilePhoto, gstCertificate, panCard, cancelledCheque are required; businessLicense is optional)
    const files = req.files || {};
    const requiredDocs = ['gstCertificate', 'panCard', 'cancelledCheque', 'profilePhoto'];
    for (const doc of requiredDocs) {
      if (!files[doc] || files[doc].length === 0) {
        console.warn(`[REGISTRATION] Validation failed: missing document ${doc}`);
        return res.status(400).json({ success: false, message: `Document ${doc.replace(/([A-Z])/g, ' $1')} is required.`, error: `Document ${doc.replace(/([A-Z])/g, ' $1')} is required.` });
      }
    }

    // 3. Upload documents
    const documentUrls = {};
    const uploadFields = ['gstCertificate', 'panCard', 'cancelledCheque', 'businessLicense', 'profilePhoto'];
    for (const field of uploadFields) {
      if (files[field] && files[field].length > 0) {
        const fileObj = files[field][0];
        console.log(`[REGISTRATION] Uploading document ${field} from path: ${fileObj.path}`);
        documentUrls[field] = await uploadToCloudinary(fileObj.path, 'seller_docs');
      }
    }

    // Map doc urls to a structured JSON object
    const docUrlsJson = JSON.stringify({
      gstCertificate: documentUrls.gstCertificate || null,
      panCard: documentUrls.panCard || null,
      bankProof: documentUrls.cancelledCheque || null,
      identityProof: documentUrls.businessLicense || null,
      profilePhoto: documentUrls.profilePhoto || null
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

    console.log(`[SQL EXECUTE] Query: ${query} | Params:`, params);
    await db.execute({ sql: query, args: params });
    console.log('[REGISTRATION] Seller request stored successfully.');

    // 4.1 Auto-provision user account with role='seller' so they can log in immediately
    const userQuery = `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'seller')`;
    const userParams = [
      fullName,
      emailLower,
      phoneTrim,
      hashedPassword
    ];
    console.log(`[SQL EXECUTE] Query: ${userQuery} | Params:`, userParams);
    await db.execute({
      sql: userQuery,
      args: userParams
    });
    console.log('[REGISTRATION] Auto-provisioned user record created successfully.');

    const successResponse = {
      success: true,
      message: 'Seller application submitted successfully. Waiting for admin approval.'
    };
    console.log('[REGISTRATION] Returning API success response:', successResponse);
    res.status(201).json(successResponse);
  } catch (err) {
    console.error('[REGISTRATION] Unexpected registration error occurred:', err);
    logSqlError('seller_requests', query, params, err);
    res.status(500).json({
      success: false,
      message: err.message || 'An internal database error occurred during registration.',
      error: err.message || 'Internal Server Error'
    });
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
