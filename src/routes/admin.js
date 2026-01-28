const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bug = require('../models/Bug');
const Activity = require('../models/Activity');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalBugs,
      openBugs,
      inProgressBugs,
      resolvedBugs,
      closedBugs,
      criticalBugs,
      highBugs,
      mediumBugs,
      lowBugs,
      totalUsers,
      adminUsers
    ] = await Promise.all([
      Bug.countDocuments(),
      Bug.countDocuments({ status: 'open' }),
      Bug.countDocuments({ status: 'in-progress' }),
      Bug.countDocuments({ status: 'resolved' }),
      Bug.countDocuments({ status: 'closed' }),
      Bug.countDocuments({ severity: 'critical' }),
      Bug.countDocuments({ severity: 'high' }),
      Bug.countDocuments({ severity: 'medium' }),
      Bug.countDocuments({ severity: 'low' }),
      User.countDocuments(),
      User.countDocuments({ role: 'admin' })
    ]);

    // Count resolved today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resolvedToday = await Bug.countDocuments({
      status: 'resolved',
      updatedAt: { $gte: today }
    });

    res.json({
      stats: {
        totalBugs,
        openBugs,
        inProgressBugs,
        resolvedBugs,
        closedBugs,
        criticalBugs,
        highBugs,
        mediumBugs,
        lowBugs,
        resolvedToday,
        totalUsers,
        adminUsers
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activities
router.get('/activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const activities = await Activity.find()
      .populate('userId', 'name')
      .populate('bugId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      activities: activities.map(a => ({
        id: a._id,
        type: a.type,
        message: a.message,
        createdAt: a.createdAt,
        user: a.userId ? { id: a.userId._id, name: a.userId.name } : null,
        bug: a.bugId ? { id: a.bugId._id, title: a.bugId.title } : null
      }))
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (full info for admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user (admin can create users with roles)
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin can update role, etc.)
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bugs (admin view)
router.get('/bugs', async (req, res) => {
  try {
    const bugs = await Bug.find()
      .populate('reporterId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      bugs: bugs.map(b => ({
        id: b._id,
        title: b.title,
        description: b.description,
        severity: b.severity,
        priority: b.priority,
        status: b.status,
        reportedBy: b.reporterId?.name || 'Unknown',
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get bugs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete any bug (admin privilege)
router.delete('/bugs/:id', async (req, res) => {
  try {
    const bug = await Bug.findByIdAndDelete(req.params.id);

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    res.json({ message: 'Bug deleted successfully' });
  } catch (error) {
    console.error('Delete bug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
