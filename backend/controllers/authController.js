import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../data/db.js';

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyhighmart2026', {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    // Check if user already exists
    const checkUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email.toLowerCase()]
    });
    
    if (checkUser.rows.length > 0) {
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.execute({
      sql: "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?) RETURNING id, name, email, phone, role",
      args: [name, email.toLowerCase(), phone || null, hashedPassword]
    });

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find user
    const result = await db.execute({
      sql: "SELECT id, name, email, phone, password, role, gender, dob, bio, avatar FROM users WHERE email = ?",
      args: [email.toLowerCase()]
    });

    const user = result.rows[0];

    if (!user) {
      try {
        // Check if there is a seller request or approved seller
        const reqCheck = await db.execute({
          sql: "SELECT * FROM seller_requests WHERE email = ?",
          args: [email.toLowerCase()]
        });

        const sellerCheck = await db.execute({
          sql: "SELECT * FROM sellers WHERE email = ?",
          args: [email.toLowerCase()]
        });

        const matchedRecord = reqCheck.rows[0] || sellerCheck.rows[0];

        if (matchedRecord) {
          if (await bcrypt.compare(password, matchedRecord.password)) {
            // Auto-provision user account with role='seller' if missing
            await db.execute({
              sql: `INSERT INTO users (name, email, phone, password, role) 
                    VALUES (?, ?, ?, ?, 'seller')`,
              args: [
                matchedRecord.full_name || matchedRecord.fullName || 'Seller Name',
                matchedRecord.email.toLowerCase(),
                matchedRecord.phone,
                matchedRecord.password
              ]
            });

            // Fetch the newly created user record
            const newUserResult = await db.execute({
              sql: "SELECT id, name, email, phone, role FROM users WHERE email = ?",
              args: [email.toLowerCase()]
            });
            const newUser = newUserResult.rows[0];

            return res.json({
              success: true,
              message: 'Login successful',
              token: generateToken(newUser.id),
              user: newUser
            });
          }
        }
      } catch (err) {
        console.error("Seller check during login failed:", err.message);
      }
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Login successful',
        token: generateToken(user.id),
        user: userWithoutPassword
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, avatar, gender, dob, bio } = req.body;

    // Retrieve current user
    const checkResult = await db.execute({
      sql: "SELECT id, name, email, phone, role FROM users WHERE id = ?",
      args: [userId]
    });
    
    if (checkResult.rows.length === 0) {
      res.status(404);
      throw new Error('User not found');
    }

    const currentUser = checkResult.rows[0];

    // Validate email if changed
    let updatedEmail = currentUser.email;
    if (email && email.toLowerCase() !== currentUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
      }

      // Check if email already taken
      const checkEmail = await db.execute({
        sql: "SELECT id FROM users WHERE email = ? AND id != ?",
        args: [email.toLowerCase(), userId]
      });
      if (checkEmail.rows.length > 0) {
        res.status(400);
        throw new Error('Email address already in use');
      }
      updatedEmail = email.toLowerCase();
    }

    const updatedName = name !== undefined ? name : currentUser.name;
    const updatedPhone = phone !== undefined ? phone : currentUser.phone;
    const updatedAvatar = avatar !== undefined ? avatar : req.user.avatar;
    const updatedGender = gender !== undefined ? gender : req.user.gender;
    const updatedDob = dob !== undefined ? dob : req.user.dob;
    const updatedBio = bio !== undefined ? bio : req.user.bio;

    // Update table
    await db.execute({
      sql: `UPDATE users SET 
              name = ?, 
              email = ?, 
              phone = ?, 
              avatar = ?, 
              gender = ?, 
              dob = ?, 
              bio = ?, 
              updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`,
      args: [
        updatedName, 
        updatedEmail, 
        updatedPhone, 
        updatedAvatar, 
        updatedGender, 
        updatedDob, 
        updatedBio, 
        userId
      ]
    });

    // Fetch updated user
    const finalResult = await db.execute({
      sql: "SELECT id, name, email, phone, role, avatar, gender, dob, bio, created_at FROM users WHERE id = ?",
      args: [userId]
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: finalResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
