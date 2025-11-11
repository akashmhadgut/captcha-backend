const express = require("express");
const router = express.Router();
const {
  uploadCaptcha,
  getRandomCaptcha,
  submitCaptcha,
} = require("../controllers/captchaController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// 🧩 Admin: upload captcha image
router.post(
  "/upload",
  protect,
  adminOnly,
  upload.single("image"),
  uploadCaptcha
);

// 🧩 User: get a random captcha
router.get("/random", protect, getRandomCaptcha);

// 🧩 User: submit captcha answer
router.post("/submit", protect, submitCaptcha);

module.exports = router;
