const stripe = require('../config/stripe');
const Admission = require('../models/Admission');

const getClientBaseUrl = () => {
  const fallback = (process.env.CLIENT_URLS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)[0];

  return process.env.CLIENT_URL || fallback;
};

// @desc    Get all applications
// @route   GET /api/admissions
// @access  Private/Admin
exports.getApplications = async (req, res, next) => {
  try {
    const admissions = await Admission.find().sort('-submittedAt');
    res.status(200).json({ success: true, count: admissions.length, data: admissions });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit application
// @route   POST /api/admissions
// @access  Public
exports.submitApplication = async (req, res, next) => {
  try {
    const admission = await Admission.create(req.body);
    res.status(201).json({ success: true, data: admission });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve/Reject application
// @route   PUT /api/admissions/:id/status
// @access  Private/Admin
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, data: admission });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Stripe session for admission fee
// @route   POST /api/admissions/payment
// @access  Public
exports.createAdmissionPayment = async (req, res, next) => {
  try {
    const { admissionId, amount, currency = 'usd' } = req.body;
    const clientBaseUrl = getClientBaseUrl();

    const admission = await Admission.findById(admissionId);
    if (!admission) return res.status(404).json({ success: false, message: 'Application not found' });
    if (!clientBaseUrl) {
      return res.status(500).json({ success: false, message: 'CLIENT_URL is not configured' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Admission Fee',
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${clientBaseUrl}/admission/success?admission_id=${admissionId}`,
      cancel_url: `${clientBaseUrl}/admission/cancel`,
      metadata: {
        admissionId,
      },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single application
// @route   GET /api/admissions/:id
// @access  Public
exports.getApplication = async (req, res, next) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, data: admission });
  } catch (err) {
    next(err);
  }
};
