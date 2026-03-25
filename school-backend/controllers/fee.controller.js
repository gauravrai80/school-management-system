const Fee = require('../models/Fee');
const Student = require('../models/Student');

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private/Admin
exports.getFees = async (req, res, next) => {
  try {
    const { status, class: studentClass, studentId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (studentId) query.studentId = studentId;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const fees = await Fee.find(query)
      .populate('studentId', 'rollNumber class section')
      .skip(startIndex)
      .limit(limit);

    const total = await Fee.countDocuments(query);

    res.status(200).json({
      success: true,
      count: fees.length,
      pagination: { total, page, limit },
      data: fees,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create fee record
// @route   POST /api/fees
// @access  Private/Admin
exports.createFee = async (req, res, next) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json({ success: true, data: fee });
  } catch (err) {
    next(err);
  }
};

// @desc    Update fee record
// @route   PUT /api/fees/:id
// @access  Private/Admin
exports.updateFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee not found' });
    }

    res.status(200).json({ success: true, data: fee });
  } catch (err) {
    next(err);
  }
};

// @desc    Get fee history for a student
// @route   GET /api/fees/student/:id
// @access  Private
exports.getStudentFees = async (req, res, next) => {
  try {
    const fees = await Fee.find({ studentId: req.params.id });
    res.status(200).json({ success: true, count: fees.length, data: fees });
  } catch (err) {
    next(err);
  }
};

// @desc    Get fee summary
// @route   GET /api/fees/summary
// @access  Private/Admin
exports.getFeeSummary = async (req, res, next) => {
  try {
    const fees = await Fee.find();
    
    const summary = {
      totalCollected: fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0),
      totalPending: fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0),
      thisMonth: fees.filter(f => {
          const now = new Date();
          return f.paidDate && f.paidDate.getMonth() === now.getMonth() && f.paidDate.getFullYear() === now.getFullYear();
      }).reduce((sum, f) => sum + f.amount, 0)
    };

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};
