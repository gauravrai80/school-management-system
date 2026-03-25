const NewsPost = require('../models/NewsPost');

// @desc    Get all news posts
// @route   GET /api/news
// @access  Public
exports.getNewsPosts = async (req, res, next) => {
  try {
    const query = req.user && req.user.role === 'admin' ? {} : { isPublished: true };
    const news = await NewsPost.find(query).sort('-publishDate');

    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create news post
// @route   POST /api/news
// @access  Private/Admin
exports.createNewsPost = async (req, res, next) => {
  try {
    const news = await NewsPost.create(req.body);
    res.status(201).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

// @desc    Update news post
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNewsPost = async (req, res, next) => {
  try {
    const news = await NewsPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!news) {
      return res.status(404).json({ success: false, message: 'News post not found' });
    }

    res.status(200).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete news post
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNewsPost = async (req, res, next) => {
  try {
    const news = await NewsPost.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: 'News post not found' });
    }

    await news.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'News post removed' });
  } catch (err) {
    next(err);
  }
};
