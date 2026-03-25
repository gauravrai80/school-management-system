const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentGrades,
  getStudentFees
} = require('../controllers/student.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'teacher'), getStudents)
  .post(authorize('admin'), createStudent);

router
  .route('/:id')
  .get(authorize('admin', 'teacher', 'student', 'parent'), getStudent)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

router.get('/:id/attendance', authorize('admin', 'teacher', 'student', 'parent'), getStudentAttendance);
router.get('/:id/grades', authorize('admin', 'teacher', 'student', 'parent'), getStudentGrades);
router.get('/:id/fees', authorize('admin', 'student', 'parent'), getStudentFees);

module.exports = router;
