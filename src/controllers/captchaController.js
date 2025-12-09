const Captcha = require('../models/Captcha');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const fs = require('fs');
const path = require('path');

// @desc Get random captcha
 const svgCaptcha = require('svg-captcha');

// @desc Generate random captcha dynamically (no admin upload)
exports.getRandomCaptcha = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('plan');

    // Check if user has active plan
    if (!user.plan || new Date() > user.planExpiry) {
      return res.status(403).json({
        success: false,
        message: 'Please purchase a plan to access captchas',
      });
    }

    // Generate new captcha
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 3,
      color: true,
      background: '#f9f9f9',
      width: 180,
      height: 60,
    });

    // Option 1: Store answer temporarily in session or cache (recommended)
    req.session = req.session || {};
    req.session.captchaAnswer = captcha.text;

    // Option 2: (if frontend sends captchaId) — skip database usage

    res.status(200).json({
      success: true,
      data: {
        image: captcha.data, // SVG image string
        difficulty: 'medium',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// @desc Submit captcha answer
exports.submitCaptcha = async (req, res) => {
  try {
    const { answer } = req.body;
    const userId = req.user.id;

    if (!answer) {
      return res.status(400).json({
        success: false,
        message: 'Answer is required',
      });
    }

    // Compare with stored captcha answer
    const correctAnswer = req.session?.captchaAnswer;
    if (!correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Captcha expired or not found',
      });
    }

    // Case-sensitive comparison: compare trimmed strings exactly
    const isCorrect = correctAnswer.trim() === answer.trim();

    if (!isCorrect) {
      return res.status(200).json({
        success: false,
        message: 'Incorrect answer',
        earned: 0,
      });
    }

    // Continue with wallet update logic as before...
    const user = await User.findById(userId).populate('plan');
    const earningsPerCaptcha = user.plan.earningsPerCaptcha;

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = await Wallet.create({ user: userId });

    wallet.balance += earningsPerCaptcha;
    wallet.totalEarned += earningsPerCaptcha;
    await wallet.save();

    // Create transaction record for earnings
    const transaction = await Transaction.create({
      user: userId,
      type: 'credit',
      amount: earningsPerCaptcha,
      description: 'Captcha solved - Earnings',
      status: 'completed',
    });

    // Link transaction to wallet
    await Wallet.findByIdAndUpdate(
      wallet._id,
      { $push: { transactions: transaction._id } },
      { new: true }
    );

    user.totalCaptchasSolved += 1;
    user.totalEarnings += earningsPerCaptcha;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Correct answer! Earnings credited',
      earned: earningsPerCaptcha,
      totalBalance: wallet.balance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// @desc Upload captcha (Admin)
exports.uploadCaptcha = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image',
      });
    }

    const { answer, difficulty } = req.body;

    if (!answer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide answer for the captcha',
      });
    }

    const captcha = new Captcha({
      image: req.file.path,
      answer,
      difficulty: difficulty || 'medium',
    });

    await captcha.save();

    res.status(201).json({
      success: true,
      message: 'Captcha uploaded successfully',
      data: captcha,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get all captchas (Admin)
exports.getAllCaptchas = async (req, res, next) => {
  try {
    const captchas = await Captcha.find();

    res.status(200).json({
      success: true,
      count: captchas.length,
      data: captchas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Delete captcha (Admin)
exports.deleteCaptcha = async (req, res, next) => {
  try {
    const captcha = await Captcha.findById(req.params.id);

    if (!captcha) {
      return res.status(404).json({
        success: false,
        message: 'Captcha not found',
      });
    }

    // Delete file
    if (captcha.image && fs.existsSync(captcha.image)) {
      fs.unlinkSync(captcha.image);
    }

    await Captcha.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Captcha deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update captcha (Admin)
exports.updateCaptcha = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If new image is uploaded
    if (req.file) {
      const captcha = await Captcha.findById(id);
      if (captcha && captcha.image && fs.existsSync(captcha.image)) {
        fs.unlinkSync(captcha.image);
      }
      updates.image = req.file.path;
    }

    const captcha = await Captcha.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!captcha) {
      return res.status(404).json({
        success: false,
        message: 'Captcha not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Captcha updated successfully',
      data: captcha,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
