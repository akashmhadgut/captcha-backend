const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// @desc Get wallet
exports.getWallet = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ user: userId }).populate('transactions');

    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get wallet balance
exports.getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalWithdrawn: wallet.totalWithdrawn,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get transaction history
exports.getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 15, page = 1 } = req.query;

    const transactions = await Transaction.find({ user: userId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Transaction.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(total / limit),
      transactions: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get earnings statistics (today, this week, this month)
exports.getEarningsStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Convert userId to ObjectId if it's a string
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Get today's earnings (credit transactions only)
    // Include transactions with status 'completed' or without status field (for backward compatibility)
    const todayEarnings = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: 'credit',
          $or: [
            { status: 'completed' },
            { status: { $exists: false } },
            { status: null }
          ],
          createdAt: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Get this week's earnings
    const weekEarnings = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: 'credit',
          $or: [
            { status: 'completed' },
            { status: { $exists: false } },
            { status: null }
          ],
          createdAt: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Get this month's earnings
    const monthEarnings = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: 'credit',
          $or: [
            { status: 'completed' },
            { status: { $exists: false } },
            { status: null }
          ],
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        today: todayEarnings[0]?.total || 0,
        week: weekEarnings[0]?.total || 0,
        month: monthEarnings[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Error in getEarningsStats:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Add funds (Admin - for testing)
exports.addFunds = async (req, res, next) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'UserId and amount are required',
      });
    }

    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    wallet.balance += amount;
    wallet.totalEarned += amount;
    await wallet.save();

    const transaction = await Transaction.create({
      user: userId,
      type: 'credit',
      amount,
      description: description || 'Admin added funds',
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      message: 'Funds added successfully',
      data: {
        wallet,
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
