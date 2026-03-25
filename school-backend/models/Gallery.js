const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a gallery title'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL'],
  },
  category: {
    type: String,
    enum: ['events', 'sports', 'academics', 'cultural', 'campus'],
    required: [true, 'Please add a category'],
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Gallery', gallerySchema);
