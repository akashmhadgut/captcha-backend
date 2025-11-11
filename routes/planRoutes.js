const express = require("express");
const router = express.Router();
const {
  createPlan,
  getAllPlans,
  updatePlan,
  deletePlan,
} = require("../controllers/planController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Public (show plans)
router.get("/", getAllPlans);

// Admin only
router.post("/", protect, adminOnly, createPlan);
router.put("/:id", protect, adminOnly, updatePlan);
router.delete("/:id", protect, adminOnly, deletePlan);

module.exports = router;
