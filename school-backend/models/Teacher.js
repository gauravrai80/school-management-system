const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  employeeId: {
    type: String,
    required: [true, 'Please add an employee ID'],
    unique: true,
  },
  subjects: {
    type: [String],
    required: [true, 'Please add subjects'],
  },
  classes: {
    type: [String],
    required: [true, 'Please add classes'],
  },
  qualification: {
    type: String,
    required: [true, 'Please add qualification'],
  },
  experience: {
    type: Number,
    required: [true, 'Please add experience'],
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  salary: {
    type: Number,
  },
  department: {
    type: String,
    required: [true, 'Please add department'],
  },
});

module.exports = mongoose.model('Teacher', teacherSchema);
