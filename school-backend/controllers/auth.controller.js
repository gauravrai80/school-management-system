const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Logged out successfully',
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    let profile = null;

    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id }).lean();
      if (student) {
        profile = {
          studentId: student._id,
          class: student.class,
          section: student.section,
          rollNumber: student.rollNumber,
          parentName: student.parentName,
        };
      }
    }

    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: user._id }).lean();
      if (teacher) {
        profile = {
          teacherId: teacher._id,
          employeeId: teacher.employeeId,
          subjects: teacher.subjects,
          classes: teacher.classes,
          department: teacher.department,
        };
      }
    }

    if (user.role === 'parent') {
      const children = await Student.find({
        $or: [{ parentEmail: user.email }, ...(user.phone ? [{ parentPhone: user.phone }] : [])],
      })
        .populate('userId', 'name email')
        .lean();

      profile = {
        children: children.map((student) => ({
          studentId: student._id,
          name: student.userId?.name,
          class: student.class,
          section: student.section,
          rollNumber: student.rollNumber,
          parentName: student.parentName,
        })),
      };
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        id: user._id,
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(statusCode).json({
    success: true,
    token,
    role: user.role,
    data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    }
  });
};
