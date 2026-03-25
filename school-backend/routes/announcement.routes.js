const express = require('express');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcement.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router
  .route('/')
  .get(getAnnouncements)
  .post(authorize('admin', 'teacher'), createAnnouncement);

router
  .route('/:id')
  .put(authorize('admin', 'teacher'), updateAnnouncement)
  .delete(authorize('admin', 'teacher'), deleteAnnouncement);

module.exports = router;
