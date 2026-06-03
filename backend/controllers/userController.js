import { db } from '../data/db.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    const result = await db.execute("SELECT id, name, email, role, created_at FROM users");

    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role or details
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Get current user details from DB
    const checkResult = await db.execute({
      sql: "SELECT id, name, email, role FROM users WHERE id = ?",
      args: [id]
    });

    const currentUser = checkResult.rows[0];
    if (!currentUser) {
      res.status(404);
      throw new Error(`User with ID ${req.params.id} not found`);
    }

    const { name, email, role } = req.body;

    // Prevent admin from demoting themselves to maintain at least one admin
    if (id === req.user.id && role && role !== 'admin') {
      res.status(400);
      throw new Error('You cannot change your own admin privileges.');
    }

    const updatedName = name !== undefined ? name : currentUser.name;
    const updatedEmail = email !== undefined ? email.toLowerCase() : currentUser.email;
    const updatedRole = role !== undefined ? role : currentUser.role;

    // Update user in DB
    await db.execute({
      sql: "UPDATE users SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [updatedName, updatedEmail, updatedRole, id]
    });

    // Fetch updated user to return
    const finalResult = await db.execute({
      sql: "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      args: [id]
    });

    res.json({
      success: true,
      message: 'User details updated successfully',
      user: finalResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Get user
    const checkResult = await db.execute({
      sql: "SELECT id FROM users WHERE id = ?",
      args: [id]
    });

    if (checkResult.rows.length === 0) {
      res.status(404);
      throw new Error(`User with ID ${req.params.id} not found`);
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      res.status(400);
      throw new Error('You cannot delete your own admin account.');
    }

    // Delete user from DB
    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id]
    });

    res.json({
      success: true,
      message: `User with ID ${id} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};
