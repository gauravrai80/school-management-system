const mongoose = require('mongoose');

const newsPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a news title'],
  },
  content: {
    type: String,
    required: [true, 'Please add news content'],
  },
  excerpt: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
  },
  publishDate: {
    type: Date,
    default: Date.now,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  tags: {
    type: [String],
  },
});

module.exports = mongoose.model('NewsPost', newsPostSchema);
