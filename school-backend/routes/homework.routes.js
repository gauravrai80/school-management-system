const express = require('express');
const {
  getHomeworks,
  createHomework,
  updateHomework,
  deleteHomework,
  submitHomework,
  getSubmissions
} = require('../controllers/homework.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.use(protect);

router
  .route('/')
  .get(getHomeworks)
  .post(authorize('admin', 'teacher'), createHomework);

router
  .route('/:id')
  .put(authorize('admin', 'teacher'), updateHomework)
  .delete(authorize('admin', 'teacher'), deleteHomework);

router.post('/:id/submit', authorize('student'), upload.single('file'), (req, res, next) => {
    if (req.file) req.body.fileUrl = req.file.path;
    next();
}, submitHomework);

router.get('/:id/submissions', authorize('admin', 'teacher'), getSubmissions);

module.exports = router;
