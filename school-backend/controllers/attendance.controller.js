const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Mark attendance for entire class
// @route   POST /api/attendance/mark
// @access  Private/Teacher/Admin
exports.markAttendance = async (req, res, next) => {
  try {
    const { attendanceArray, date, class: studentClass, section } = req.body;

    const markedAttendance = await Promise.all(
      attendanceArray.map(async (record) => {
        return await Attendance.findOneAndUpdate(
          {
            studentId: record.studentId,
            date: new Date(date),
          },
          {
            status: record.status,
            class: studentClass,
            section,
            markedBy: req.user.id,
          },
          { upsert: true, new: true }
        );
      })
    );

    res.status(200).json({
      success: true,
      data: markedAttendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get today's attendance for a class
// @route   GET /api/attendance/class/:class/:section
// @access  Private/Teacher/Admin
exports.getClassAttendance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      class: req.params.class,
      section: req.params.section,
      date: today,
    }).populate('studentId', 'userId rollNumber');

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student monthly attendance
// @route   GET /api/attendance/student/:id
// @access  Private
exports.getStudentMonthlyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
      studentId: req.params.id,
      date: { $gte: startDate, $lte: endDate },
    });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Private/Admin
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, class: studentClass, section } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (studentClass) query.class = studentClass;
    if (section) query.section = section;

    const attendance = await Attendance.find(query)
      .populate('studentId', 'rollNumber')
      .populate('markedBy', 'name');

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};
