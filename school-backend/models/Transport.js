const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: [true, 'Please add a route name'],
    unique: true,
  },
  stops: {
    type: [String],
    required: [true, 'Please add stops'],
  },
  driverName: {
    type: String,
    required: [true, 'Please add driver name'],
  },
  driverPhone: {
    type: String,
    required: [true, 'Please add driver phone'],
  },
  busNumber: {
    type: String,
    required: [true, 'Please add bus number'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please add capacity'],
  },
  studentsAssigned: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
    },
  ],
});

module.exports = mongoose.model('Transport', transportSchema);
