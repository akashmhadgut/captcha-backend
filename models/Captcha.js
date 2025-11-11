const mongoose = require("mongoose");

const captchaSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    correctText: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Captcha", captchaSchema);
