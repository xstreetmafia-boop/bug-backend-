const express = require('express');
const router = express.Router();
const Bug = require('../models/Bug');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { authenticate } = require('../middleware/auth');

// Get all bugs
router.get('/', authenticate, async (req, res) => {
  try {
    const bugs = await Bug.find()
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 });

    const bugsWithReporter = bugs.map(bug => ({
      ...bug.toJSON(),
      id: bug._id,
      reportedBy: bug.reporterId?.name || 'Unknown'
    }));

    res.json({ bugs: bugsWithReporter });
  } catch (error) {
    console.error('Get bugs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single bug
router.get('/:id', authenticate, async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('reporterId', 'name email');

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    res.json({
      bug: {
        ...bug.toJSON(),
        id: bug._id,
        reportedBy: bug.reporterId?.name || 'Unknown'
      }
    });
  } catch (error) {
    console.error('Get bug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create bug
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, severity, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const bug = await Bug.create({
      title,
      description,
      severity: severity || 'medium',
      priority: priority || 'medium',
      reporterId: req.user.id
    });

    // Get reporter info
    const user = await User.findById(req.user.id);

    // Log activity
    await Activity.create({
      type: 'bug_created',
      userId: req.user.id,
      bugId: bug._id,
      message: `reported issue "${bug.title}"`
    });

    res.status(201).json({
      message: 'Bug created successfully',
      bug: {
        ...bug.toJSON(),
        id: bug._id,
        reportedBy: user?.name || 'Unknown'
      }
    });
  } catch (error) {
    console.error('Create bug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bug
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, severity, priority, status } = req.body;

    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    const oldStatus = bug.status;

    // Update fields
    if (title) bug.title = title;
    if (description) bug.description = description;
    if (severity) bug.severity = severity;
    if (priority) bug.priority = priority;
    if (status) bug.status = status;

    await bug.save();

    // Log status change activity
    if (status && status !== oldStatus) {
      await Activity.create({
        type: 'status_changed',
        userId: req.user.id,
        bugId: bug._id,
        message: `changed status to "${status}"`,
        metadata: { oldStatus, newStatus: status }
      });
    }

    const user = await User.findById(bug.reporterId);

    res.json({
      message: 'Bug updated successfully',
      bug: {
        ...bug.toJSON(),
        id: bug._id,
        reportedBy: user?.name || 'Unknown'
      }
    });
  } catch (error) {
    console.error('Update bug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete bug
router.delete('/:id', authenticate, async (req, res) => {
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
