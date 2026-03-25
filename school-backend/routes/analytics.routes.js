const express = require('express');
const { getAnalytics } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', protect, authorize('admin'), getAnalytics);

module.exports = router;
