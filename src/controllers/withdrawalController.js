const Withdrawal = require('../models/Withdrawal');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc Request withdrawal
exports.requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, bankDetails } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || amount < 200) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹200',
      });
    }

    // Check wallet balance
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance',
      });
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      user: userId,
      amount,
      bankDetails,
      status: 'pending',
    });

    await withdrawal.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get user withdrawals
exports.getUserWithdrawals = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const withdrawals = await Withdrawal.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      count: withdrawals.length,
      data: withdrawals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get all withdrawals (Admin)
exports.getAllWithdrawals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'name email')
      .populate('approvedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

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

// @desc Approve withdrawal (Admin)
exports.approveWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const adminId = req.user.id;

    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending withdrawals can be approved',
      });
    }

    // Find and update wallet atomically to prevent race conditions
    const userId = withdrawal.user;
    
    // Ensure userId is ObjectId
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? (userId instanceof mongoose.Types.ObjectId ? userId : new mongoose.Types.ObjectId(userId))
      : userId;
    
    // First check if wallet exists and has sufficient balance
    const walletCheck = await Wallet.findOne({ user: userObjectId });
    
    if (!walletCheck) {
      console.error('Wallet not found for user:', userObjectId);
      return res.status(400).json({
        success: false,
        message: 'User wallet not found',
      });
    }

    // Check balance before deducting
    if (walletCheck.balance < withdrawal.amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Available: ₹${walletCheck.balance.toFixed(2)}, Required: ₹${withdrawal.amount.toFixed(2)}`,
      });
    }

    // Store old balance for logging
    const oldBalance = walletCheck.balance;
    const newBalance = parseFloat((walletCheck.balance - withdrawal.amount).toFixed(2));
    const newTotalWithdrawn = parseFloat((walletCheck.totalWithdrawn + withdrawal.amount).toFixed(2));

    console.log('Attempting to update wallet:', {
      userId: userObjectId,
      oldBalance,
      withdrawalAmount: withdrawal.amount,
      expectedNewBalance: newBalance,
    });

    // Use atomic update to deduct balance and increment totalWithdrawn
    // Using $inc for atomic operation - we already checked balance above
    const updatedWallet = await Wallet.findOneAndUpdate(
      { 
        user: userObjectId
      },
      {
        $inc: {
          balance: -withdrawal.amount,
          totalWithdrawn: withdrawal.amount
        }
      },
      { new: true } // Return updated document
    );

    // Check if update was successful
    let finalWallet = updatedWallet;
    
    if (!updatedWallet) {
      console.error('Wallet update failed, trying direct update:', {
        userId: userObjectId,
        withdrawalAmount: withdrawal.amount,
        currentBalance: walletCheck.balance,
      });
      
      // Try alternative approach - direct update
      walletCheck.balance = newBalance;
      walletCheck.totalWithdrawn = newTotalWithdrawn;
      await walletCheck.save();
      
      // Verify the save
      finalWallet = await Wallet.findOne({ user: userObjectId });
      if (!finalWallet || finalWallet.balance !== newBalance) {
        console.error('Direct update also failed:', {
          expected: newBalance,
          actual: finalWallet?.balance,
        });
        return res.status(500).json({
          success: false,
          message: 'Failed to deduct balance. Please try again.',
        });
      }
      
      console.log('Wallet updated successfully via direct update:', {
        oldBalance,
        newBalance: finalWallet.balance,
        totalWithdrawn: finalWallet.totalWithdrawn,
      });
    } else {
      console.log('Wallet updated successfully via atomic operation:', {
        oldBalance,
        newBalance: updatedWallet.balance,
        totalWithdrawn: updatedWallet.totalWithdrawn,
      });
    }
    
    if (!finalWallet) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve updated wallet',
      });
    }

    // Create debit transaction
    const transaction = await Transaction.create({
      user: userObjectId,
      type: 'debit',
      amount: withdrawal.amount,
      description: `Withdrawal approved - ID: ${withdrawal._id}`,
      referenceId: withdrawal._id,
      status: 'completed',
    });

    // Link transaction to wallet
    await Wallet.findByIdAndUpdate(
      finalWallet._id,
      { $push: { transactions: transaction._id } },
      { new: true }
    );

    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.approvedBy = adminId;
    withdrawal.approvalDate = new Date();
    if (remarks) withdrawal.remarks = remarks;
    await withdrawal.save();

    console.log('Withdrawal approved successfully:', {
      withdrawalId: withdrawal._id,
      amount: withdrawal.amount,
      userId: userObjectId,
      oldBalance,
      newBalance: finalWallet.balance,
      totalWithdrawn: finalWallet.totalWithdrawn,
      transactionId: transaction._id,
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal approved successfully. Balance deducted.',
      data: {
        withdrawal,
        wallet: {
          balance: finalWallet.balance,
          totalWithdrawn: finalWallet.totalWithdrawn,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Reject withdrawal (Admin)
exports.rejectWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending withdrawals can be rejected',
      });
    }

    withdrawal.status = 'rejected';
    if (remarks) withdrawal.remarks = remarks;
    await withdrawal.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal rejected',
      data: withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Mark withdrawal as completed (Admin)
exports.markCompleted = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    if (withdrawal.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved withdrawals can be marked as completed',
      });
    }

    withdrawal.status = 'completed';
    withdrawal.completionDate = new Date();
    if (remarks) withdrawal.remarks = remarks;
    await withdrawal.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal marked as completed',
      data: withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
