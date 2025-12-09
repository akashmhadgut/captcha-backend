const mongoose = require('mongoose');

const captchaSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, 'Please provide image path'],
    },
    answer: {
      type: String,
      required: [true, 'Please provide answer'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Captcha', captchaSchema);
