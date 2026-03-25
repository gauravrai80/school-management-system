const mongoose = require('mongoose');

const libraryBookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a book title'],
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  isbn: {
    type: String,
    unique: true,
  },
  totalCopies: {
    type: Number,
    required: [true, 'Please add total copies'],
    default: 1,
  },
  availableCopies: {
    type: Number,
    required: [true, 'Please add available copies'],
    default: 1,
  },
  issuedTo: [
    {
      studentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
      },
      issueDate: {
        type: Date,
        default: Date.now,
      },
      dueDate: {
        type: Date,
        required: true,
      },
      returnDate: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['issued', 'returned', 'overdue'],
        default: 'issued',
      },
    },
  ],
});

module.exports = mongoose.model('LibraryBook', libraryBookSchema);
