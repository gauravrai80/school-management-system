const Teacher = require('../models/Teacher');
const User = require('../models/User');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private/Admin
exports.getTeachers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const teachers = await Teacher.find()
      .populate('userId', 'name email role profilePhoto phone isActive')
      .skip(startIndex)
      .limit(limit);

    const total = await Teacher.countDocuments();

    res.status(200).json({
      success: true,
      count: teachers.length,
      pagination: {
        total,
        page,
        limit,
      },
      data: teachers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private/Admin
exports.getTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('userId', 'name email phone profilePhoto');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create teacher
// @route   POST /api/teachers
// @access  Private/Admin
exports.createTeacher = async (req, res, next) => {
  try {
    const {
      name, email, password, phone,
      employeeId, subjects, classes, qualification, experience, salary, department
    } = req.body;

    // Create user account
    const user = await User.create({
      name,
      email,
      password,
      role: 'teacher',
      phone,
    });

    // Create teacher profile
    const teacher = await Teacher.create({
      userId: user._id,
      employeeId,
      subjects,
      classes,
      qualification,
      experience,
      salary,
      department
    });

    res.status(201).json({
      success: true,
      data: teacher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
exports.updateTeacher = async (req, res, next) => {
  try {
    let teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Soft delete user account
    await User.findByIdAndUpdate(teacher.userId, { isActive: false });

    res.status(200).json({
      success: true,
      data: {},
      message: 'Teacher deactivated successfully',
    });
  } catch (err) {
    next(err);
  }
};
