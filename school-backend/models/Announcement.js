const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'teachers', 'parents', 'class'],
    default: 'all',
  },
  targetClass: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Announcement', announcementSchema);
