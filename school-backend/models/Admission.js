const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Please add student name'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Please add gender'],
  },
  applyingForClass: {
    type: String,
    required: [true, 'Please add applying class'],
  },
  parentName: {
    type: String,
    required: [true, 'Please add parent name'],
  },
  parentEmail: {
    type: String,
    required: [true, 'Please add parent email'],
  },
  parentPhone: {
    type: String,
    required: [true, 'Please add parent phone'],
  },
  address: {
    type: String,
    required: [true, 'Please add address'],
  },
  previousSchool: {
    type: String,
  },
  documents: [
    {
      name: { type: String },
      url: { type: String },
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  stripePaymentIntentId: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Admission', admissionSchema);
