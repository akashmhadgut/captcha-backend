const User = require('../models/User');
const Plan = require('../models/Plan');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../utils/razorpay');
const Payment = require('../models/Payment');

// @desc Get all plans
exports.getAllPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get single plan
exports.getPlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Create plan (Admin)
exports.createPlan = async (req, res, next) => {
  try {
    const { name, price, captchaLimit, validityDays, earningsPerCaptcha, description } = req.body;

    // Validation
    if (!name || !price || !captchaLimit || !validityDays || earningsPerCaptcha === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const plan = new Plan({
      name,
      price,
      captchaLimit,
      validityDays,
      earningsPerCaptcha,
      description,
    });

    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update plan (Admin)
exports.updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const plan = await Plan.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Delete plan (Admin)
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Initialize payment
exports.initializePayment = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required',
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    // Ensure price is a valid number
    const price = Number(plan.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan price for payment initialization',
      });
    }

    // Create Razorpay order
    const order = await createRazorpayOrder(price, planId);

    // Save payment record
    const payment = new Payment({
      user: userId,
      plan: planId,
      amount: plan.price,
      razorpayOrderId: order.id,
      status: 'initiated',
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment order created',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        payment: payment,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Verify payment and assign plan
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = req.body;
    const userId = req.user.id;

    // Verify signature
    const isValidSignature = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'completed',
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Get plan and assign to user
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    const planExpiry = new Date();
    planExpiry.setDate(planExpiry.getDate() + plan.validityDays);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        plan: planId,
        planExpiry,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified and plan assigned successfully',
      data: {
        user,
        planExpiry,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Select Demo Plan - for new users after registration
exports.selectDemoPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find demo plan by name (ignore isActive status to avoid duplicates)
    let demoPlan = await Plan.findOne({ name: 'Demo' });

    if (!demoPlan) {
      try {
        demoPlan = new Plan({
          name: 'Demo',
          price: 0,
          captchaLimit: 10,
          validityDays: 1,
          earningsPerCaptcha: 0,
          description: 'Demo plan - access to captchas without earning rewards',
          isActive: true,
        });
        await demoPlan.save();
      } catch (err) {
        // Handle race condition
        if (err.code === 11000) {
          demoPlan = await Plan.findOne({ name: 'Demo' });
        } else {
          throw err;
        }
      }
    } else if (!demoPlan.isActive) {
      // Optional: Auto-activate demo plan if found but inactive
      demoPlan.isActive = true;
      await demoPlan.save();
    }

    // Calculate plan expiry (1 day from now for demo)
    const planExpiry = new Date();
    planExpiry.setDate(planExpiry.getDate() + demoPlan.validityDays);

    // Assign demo plan to user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        plan: demoPlan._id,
        planExpiry,
      },
      { new: true }
    );

    // Also ensure wallet exists for the user
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({ user: userId, balance: 0, totalEarned: 0, totalWithdrawn: 0 });
      await wallet.save();
    }

    res.status(200).json({
      success: true,
      message: 'Demo plan selected successfully',
      data: {
        user,
        plan: demoPlan,
        planExpiry,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
