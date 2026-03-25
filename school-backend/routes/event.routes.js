const express = require('express');
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/event.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', getEvents);

router.use(protect);
router.use(authorize('admin'));

router.post('/', createEvent);
router.route('/:id').put(updateEvent).delete(deleteEvent);

module.exports = router;
