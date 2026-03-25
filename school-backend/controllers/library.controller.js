const LibraryBook = require('../models/LibraryBook');
const Student = require('../models/Student');

// @desc    Get all books
// @route   GET /api/library/books
// @access  Private
exports.getBooks = async (req, res, next) => {
  try {
    const { title, author, category } = req.query;
    let query = {};

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (category) query.category = category;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const books = await LibraryBook.find(query).skip(startIndex).limit(limit);
    const total = await LibraryBook.countDocuments(query);

    res.status(200).json({
      success: true,
      count: books.length,
      pagination: { total, page, limit },
      data: books,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add book
// @route   POST /api/library/books
// @access  Private/Admin
exports.addBook = async (req, res, next) => {
  try {
    const book = await LibraryBook.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// @desc    Update book
// @route   PUT /api/library/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res, next) => {
  try {
    const book = await LibraryBook.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete book
// @route   DELETE /api/library/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await LibraryBook.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    await book.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'Book removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Issue book to student
// @route   POST /api/library/issue
// @access  Private/Admin
exports.issueBook = async (req, res, next) => {
  try {
    const { bookId, studentId, dueDate } = req.body;

    const book = await LibraryBook.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'Book not available' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    book.issuedTo.push({
      studentId,
      dueDate,
      status: 'issued',
    });

    book.availableCopies -= 1;
    await book.save();

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// @desc    Return book
// @route   PUT /api/library/return/:issueId
// @access  Private/Admin
exports.returnBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;

    const book = await LibraryBook.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const issueIndex = book.issuedTo.findIndex(
      (item) => item._id.toString() === req.params.issueId
    );

    if (issueIndex === -1) {
      return res.status(404).json({ success: false, message: 'Issue record not found' });
    }

    book.issuedTo[issueIndex].status = 'returned';
    book.issuedTo[issueIndex].returnDate = new Date();
    book.availableCopies += 1;

    await book.save();

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};
