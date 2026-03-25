const express = require('express');
const {
  getTimetable,
  upsertTimetable,
  updateTimetableCell
} = require('../controllers/timetable.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/:class/:section', getTimetable);
router.post('/', authorize('admin'), upsertTimetable);
router.put('/:id', authorize('admin'), updateTimetableCell);

module.exports = router;
