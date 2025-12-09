const express = require('express');
const router = express.Router();
const {
  requestWithdrawal,
  getUserWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markCompleted,
} = require('../controllers/withdrawalController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /api/withdrawals/request:
 *   post:
 *     summary: Request withdrawal
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               bankDetails:
 *                 type: object
 *                 properties:
 *                   accountHolder:
 *                     type: string
 *                   accountNumber:
 *                     type: string
 *                   bankName:
 *                     type: string
 *                   ifscCode:
 *                     type: string
 *                   upiId:
 *                     type: string
 *     responses:
 *       201:
 *         description: Withdrawal requested
 */
router.post('/request', auth, requestWithdrawal);

/**
 * @swagger
 * /api/withdrawals/my:
 *   get:
 *     summary: Get user withdrawals
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User withdrawals
 */
router.get('/my', auth, getUserWithdrawals);

/**
 * @swagger
 * /api/withdrawals:
 *   get:
 *     summary: Get all withdrawals (Admin only)
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All withdrawals
 */
router.get('/', auth, adminAuth, getAllWithdrawals);

/**
 * @swagger
 * /api/withdrawals/{id}/approve:
 *   put:
 *     summary: Approve withdrawal (Admin only)
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal approved
 */
router.put('/:id/approve', auth, adminAuth, approveWithdrawal);

/**
 * @swagger
 * /api/withdrawals/{id}/reject:
 *   put:
 *     summary: Reject withdrawal (Admin only)
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal rejected
 */
router.put('/:id/reject', auth, adminAuth, rejectWithdrawal);

/**
 * @swagger
 * /api/withdrawals/{id}/complete:
 *   put:
 *     summary: Mark withdrawal as completed (Admin only)
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal completed
 */
router.put('/:id/complete', auth, adminAuth, markCompleted);

module.exports = router;
