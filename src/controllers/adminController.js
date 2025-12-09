const mongoose = require('mongoose');
const User = require('../models/User');
const Captcha = require('../models/Captcha');
const Withdrawal = require('../models/Withdrawal');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');

// @desc Get dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const blockedUsers = await User.countDocuments({ role: 'user', isBlocked: true });
    const usersWithPlans = await User.countDocuments({ role: 'user', plan: { $ne: null } });

    const totalCaptchas = await Captcha.countDocuments();
    const activeCaptchas = await Captcha.countDocuments({ isActive: true });

    const totalEarnings = await Wallet.aggregate([
      { $group: { _id: null, totalEarned: { $sum: '$totalEarned' } } },
    ]);

    const totalWithdrawn = await Wallet.aggregate([
      { $group: { _id: null, totalWithdrawn: { $sum: '$totalWithdrawn' } } },
    ]);

    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const approvedWithdrawals = await Withdrawal.countDocuments({ status: 'approved' });

    // Get plan-related stats
    const totalPlans = await Plan.countDocuments({ isActive: true });
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const recentTransactions = await Transaction.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate average earnings per user
    const avgEarningsPerUser = totalUsers > 0 ? (totalEarnings[0]?.totalEarned || 0) / totalUsers : 0;

    // Get total captchas solved
    const totalCaptchasSolved = await Captcha.countDocuments({ solvedCount: { $gt: 0 } });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        blockedUsers,
        usersWithPlans,
        totalCaptchas,
        activeCaptchas,
        totalCaptchasSolved,
        totalPlans,
        completedPayments,
        totalEarnings: totalEarnings[0]?.totalEarned || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalWithdrawn: totalWithdrawn[0]?.totalWithdrawn || 0,
        pendingWithdrawals,
        approvedWithdrawals,
        avgEarningsPerUser,
        recentTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;

    let query = { role: 'user' };

    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(query)
      .populate('plan')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Block user
exports.blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Unblock user
exports.unblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete wallet and transactions
    await Wallet.deleteMany({ user: id });
    await Transaction.deleteMany({ user: id });
    await Withdrawal.deleteMany({ user: id });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get user details
exports.getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate('plan');
    const wallet = await Wallet.findOne({ user: id });
    const withdrawals = await Withdrawal.find({ user: id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        wallet,
        withdrawals,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get earning reports
exports.getEarningReports = async (req, res, next) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    let matchStage = {};

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let groupStage = {};
    let dateFormat = '%Y-%m-%d';

    if (period === 'weekly') {
      dateFormat = '%Y-W%V';
    } else if (period === 'monthly') {
      dateFormat = '%Y-%m';
    }

    groupStage = {
      _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
      totalEarnings: {
        $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] },
      },
      totalWithdrawals: {
        $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] },
      },
      totalTransactions: { $sum: 1 },
    };

    const report = await Transaction.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Alias for getDashboardStats - Get admin stats
exports.getStats = async (req, res, next) => {
  return exports.getDashboardStats(req, res, next);
};

// @desc Get all plans
exports.getPlans = async (req, res, next) => {
  try {
    const Plan = require('../models/Plan');
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get all captchas
exports.getCaptchas = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    let query = {};
    if (status) {
      query.isActive = status === 'active';
    }

    const captchas = await Captcha.find(query)
      .populate('solvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Captcha.countDocuments(query);

    res.status(200).json({
      success: true,
      count: captchas.length,
      total,
      pages: Math.ceil(total / limit),
      data: captchas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get all withdrawals
exports.getWithdrawals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments(query);

    res.status(200).json({
      success: true,
      count: withdrawals.length,
      total,
      pages: Math.ceil(total / limit),
      data: withdrawals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Approve withdrawal
// @desc Approve withdrawal
exports.approveWithdrawal = async (req, res, next) => {
  console.log("🔥 APPROVE API HIT");
  console.log("REQ BODY:", req.body);
  console.log("REQ HEADERS:", req.headers);
  console.log("REQ METHOD:", req.method);

  try {
    console.log("=== Approve Withdrawal Request ===");

    const { id } = req.params;
    const remarks = req.body?.remarks || "";   // SAFE VERSION
    const adminId = req.user.id;

    console.log("Request params:", { id, remarks, adminId });

    // ---------------------------
    // 1️⃣ Find withdrawal request
    // ---------------------------
    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending withdrawals can be approved",
      });
    }

    // ---------------------------
    // 2️⃣ Get user wallet
    // ---------------------------
    const wallet = await Wallet.findOne({ user: withdrawal.user });

    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "User wallet not found",
      });
    }

    // ---------------------------
    // 3️⃣ Check balance
    // ---------------------------
    if (wallet.balance < withdrawal.amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Available: ₹${wallet.balance}, Required: ₹${withdrawal.amount}`,
      });
    }

    // ---------------------------
    // 4️⃣ Deduct amount
    // ---------------------------
    wallet.balance -= withdrawal.amount;
    wallet.totalWithdrawn += withdrawal.amount;
    await wallet.save();

    // ---------------------------
    // 5️⃣ Create transaction
    // ---------------------------
    const transaction = await Transaction.create({
      user: withdrawal.user,
      type: "debit",
      amount: withdrawal.amount,
      description: `Withdrawal approved - ID: ${withdrawal._id}`,
      referenceId: withdrawal._id,
      status: "completed",
    });

    // ---------------------------
    // 6️⃣ Update withdrawal
    // ---------------------------
    withdrawal.status = "approved";
    withdrawal.approvedBy = adminId;
    withdrawal.approvalDate = new Date();
    withdrawal.remarks = remarks;
    await withdrawal.save();

    await withdrawal.populate("user", "name email");

    console.log("Withdrawal approved:", withdrawal._id);

    // ---------------------------
    // 7️⃣ Final Response
    // ---------------------------
    return res.status(200).json({
      success: true,
      message: "Withdrawal approved successfully",
      data: {
        withdrawal,
        wallet: {
          balance: wallet.balance,
          totalWithdrawn: wallet.totalWithdrawn,
        },
        transaction,
      },
    });
  } catch (error) {
    console.error("Approve error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve withdrawal",
    });
  }
};

// @desc Reject withdrawal
exports.rejectWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const withdrawal = await Withdrawal.findByIdAndUpdate(
      id,
      { status: 'rejected', reason, rejectedAt: new Date() },
      { new: true }
    ).populate('user', 'name email');

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Withdrawal rejected successfully',
      data: withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get/Update captcha settings
exports.getCaptchaSettings = async (req, res, next) => {
  try {
    // For now, return default settings
    // In production, this would fetch from a settings collection
    res.status(200).json({
      success: true,
      data: {
        reloadTime: 10, // default reload time in seconds
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update captcha settings
exports.updateCaptchaSettings = async (req, res, next) => {
  try {
    const { reloadTime } = req.body;

    // In production, this would save to a settings collection
    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Captcha settings updated successfully',
      data: {
        reloadTime: reloadTime || 10,
      },
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
    const Plan = require('../models/Plan');
    const { name, price, validityDays, captchaLimit, earningsPerCaptcha, description } = req.body;

    // Validate required fields
    if (!name || price === undefined || price === null || price === '') {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required',
      });
    }

    if (captchaLimit === undefined || captchaLimit === null || captchaLimit === '') {
      return res.status(400).json({
        success: false,
        message: 'Captcha limit is required',
      });
    }

    if (earningsPerCaptcha === undefined || earningsPerCaptcha === null || earningsPerCaptcha === '') {
      return res.status(400).json({
        success: false,
        message: 'Earnings per captcha is required',
      });
    }

    // Check if plan exists (even if inactive)
    let existingPlan = await Plan.findOne({ name });

    if (existingPlan) {
      if (existingPlan.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Plan with this name already exists',
        });
      }

      // Reactivate and update existing plan
      existingPlan.price = Number(price);
      existingPlan.validityDays = Number(validityDays) || 30;
      existingPlan.captchaLimit = Number(captchaLimit);
      existingPlan.earningsPerCaptcha = Number(earningsPerCaptcha);
      existingPlan.description = description || '';
      existingPlan.isActive = true;

      await existingPlan.save();

      return res.status(201).json({
        success: true,
        message: 'Plan created (restored) successfully',
        data: existingPlan,
      });
    }

    const plan = await Plan.create({
      name,
      price: Number(price),
      validityDays: Number(validityDays) || 30,
      captchaLimit: Number(captchaLimit),
      earningsPerCaptcha: Number(earningsPerCaptcha),
      description: description || '',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update plan (Admin)
exports.updatePlan = async (req, res, next) => {
  try {
    const Plan = require('../models/Plan');
    const { id } = req.params;

    const plan = await Plan.findByIdAndUpdate(id, req.body, { new: true });

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
    const PlanModel = require('../models/Plan');
    const { id } = req.params;

    const plan = await PlanModel.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get plan statistics with user purchases
exports.getPlanStats = async (req, res, next) => {
  try {
    const PlanModel = require('../models/Plan');
    const plans = await PlanModel.find({ isActive: true });

    const planStats = await Promise.all(
      plans.map(async (plan) => {
        const activeUsers = await User.countDocuments({ plan: plan._id, planExpiry: { $gt: new Date() } });
        const totalPurchases = await Payment.countDocuments({ plan: plan._id, status: 'completed' });
        const totalRevenue = await Payment.aggregate([
          { $match: { plan: plan._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        return {
          ...plan.toObject(),
          activeUsers,
          totalPurchases,
          totalRevenue: totalRevenue[0]?.total || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: planStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get recent purchases/payments
exports.getRecentPurchases = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const payments = await Payment.find({ status: 'completed' })
      .populate('user', 'name email')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get users with active plans
exports.getUsersWithActivePlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const users = await User.find({
      plan: { $ne: null },
      planExpiry: { $gt: new Date() },
    })
      .populate('plan', 'name price validityDays')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments({
      plan: { $ne: null },
      planExpiry: { $gt: new Date() },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
