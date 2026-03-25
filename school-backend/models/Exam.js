const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an exam name'],
  },
  type: {
    type: String,
    enum: ['midterm', 'final', 'unit'],
    required: [true, 'Please add an exam type'],
  },
  class: {
    type: String,
    required: [true, 'Please add a class'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date'],
  },
  subjects: [
    {
      name: { type: String, required: true },
      date: { type: Date, required: true },
      maxMarks: { type: Number, required: true },
    },
  ],
  isPublished: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Exam', examSchema);
