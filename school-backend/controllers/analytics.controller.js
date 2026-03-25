const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Payment = require('../models/Payment');
const Exam = require('../models/Exam');

// @desc    Get dashboard/analytics stats
// @route   GET /api/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    // 1. Enrollment Trend (Simplified: just counts by year/month from Student createdAt)
    const enrollmentTrend = await Student.aggregate([
      {
        $group: {
          _id: { $year: '$createdAt' },
          students: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { year: '$_id', students: 1, _id: 0 } },
    ]);

    // 2. Class-wise Student Count
    const classCounts = await Student.aggregate([
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { cls: { $concat: ['Class ', '$_id'] }, count: 1, _id: 0 } },
    ]);

    // 3. Grade Distribution (A, B, C, D, F)
    const gradeDistribution = await Grade.aggregate([
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          grade: '$_id',
          count: 1,
          fill: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'A'] }, then: '#4ADE80' },
                { case: { $eq: ['$_id', 'B'] }, then: '#22C55E' },
                { case: { $eq: ['$_id', 'C'] }, then: '#EAB308' },
                { case: { $eq: ['$_id', 'D'] }, then: '#F97316' },
                { case: { $eq: ['$_id', 'F'] }, then: '#EF4444' },
              ],
              default: '#94A3B8',
            },
          },
          _id: 0,
        },
      },
    ]);

    // 4. Fee Collection vs Target
    const payments = await Payment.find({ status: 'succeeded' });
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const studentCount = await Student.countDocuments();
    const totalTarget = studentCount * 12500; // Mock target per student
    const feePercent = totalTarget > 0 ? Math.min(100, Math.round((totalCollected / totalTarget) * 100)) : 0;

    // 5. Top 10 Students (based on average pct across all grades)
    const topStudentsData = await Grade.aggregate([
      {
        $group: {
          _id: '$studentId',
          avgPct: { $avg: { $divide: [{ $multiply: ['$marksObtained', 100] }, '$totalMarks'] } },
        },
      },
      { $sort: { avgPct: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $lookup: {
          from: 'users',
          localField: 'studentInfo.userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          name: '$userInfo.name',
          class: '$studentInfo.class',
          pct: { $round: ['$avgPct', 1] },
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        enrollmentTrend,
        classCounts,
        gradeDistribution,
        feePercent,
        topStudents: topStudentsData,
      },
    });
  } catch (err) {
    next(err);
  }
};
