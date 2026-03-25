const express = require('express');
const {
  createCheckoutSession,
  handleWebhook,
  getPaymentHistory
} = require('../controllers/payment.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Webhook needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.use(protect);

router.post('/create-checkout-session', authorize('student', 'parent'), createCheckoutSession);
router.get('/history/:studentId', authorize('admin', 'student', 'parent'), getPaymentHistory);

module.exports = router;
