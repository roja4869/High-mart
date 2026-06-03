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
        sql: "SELECT id, name, email, role FROM users WHERE id = ?",
        args: [decoded.id]
      });

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found, authorization failed' });
      }

      const user = result.rows[0];
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
