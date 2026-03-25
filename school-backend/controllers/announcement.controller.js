const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { targetAudience, targetClass } = req.query;
    let query = { isActive: true };

    if (targetAudience) query.targetAudience = { $in: ['all', targetAudience] };
    if (targetClass) query.targetClass = targetClass;

    const announcements = await Announcement.find(query).sort('-createdAt').populate('createdBy', 'name role');

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin/Teacher
exports.createAnnouncement = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin/Teacher
exports.updateAnnouncement = async (req, res, next) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Make sure user is owner or admin
    if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update' });
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin/Teacher
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete' });
    }

    await announcement.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'Announcement removed' });
  } catch (err) {
    next(err);
  }
};
