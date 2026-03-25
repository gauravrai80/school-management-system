const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
  },
  description: {
    type: String,
    required: [true, 'Please add an event description'],
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
  },
  endDate: {
    type: Date,
  },
  category: {
    type: String,
    enum: ['academic', 'sports', 'cultural', 'holiday', 'other'],
    default: 'other',
  },
  location: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Event', eventSchema);
