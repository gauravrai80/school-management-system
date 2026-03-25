const express = require('express');
const {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  publishExam
} = require('../controllers/exam.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router
  .route('/')
  .get(getExams)
  .post(authorize('admin'), createExam);

router
  .route('/:id')
  .put(authorize('admin'), updateExam)
  .delete(authorize('admin'), deleteExam);

router.put('/:id/publish', authorize('admin'), publishExam);

module.exports = router;
