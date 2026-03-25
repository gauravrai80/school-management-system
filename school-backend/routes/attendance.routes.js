const express = require('express');
const {
  markAttendance,
  getClassAttendance,
  getStudentMonthlyAttendance,
  getAttendanceReport
} = require('../controllers/attendance.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.post('/mark', authorize('admin', 'teacher'), markAttendance);
router.get('/class/:class/:section', authorize('admin', 'teacher'), getClassAttendance);
router.get('/student/:id', authorize('admin', 'teacher', 'student', 'parent'), getStudentMonthlyAttendance);
router.get('/report', authorize('admin'), getAttendanceReport);

module.exports = router;
