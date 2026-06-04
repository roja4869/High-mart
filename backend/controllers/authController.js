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
      sql: "SELECT id, name, email, phone, password, role FROM users WHERE email = ?",
      args: [email.toLowerCase()]
    });

    const user = result.rows[0];

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
