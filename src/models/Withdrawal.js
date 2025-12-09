const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide amount'],
      min: [200, 'Minimum withdrawal amount is 200'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      upiId: String,
    },
    remarks: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    completionDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
