const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true,
  },
  feeType: {
    type: String,
    enum: ['tuition', 'transport', 'sports', 'library'],
    required: [true, 'Please add a fee type'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date'],
  },
  paidDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'unpaid',
  },
  paymentMethod: {
    type: String,
  },
  stripePaymentIntentId: {
    type: String,
  },
  academicYear: {
    type: String,
    required: [true, 'Please add an academic year'],
  },
});

module.exports = mongoose.model('Fee', feeSchema);
