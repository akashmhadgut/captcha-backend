const Captcha = require('../models/Captcha');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const fs = require('fs');
const path = require('path');

// @desc Get random captcha
const svgCaptcha = require('svg-captcha');

const jwt = require('jsonwebtoken');

// @desc Generate random captcha dynamically (no admin upload)
exports.getRandomCaptcha = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('plan');

    // Check if user has active plan
    // Allow users to try captchas even without plan for demo, 
    // OR enforce it. Based on code it enforces it.
    // NOTE: If user just signed up they might not have a plan yet.
    // For now we keep the check if that's business logic.
    if (!user.plan || new Date() > user.planExpiry) {
      // Optional: Allow one or two free tries? 
      // For now, strict check as per original code
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

    // Encrypt the answer in a token (stateless verification)
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const captchaToken = jwt.sign(
      { answer: captcha.text },
      secret,
      { expiresIn: '10m' } // Captcha valid for 10 mins
    );
    console.log(`Generated Captcha: ${captcha.text}, Token Created`);

    res.status(200).json({
      success: true,
      data: {
        image: captcha.data, // SVG image string
        captchaId: captchaToken, // Send this back when submitting
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
    const { answer, captchaId } = req.body;
    const userId = req.user.id;

    if (!answer || !captchaId) {
      return res.status(400).json({
        success: false,
        message: 'Answer and Captcha ID are required',
      });
    }

    // Verify token to get correct answer
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    let decoded;
    try {
      if (!captchaId) throw new Error("Missing captchaId");
      decoded = jwt.verify(captchaId, secret);
    } catch (err) {
      console.error("Captcha Token Verify Error:", err.message);
      return res.status(400).json({
        success: false,
        message: 'Captcha expired or invalid. Please refresh.',
      });
    }

    const correctAnswer = decoded.answer;

    // Case-sensitive comparison: compare trimmed strings exactly
    // SVG Captcha text is usually mixed case.
    // We can make it case-insensitive if desired, but code was sensitive.
    // Usually captchas are case insensitive for better UX. 
    // Let's make it case-insensitive which is standard.
    const isCorrect = correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim();

    if (!isCorrect) {
      return res.status(200).json({
        success: false,
        message: 'Incorrect answer',
        earned: 0,
      });
    }

    // Continue with wallet update logic...
    const user = await User.findById(userId).populate('plan');
    const earningsPerCaptcha = user.plan ? user.plan.earningsPerCaptcha : 0;
    // Fallback if plan somehow missing during race condition

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
      correct: true
    });
  } catch (error) {
    console.error('Submit Error:', error);
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
