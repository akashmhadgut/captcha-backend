const mongoose = require("mongoose");

const walletTxnSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletTransaction", walletTxnSchema);
