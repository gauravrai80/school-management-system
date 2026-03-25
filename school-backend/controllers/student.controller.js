const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Fee = require('../models/Fee');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
exports.getStudents = async (req, res, next) => {
  try {
    const { class: studentClass, section, status } = req.query;
    let query = {};

    if (studentClass) query.class = studentClass;
    if (section) query.section = section;
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const students = await Student.find(query)
      .populate('userId', 'name email role profilePhoto phone isActive')
      .skip(startIndex)
      .limit(limit);

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      pagination: {
        total,
        page,
        limit,
      },
      data: students,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private/Admin
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'name email phone profilePhoto');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res, next) => {
  try {
    const {
      name, email, password, phone,
      rollNumber, class: studentClass, section, dateOfBirth, gender,
      address, parentName, parentPhone, parentEmail
    } = req.body;

    // Create user account first
    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      phone,
    });

    // Create student profile
    const student = await Student.create({
      userId: user._id,
      rollNumber,
      class: studentClass,
      section,
      dateOfBirth,
      gender,
      address,
      parentName,
      parentPhone,
      parentEmail
    });

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete student (soft delete)
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Soft delete user account
    await User.findByIdAndUpdate(student.userId, { isActive: false });

    res.status(200).json({
      success: true,
      data: {},
      message: 'Student deactivated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student attendance
// @route   GET /api/students/:id/attendance
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.id });
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student grades
// @route   GET /api/students/:id/grades
// @access  Private
exports.getStudentGrades = async (req, res, next) => {
  try {
    const grades = await Grade.find({ studentId: req.params.id }).populate('examId', 'name type');
    res.status(200).json({ success: true, count: grades.length, data: grades });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student fees
// @route   GET /api/students/:id/fees
// @access  Private
exports.getStudentFees = async (req, res, next) => {
  try {
    const fees = await Fee.find({ studentId: req.params.id });
    res.status(200).json({ success: true, count: fees.length, data: fees });
  } catch (err) {
    next(err);
  }
};
