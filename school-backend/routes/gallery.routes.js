const express = require('express');
const {
  getGalleryImages,
  uploadImage,
  deleteImage
} = require('../controllers/gallery.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.get('/', getGalleryImages);

router.use(protect);
router.use(authorize('admin'));

router.post('/', upload.single('image'), (req, res, next) => {
    if (req.file) req.body.imageUrl = req.file.path;
    next();
}, uploadImage);

router.delete('/:id', deleteImage);

module.exports = router;
