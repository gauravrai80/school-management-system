const Transport = require('../models/Transport');
const Student = require('../models/Student');

// @desc    Get all routes
// @route   GET /api/transport
// @access  Private
exports.getRoutes = async (req, res, next) => {
  try {
    const routes = await Transport.find().populate('studentsAssigned', 'rollNumber userId');
    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (err) {
    next(err);
  }
};

// @desc    Create route
// @route   POST /api/transport
// @access  Private/Admin
exports.createRoute = async (req, res, next) => {
  try {
    const route = await Transport.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};

// @desc    Update route
// @route   PUT /api/transport/:id
// @access  Private/Admin
exports.updateRoute = async (req, res, next) => {
  try {
    const route = await Transport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    res.status(200).json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete route
// @route   DELETE /api/transport/:id
// @access  Private/Admin
exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Transport.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    await route.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'Route removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign student to route
// @route   POST /api/transport/:id/assign
// @access  Private/Admin
exports.assignStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    const route = await Transport.findById(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });

    if (route.studentsAssigned.length >= route.capacity) {
      return res.status(400).json({ success: false, message: 'Route at full capacity' });
    }

    if (route.studentsAssigned.includes(studentId)) {
      return res.status(400).json({ success: false, message: 'Student already assigned to this route' });
    }

    route.studentsAssigned.push(studentId);
    await route.save();

    // Update student record
    await Student.findByIdAndUpdate(studentId, { transportRoute: route._id });

    res.status(200).json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};
