const express = require('express');
const {
  getFees,
  createFee,
  updateFee,
  getStudentFees,
  getFeeSummary
} = require('../controllers/fee.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router
  .route('/')
  .get(authorize('admin'), getFees)
  .post(authorize('admin'), createFee);

router.get('/summary', authorize('admin'), getFeeSummary);
router.get('/student/:id', authorize('admin', 'student', 'parent'), getStudentFees);
router.put('/:id', authorize('admin'), updateFee);

module.exports = router;
