const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // Can reference Withdrawal, Payment, or Captcha submission
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
