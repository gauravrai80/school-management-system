const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  class: {
    type: String,
    required: [true, 'Please add a class'],
  },
  section: {
    type: String,
    required: [true, 'Please add a section'],
  },
  schedule: [
    {
      day: {
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        required: true,
      },
      period: {
        type: Number,
        required: true,
      },
      subject: {
        type: String,
        required: true,
      },
      teacherId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Teacher',
        required: true,
      },
      room: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model('Timetable', timetableSchema);
