const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get all users (limited info for team display)
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find().select('name email status role');
    res.json({
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        status: u.status,
        role: u.role
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update own profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: user.toJSON() });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
