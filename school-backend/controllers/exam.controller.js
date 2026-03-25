const Exam = require('../models/Exam');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
exports.getExams = async (req, res, next) => {
  try {
    const { class: examClass } = req.query;
    let query = {};

    if (examClass) query.class = examClass;

    const exams = await Exam.find(query).sort('-startDate');

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create exam
// @route   POST /api/exams
// @access  Private/Admin
exports.createExam = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Admin
exports.updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.status(200).json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    await exam.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'Exam removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle publish status
// @route   PUT /api/exams/:id/publish
// @access  Private/Admin
exports.publishExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    exam.isPublished = !exam.isPublished;
    await exam.save();

    res.status(200).json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};
