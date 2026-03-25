const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
} = require('../controllers/auth.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.post('/register', protect, authorize('admin'), register);
router.post('/login', login);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
