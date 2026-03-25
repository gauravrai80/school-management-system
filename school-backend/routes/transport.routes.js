const express = require('express');
const {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  assignStudent
} = require('../controllers/transport.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router
  .route('/')
  .get(getRoutes)
  .post(authorize('admin'), createRoute);

router
  .route('/:id')
  .put(authorize('admin'), updateRoute)
  .delete(authorize('admin'), deleteRoute);

router.post('/:id/assign', authorize('admin'), assignStudent);

module.exports = router;
