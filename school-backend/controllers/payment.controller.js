const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

const getClientBaseUrl = () => {
  const fallback = (process.env.CLIENT_URLS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)[0];

  return process.env.CLIENT_URL || fallback;
};

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { feeId, studentId, amount, currency = 'usd' } = req.body;
    const clientBaseUrl = getClientBaseUrl();

    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });
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
              name: `School Fee - ${fee.feeType}`,
            },
            unit_amount: amount * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${clientBaseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientBaseUrl}/payment/cancel`,
      metadata: {
        feeId,
        studentId,
      },
    });

    // Create a pending payment record
    await Payment.create({
      studentId,
      feeId,
      amount,
      currency,
      stripeSessionId: session.id,
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { feeId, studentId } = session.metadata;

    // Update payment record
    await Payment.findOneAndUpdate(
      { stripeSessionId: session.id },
      {
        status: 'succeeded',
        stripePaymentIntentId: session.payment_intent,
      }
    );

    // Update fee status
    await Fee.findByIdAndUpdate(feeId, {
      status: 'paid',
      paidDate: new Date(),
      stripePaymentIntentId: session.payment_intent,
      paymentMethod: 'Stripe',
    });

    // Update student fee status if needed
    // ...
  }

  res.json({ received: true });
};

// @desc    Get payment history for student
// @route   GET /api/payments/history/:studentId
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ studentId: req.params.studentId }).sort('-createdAt');
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};
