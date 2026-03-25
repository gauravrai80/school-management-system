const express = require('express');
const {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook
} = require('../controllers/library.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router
  .route('/books')
  .get(getBooks)
  .post(authorize('admin'), addBook);

router
  .route('/books/:id')
  .put(authorize('admin'), updateBook)
  .delete(authorize('admin'), deleteBook);

router.post('/issue', authorize('admin'), issueBook);
router.put('/return/:issueId', authorize('admin'), returnBook);

module.exports = router;
