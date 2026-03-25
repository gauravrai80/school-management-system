const express = require('express');
const { getSettings, updateSettings } = require('../controllers/setting.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.route('/')
  .get(protect, getSettings) // Available to all authenticated users
  .put(protect, authorize('admin'), updateSettings); // Only admin can update

module.exports = router;
