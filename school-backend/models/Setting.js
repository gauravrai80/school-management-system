const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Lumina Academy',
  },
  address: {
    type: String,
    default: '123 Education Lane, Academic City',
  },
  phone: {
    type: String,
    default: '+1 (555) 123-4567',
  },
  email: {
    type: String,
    default: 'info@lumina.edu',
  },
  academicYear: {
    type: String,
    default: '2024-2025',
  },
  smsNotifications: {
    type: Boolean,
    default: true,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
