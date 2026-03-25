const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: [true, 'Please add a status'],
  },
  class: {
    type: String,
    required: [true, 'Please add a class'],
  },
  section: {
    type: String,
    required: [true, 'Please add a section'],
  },
  markedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Teacher',
    required: true,
  },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
