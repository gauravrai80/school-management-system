const Timetable = require('../models/Timetable');

// @desc    Get timetable for a class
// @route   GET /api/timetable/:class/:section
// @access  Private
exports.getTimetable = async (req, res, next) => {
  try {
    const timetable = await Timetable.findOne({
      class: req.params.class,
      section: req.params.section,
    }).populate('schedule.teacherId', 'name');

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update timetable
// @route   POST /api/timetable
// @access  Private/Admin
exports.upsertTimetable = async (req, res, next) => {
  try {
    const { class: timetableClass, section, schedule } = req.body;

    const timetable = await Timetable.findOneAndUpdate(
      { class: timetableClass, section },
      { schedule },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update single cell in timetable
// @route   PUT /api/timetable/:id
// @access  Private/Admin
exports.updateTimetableCell = async (req, res, next) => {
  try {
    const { day, period, subject, teacherId, room } = req.body;

    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    // Find the cell and update it
    const cellIndex = timetable.schedule.findIndex(
      (item) => item.day === day && item.period === period
    );

    if (cellIndex !== -1) {
      timetable.schedule[cellIndex] = { day, period, subject, teacherId, room };
    } else {
      timetable.schedule.push({ day, period, subject, teacherId, room });
    }

    await timetable.save();

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (err) {
    next(err);
  }
};
