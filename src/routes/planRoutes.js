const express = require('express');
const router = express.Router();
const {
  getAllPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  initializePayment,
  verifyPayment,
  selectDemoPlan,
} = require('../controllers/planController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /api/plans:
 *   get:
 *     summary: Get all active plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: List of plans
 */
router.get('/', getAllPlans);

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     summary: Get single plan
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan data
 */
router.get('/:id', getPlan);

/**
 * @swagger
 * /api/plans:
 *   post:
 *     summary: Create plan (Admin only)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Plan created
 */
router.post('/', auth, adminAuth, createPlan);

/**
 * @swagger
 * /api/plans/{id}:
 *   put:
 *     summary: Update plan (Admin only)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan updated
 */
router.put('/:id', auth, adminAuth, updatePlan);

/**
 * @swagger
 * /api/plans/{id}:
 *   delete:
 *     summary: Delete plan (Admin only)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan deleted
 */
router.delete('/:id', auth, adminAuth, deletePlan);

/**
 * @swagger
 * /api/plans/payment/initialize:
 *   post:
 *     summary: Initialize payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/payment/initialize', auth, initializePayment);

/**
 * @swagger
 * /api/plans/payment/verify:
 *   post:
 *     summary: Verify payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpayOrderId
 *               - razorpayPaymentId
 *               - razorpaySignature
 *               - planId
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post('/payment/verify', auth, verifyPayment);

/**
 * @swagger
 * /api/plans/select-demo:
 *   post:
 *     summary: Select demo plan (for new users)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Demo plan selected
 */
router.post('/select-demo', auth, selectDemoPlan);

module.exports = router;
