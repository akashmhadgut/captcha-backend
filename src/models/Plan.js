const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide plan name'],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide plan price'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    captchaLimit: {
      type: Number,
      required: [true, 'Please provide captcha limit'],
    },
    validityDays: {
      type: Number,
      required: [true, 'Please provide validity in days'],
    },
    earningsPerCaptcha: {
      type: Number,
      required: [true, 'Please provide earnings per captcha'],
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
