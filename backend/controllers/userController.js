import { users } from '../data/mockDb.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    // Exclude password in response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      count: usersWithoutPassword.length,
      users: usersWithoutPassword
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
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      res.status(404);
      throw new Error(`User with ID ${req.params.id} not found`);
    }

    const { name, email, role } = req.body;
    const currentUser = users[userIndex];

    // Prevent admin from demoting themselves to maintain at least one admin
    if (id === req.user.id && role && role !== 'admin') {
      res.status(400);
      throw new Error('You cannot change your own admin privileges.');
    }

    const updatedUser = {
      ...currentUser,
      name: name !== undefined ? name : currentUser.name,
      email: email !== undefined ? email.toLowerCase() : currentUser.email,
      role: role !== undefined ? role : currentUser.role
    };

    users[userIndex] = updatedUser;

    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'User details updated successfully',
      user: userWithoutPassword
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
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      res.status(404);
      throw new Error(`User with ID ${req.params.id} not found`);
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      res.status(400);
      throw new Error('You cannot delete your own admin account.');
    }

    users.splice(userIndex, 1);

    res.json({
      success: true,
      message: `User with ID ${id} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};
