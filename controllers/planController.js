const Plan = require("../models/Plan");

// 🧩 Add new plan (Admin)
exports.createPlan = async (req, res) => {
  try {
    const { name, price, captchaLimit, durationDays } = req.body;

    const planExists = await Plan.findOne({ name });
    if (planExists) {
      return res.status(400).json({ message: "Plan already exists" });
    }

    const plan = await Plan.create({ name, price, captchaLimit, durationDays });
    res.status(201).json({ success: true, message: "Plan created", plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📋 Get all plans (Public)
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.status(200).json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✏️ Update Plan (Admin)
exports.updatePlan = async (req, res) => {
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, message: "Plan updated", updatedPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ❌ Delete Plan (Admin)
exports.deletePlan = async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Plan deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
