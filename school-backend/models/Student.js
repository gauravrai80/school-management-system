const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add a roll number'],
    unique: true,
  },
  class: {
    type: String,
    required: [true, 'Please add a class'],
  },
  section: {
    type: String,
    required: [true, 'Please add a section'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add a date of birth'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  address: {
    type: String,
  },
  parentName: {
    type: String,
    required: [true, 'Please add parent name'],
  },
  parentPhone: {
    type: String,
    required: [true, 'Please add parent phone'],
  },
  parentEmail: {
    type: String,
  },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
  feeStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'unpaid',
  },
  transportRoute: {
    type: mongoose.Schema.ObjectId,
    ref: 'Transport',
  },
});

module.exports = mongoose.model('Student', studentSchema);
