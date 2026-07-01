import jwt from 'jsonwebtoken';
import { db } from '../data/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyhighmart2026');

      // Find user from db
      const result = await db.execute({
        sql: "SELECT id, name, email, phone, role, avatar, gender, dob, bio, created_at FROM users WHERE id = ?",
        args: [decoded.id]
      });

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found, authorization failed' });
      }

      const user = result.rows[0];
      
      // If user is a seller, fetch their verification status from sellers table
      if (user.role === 'seller') {
        const sellerCheck = await db.execute({
          sql: "SELECT status FROM sellers WHERE email = ?",
          args: [user.email.toLowerCase()]
        });
        user.status = sellerCheck.rows[0]?.status || 'Pending';
      }

      req.user = user;
      
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Admins only' });
  }
};

export const sellerDashboardAccess = (req, res, next) => {
  if (req.user) {
    if (req.user.role === 'seller' && req.user.status !== 'Approved') {
      return res.status(403).json({
        message: "Seller account is pending approval."
      });
    }
    next();
  } else {
    res.status(401).json({ error: 'Not authorized, login required' });
  }
};
