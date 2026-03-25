const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  class: {
    type: String,
    required: [true, 'Please add a class'],
  },
  section: {
    type: String,
    required: [true, 'Please add a section'],
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
  },
  teacherId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date'],
  },
  attachmentUrl: {
    type: String,
  },
  submissions: [
    {
      studentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      fileUrl: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model('Homework', homeworkSchema);
