const Setting = require('../models/Setting');

// @desc    Get school settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await Setting.create({});
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update school settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, {
        ...req.body,
        updatedBy: req.user.id
      }, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};
