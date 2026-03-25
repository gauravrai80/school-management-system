const Grade = require('../models/Grade');
const Exam = require('../models/Exam');
const Student = require('../models/Student');

// @desc    Submit grades in bulk
// @route   POST /api/grades
// @access  Private/Teacher/Admin
exports.submitGrades = async (req, res, next) => {
  try {
    const { gradesArray } = req.body;

    const submittedGrades = await Promise.all(
      gradesArray.map(async (record) => {
        return await Grade.findOneAndUpdate(
          {
            studentId: record.studentId,
            examId: record.examId,
            subject: record.subject,
          },
          {
            marksObtained: record.marksObtained,
            totalMarks: record.totalMarks,
            teacherId: req.user.id,
          },
          { upsert: true, new: true }
        );
      })
    );

    res.status(200).json({
      success: true,
      data: submittedGrades,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all grades for an exam
// @route   GET /api/grades/exam/:examId
// @access  Private/Teacher/Admin
exports.getExamGrades = async (req, res, next) => {
  try {
    const grades = await Grade.find({ examId: req.params.examId })
      .populate('studentId', 'rollNumber')
      .populate('teacherId', 'name');

    res.status(200).json({
      success: true,
      data: grades,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all grades for student
// @route   GET /api/grades/student/:id
// @access  Private
exports.getStudentGrades = async (req, res, next) => {
  try {
    const grades = await Grade.find({ studentId: req.params.id })
      .populate('examId', 'name type isPublished')
      .populate('teacherId', 'name');

    res.status(200).json({
      success: true,
      data: grades,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a grade
// @route   PUT /api/grades/:id
// @access  Private/Teacher/Admin
exports.updateGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!grade) {
      return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    res.status(200).json({
      success: true,
      data: grade,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate report card data
// @route   POST /api/grades/report-card/:studentId/:examId
// @access  Private/Admin
exports.generateReportCard = async (req, res, next) => {
  try {
    const { studentId, examId } = req.params;

    const student = await Student.findById(studentId).populate('userId', 'name');
    const exam = await Exam.findById(examId);
    const grades = await Grade.find({ studentId, examId });

    if (!student || !exam) {
      return res.status(404).json({ success: false, message: 'Student or Exam not found' });
    }

    const reportData = {
      student: {
        name: student.userId.name,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section,
      },
      exam: {
        name: exam.name,
        type: exam.type,
      },
      results: grades.map((g) => ({
        subject: g.subject,
        marksObtained: g.marksObtained,
        totalMarks: g.totalMarks,
        grade: g.grade,
      })),
      summary: {
        totalMarksObtained: grades.reduce((sum, g) => sum + g.marksObtained, 0),
        totalMaxMarks: grades.reduce((sum, g) => sum + g.totalMarks, 0),
      },
    };

    reportData.summary.percentage = (reportData.summary.totalMarksObtained / reportData.summary.totalMaxMarks) * 100;

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (err) {
    next(err);
  }
};
