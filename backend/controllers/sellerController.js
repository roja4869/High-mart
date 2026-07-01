import bcrypt from 'bcryptjs';
import { SellerModel } from '../models/Seller.js';
import { validateSeller } from '../validators/sellerValidator.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { db } from '../data/db.js';

/**
 * @desc    Register a new seller application
 * @route   POST /api/sellers/register
 * @access  Public
 */
export const registerSeller = async (req, res, next) => {
  try {
    const {
      fullName, email, phone, password, confirmPassword,
      businessName, gstNumber, panNumber, businessAddress, city, state, pincode,
      accountHolderName, bankName, accountNumber, confirmAccountNumber, ifscCode, upiId
    } = req.body;

    // 1. Basic matching validation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({ error: 'Bank Account Numbers do not match' });
    }

    // 2. Validate using Joi schema
    const { error } = validateSeller({
      fullName, email, phone, password,
      businessName, gstNumber, panNumber, businessAddress, city, state, pincode,
      accountHolderName, bankName, accountNumber, ifscCode, upiId
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ error: messages[0], details: messages });
    }

    // 3. Check unique constraints (Email and Phone)
    const existingSellers = await SellerModel.findByEmailOrPhone(email, phone);
    if (existingSellers.length > 0) {
      const matched = existingSellers[0];
      if (matched.email === email.toLowerCase()) {
        return res.status(400).json({ error: 'A seller application with this email address already exists' });
      }
      if (matched.phone === phone) {
        return res.status(400).json({ error: 'A seller application with this phone number already exists' });
      }
    }

    // Check users table to prevent collision
    const existingUsers = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? OR phone = ?",
      args: [email.toLowerCase(), phone]
    });
    if (existingUsers.rows.length > 0) {
      return res.status(400).json({ error: 'An account already exists with this email or phone number' });
    }

    // 4. Validate files presence
    const files = req.files || {};
    const requiredDocs = ['gstCertificate', 'panCard', 'cancelledCheque', 'profilePhoto'];
    for (const doc of requiredDocs) {
      if (!files[doc] || files[doc].length === 0) {
        return res.status(400).json({ error: `${doc.replace(/([A-Z])/g, ' $1')} is required` });
      }
    }

    // 5. Upload files to Cloudinary/local fallback
    const documentUrls = {};
    const uploadFields = ['gstCertificate', 'panCard', 'cancelledCheque', 'businessLicense', 'profilePhoto'];
    for (const field of uploadFields) {
      if (files[field] && files[field].length > 0) {
        const fileObj = files[field][0];
        documentUrls[field] = await uploadToCloudinary(fileObj.path, 'seller_docs');
      }
    }

    // 6. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Save application
    const newSeller = await SellerModel.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      businessName,
      gstNumber,
      panNumber,
      businessAddress,
      city,
      state,
      pincode,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      ...documentUrls
    });

    // 8. Auto-provision user account with role='seller' so they can log in immediately
    await db.execute({
      sql: `INSERT INTO users (name, email, phone, password, role, avatar) 
            VALUES (?, ?, ?, ?, 'seller', ?)`,
      args: [
        fullName,
        email.toLowerCase(),
        phone,
        hashedPassword,
        documentUrls.profilePhoto || null
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Your seller application has been submitted successfully.',
      status: 'Pending Approval',
      seller: newSeller
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all seller applications
 * @route   GET /api/admin/sellers
 * @access  Private (Admin Only)
 */
export const getAllSellers = async (req, res, next) => {
  try {
    const sellers = await SellerModel.findAll();
    res.json({
      success: true,
      sellers
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get seller application details by ID
 * @route   GET /api/sellers/:id or /api/admin/sellers/:id
 * @access  Public / Private (Admin/Owner)
 */
export const getSellerById = async (req, res, next) => {
  try {
    const seller = await SellerModel.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller application not found' });
    }

    // Omit password from response
    const { password, ...sellerDetails } = seller;
    res.json({
      success: true,
      seller: sellerDetails
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all pending seller applications
 * @route   GET /api/admin/sellers/pending
 * @access  Private (Admin Only)
 */
export const getPendingSellers = async (req, res, next) => {
  try {
    const pendingSellers = await SellerModel.findPending();
    res.json({
      success: true,
      sellers: pendingSellers
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all approved seller applications
 * @route   GET /api/admin/sellers/approved
 * @access  Private (Admin Only)
 */
export const getApprovedSellers = async (req, res, next) => {
  try {
    const approvedSellers = await SellerModel.findApproved();
    res.json({
      success: true,
      sellers: approvedSellers
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all rejected seller applications
 * @route   GET /api/admin/sellers/rejected
 * @access  Private (Admin Only)
 */
export const getRejectedSellers = async (req, res, next) => {
  try {
    const rejectedSellers = await SellerModel.findRejected();
    res.json({
      success: true,
      sellers: rejectedSellers
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Approve a seller application and create a user account with role='seller'
 * @route   PUT /api/admin/sellers/:id/approve
 * @access  Private (Admin Only)
 */
export const approveSeller = async (req, res, next) => {
  try {
    const seller = await SellerModel.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller application not found' });
    }

    if (seller.status === 'Approved') {
      return res.status(400).json({ error: 'Seller application is already approved' });
    }

    const adminId = req.user ? req.user.id : 'system_admin';

    // 1. Update seller table status
    const updatedSeller = await SellerModel.approveApplication(req.params.id, adminId);

    // 2. Create login account in users table if not exists
    const userCheck = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [seller.email.toLowerCase()]
    });

    if (userCheck.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO users (name, email, phone, password, role, avatar) 
              VALUES (?, ?, ?, ?, 'seller', ?)`,
        args: [
          seller.fullName,
          seller.email.toLowerCase(),
          seller.phone,
          seller.password, // Already hashed in seller table
          seller.profilePhoto || null
        ]
      });
    }

    res.json({
      success: true,
      message: 'Congratulations! Your seller account has been approved. You can now access the Seller Dashboard and start selling on High-Mart.',
      seller: updatedSeller
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reject a seller application with reason
 * @route   PUT /api/admin/sellers/:id/reject
 * @access  Private (Admin Only)
 */
export const rejectSeller = async (req, res, next) => {
  try {
    const seller = await SellerModel.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller application not found' });
    }

    if (seller.status === 'Rejected') {
      return res.status(400).json({ error: 'Seller application is already rejected' });
    }

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const updatedSeller = await SellerModel.rejectApplication(req.params.id, reason);

    res.json({
      success: true,
      message: `Your seller application has been rejected. Reason: ${reason}. Please update your information and submit again.`,
      seller: updatedSeller
    });
  } catch (err) {
    next(err);
  }
};
