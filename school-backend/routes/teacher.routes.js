const express = require('express');
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher
} = require('../controllers/teacher.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getTeachers)
  .post(createTeacher);

router
  .route('/:id')
  .get(getTeacher)
  .put(updateTeacher)
  .delete(deleteTeacher);

module.exports = router;
