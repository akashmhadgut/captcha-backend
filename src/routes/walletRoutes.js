const express = require('express');
const router = express.Router();
const {
  getWallet,
  getBalance,
  getTransactions,
  getEarningsStats,
  addFunds,
} = require('../controllers/walletController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get user wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet data
 */
router.get('/', auth, getWallet);

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance information
 */
router.get('/balance', auth, getBalance);

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Transaction history
 */
router.get('/transactions', auth, getTransactions);

/**
 * @swagger
 * /api/wallet/earnings-stats:
 *   get:
 *     summary: Get earnings statistics (today, week, month)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings statistics
 */
router.get('/earnings-stats', auth, getEarningsStats);

/**
 * @swagger
 * /api/wallet/add-funds:
 *   post:
 *     summary: Add funds to wallet (Admin only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Funds added
 */
router.post('/add-funds', auth, adminAuth, addFunds);

module.exports = router;
