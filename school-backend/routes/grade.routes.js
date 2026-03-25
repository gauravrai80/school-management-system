const express = require('express');
const {
  submitGrades,
  getExamGrades,
  getStudentGrades,
  updateGrade,
  generateReportCard
} = require('../controllers/grade.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.post('/', authorize('admin', 'teacher'), submitGrades);
router.get('/exam/:examId', authorize('admin', 'teacher'), getExamGrades);
router.get('/student/:id', authorize('admin', 'teacher', 'student', 'parent'), getStudentGrades);
router.put('/:id', authorize('admin', 'teacher'), updateGrade);
router.post('/report-card/:studentId/:examId', authorize('admin'), generateReportCard);

module.exports = router;
