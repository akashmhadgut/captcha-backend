const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    captchaId: { type: mongoose.Schema.Types.ObjectId, ref: "Captcha", required: true },
    amount: { type: Number, default: 0.25 }, // per correct captcha
  },
  { timestamps: true }
);

module.exports = mongoose.model("Earning", earningSchema);
