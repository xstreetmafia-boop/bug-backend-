const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['bug_created', 'bug_updated', 'status_changed', 'user_created', 'user_login', 'user_logout']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bugId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bug'
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

activitySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Activity', activitySchema);
