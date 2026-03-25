const express = require('express');
const {
  getApplications,
  submitApplication,
  updateApplicationStatus,
  createAdmissionPayment,
  getApplication
} = require('../controllers/admission.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.post('/', submitApplication);
router.post('/payment', createAdmissionPayment);
router.get('/:id', getApplication);

router.use(protect);
router.use(authorize('admin'));

router.get('/', getApplications);
router.put('/:id/status', updateApplicationStatus);

module.exports = router;
