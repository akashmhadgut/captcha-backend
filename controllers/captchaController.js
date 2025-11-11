const Captcha = require("../models/Captcha");
const User = require("../models/User");
const Earning = require("../models/Earning");
const path = require("path");

// 🖼️ Admin: Upload captcha
exports.uploadCaptcha = async (req, res) => {
  try {
    console.log("✅ req.body:", req.body);
    console.log("✅ req.file:", req.file);

    // Fix case-insensitivity for form field
    const correctText = req.body.correctText || req.body.correcttext;

    if (!req.file) {
      return res.status(400).json({ message: "Image file missing" });
    }
    if (!correctText) {
      return res.status(400).json({ message: "correctText missing" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const captcha = await Captcha.create({ imageUrl, correctText });

    res.status(201).json({
      success: true,
      message: "Captcha uploaded successfully",
      captcha,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🎯 User: Get random captcha
exports.getRandomCaptcha = async (req, res) => {
  try {
    const captchas = await Captcha.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 1 } },
    ]);

    if (!captchas.length) {
      return res.status(404).json({ message: "No captchas available" });
    }

    res.status(200).json({ success: true, captcha: captchas[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ User: Submit captcha answer
exports.submitCaptcha = async (req, res) => {
  try {
    const { captchaId, userAnswer } = req.body;

    const captcha = await Captcha.findById(captchaId);
    const user = await User.findById(req.user._id);

    if (!captcha || !captcha.isActive) {
      return res.status(404).json({ message: "Captcha not found" });
    }

    if (captcha.correctText.toLowerCase() === userAnswer.toLowerCase()) {
      // reward user
      const earning = await Earning.create({
        userId: user._id,
        captchaId,
        amount: 0.25,
      });

      user.walletBalance += earning.amount;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Correct! Earnings added.",
        earning,
        newBalance: user.walletBalance,
      });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Incorrect captcha" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
