const Homework = require('../models/Homework');
const Student = require('../models/Student');

// @desc    Get all homework
// @route   GET /api/homework
// @access  Private
exports.getHomeworks = async (req, res, next) => {
  try {
    const { class: homeworkClass, section, subject, teacherId } = req.query;
    let query = {};

    if (homeworkClass) query.class = homeworkClass;
    if (section) query.section = section;
    if (subject) query.subject = subject;
    if (teacherId) query.teacherId = teacherId;

    const homeworks = await Homework.find(query).populate('teacherId', 'name').sort('-dueDate');

    res.status(200).json({
      success: true,
      count: homeworks.length,
      data: homeworks,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create homework
// @route   POST /api/homework
// @access  Private/Teacher/Admin
exports.createHomework = async (req, res, next) => {
  try {
    req.body.teacherId = req.user.id;
    const homework = await Homework.create(req.body);
    res.status(201).json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};

// @desc    Update homework
// @route   PUT /api/homework/:id
// @access  Private/Teacher/Admin
exports.updateHomework = async (req, res, next) => {
  try {
    let homework = await Homework.findById(req.params.id);

    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    homework = await Homework.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete homework
// @route   DELETE /api/homework/:id
// @access  Private/Teacher/Admin
exports.deleteHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findById(req.params.id);

    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    await homework.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'Homework removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit homework
// @route   POST /api/homework/:id/submit
// @access  Private/Student
exports.submitHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findById(req.params.id);

    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const submission = {
      studentId: student._id,
      fileUrl: req.body.fileUrl, // Provided by upload middleware
    };

    homework.submissions.push(submission);
    await homework.save();

    res.status(200).json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};

// @desc    Get submissions for a homework
// @route   GET /api/homework/:id/submissions
// @access  Private/Teacher/Admin
exports.getSubmissions = async (req, res, next) => {
  try {
    const homework = await Homework.findById(req.params.id).populate('submissions.studentId', 'rollNumber userId');

    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    res.status(200).json({
      success: true,
      count: homework.submissions.length,
      data: homework.submissions,
    });
  } catch (err) {
    next(err);
  }
};
