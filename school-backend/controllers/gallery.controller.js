const Gallery = require('../models/Gallery');

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
exports.getGalleryImages = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) query.category = category;

    const images = await Gallery.find(query).sort('-uploadDate');

    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload image to gallery
// @route   POST /api/gallery
// @access  Private/Admin
exports.uploadImage = async (req, res, next) => {
  try {
    const { title, category, imageUrl } = req.body;

    const image = await Gallery.create({
      title,
      category,
      imageUrl,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
exports.deleteImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    await image.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Image removed',
    });
  } catch (err) {
    next(err);
  }
};
