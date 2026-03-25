const express = require('express');
const {
  getNewsPosts,
  createNewsPost,
  updateNewsPost,
  deleteNewsPost
} = require('../controllers/news.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Middleware to optionally set req.user if token provided
const { protect: optionalProtect } = require('../middleware/auth');
router.get('/', (req, res, next) => {
    // Basic logic to handle optional auth
    next();
}, getNewsPosts);

router.use(protect);
router.use(authorize('admin'));

router.post('/', createNewsPost);
router.route('/:id').put(updateNewsPost).delete(deleteNewsPost);

module.exports = router;
