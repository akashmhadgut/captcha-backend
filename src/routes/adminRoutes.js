const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getStats,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getUserDetails,
  getEarningReports,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanStats,
  getRecentPurchases,
  getUsersWithActivePlans,
  getCaptchas,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getCaptchaSettings,
  updateCaptchaSettings,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics
 */
router.get('/stats', auth, adminAuth, getStats);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/dashboard', auth, adminAuth, getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', auth, adminAuth, getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/users/:id', auth, adminAuth, getUserDetails);

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   put:
 *     summary: Block user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User blocked
 */
router.put('/users/:id/block', auth, adminAuth, blockUser);

/**
 * @swagger
 * /api/admin/users/{id}/unblock:
 *   put:
 *     summary: Unblock user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unblocked
 */
router.put('/users/:id/unblock', auth, adminAuth, unblockUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/users/:id', auth, adminAuth, deleteUser);

/**
 * @swagger
 * /api/admin/plans:
 *   get:
 *     summary: Get all plans (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of plans
 */
router.get('/plans', auth, adminAuth, getPlans);

/**
 * @swagger
 * /api/admin/plans:
 *   post:
 *     summary: Create plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               validityDays:
 *                 type: number
 *               captchaLimit:
 *                 type: number
 *               earningsPerCaptcha:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Plan created
 */
router.post('/plans', auth, adminAuth, createPlan);

/**
 * @swagger
 * /api/admin/plans/{id}:
 *   put:
 *     summary: Update plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Plan updated
 */
router.put('/plans/:id', auth, adminAuth, updatePlan);

/**
 * @swagger
 * /api/admin/plans/{id}:
 *   delete:
 *     summary: Delete plan (Admin only)
 *     tags: [Admin]
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
router.delete('/plans/:id', auth, adminAuth, deletePlan);

/**
 * @swagger
 * /api/admin/captchas:
 *   get:
 *     summary: Get all captchas (Admin only)
 *     tags: [Admin]
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
 *         description: List of captchas
 */
router.get('/captchas', auth, adminAuth, getCaptchas);

/**
 * @swagger
 * /api/admin/withdrawals:
 *   get:
 *     summary: Get all withdrawals (Admin only)
 *     tags: [Admin]
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
 *         description: List of withdrawals
 */
router.get('/withdrawals', auth, adminAuth, getWithdrawals);

/**
 * @swagger
 * /api/admin/withdrawals/{id}/approve:
 *   put:
 *     summary: Approve withdrawal (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Withdrawal approved
 */
router.put('/withdrawals/:id/approve', auth, adminAuth, approveWithdrawal);

/**
 * @swagger
 * /api/admin/withdrawals/{id}/reject:
 *   put:
 *     summary: Reject withdrawal (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal rejected
 */
router.put('/withdrawals/:id/reject', auth, adminAuth, rejectWithdrawal);

/**
 * @swagger
 * /api/admin/captcha-settings:
 *   get:
 *     summary: Get captcha settings (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Captcha settings
 */
router.get('/captcha-settings', auth, adminAuth, getCaptchaSettings);

/**
 * @swagger
 * /api/admin/captcha-settings:
 *   put:
 *     summary: Update captcha settings (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reloadTime:
 *                 type: number
 *     responses:
 *       200:
 *         description: Captcha settings updated
 */
router.put('/captcha-settings', auth, adminAuth, updateCaptchaSettings);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get earning reports (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *     responses:
 *       200:
 *         description: Earning reports
 */
router.get('/reports', auth, adminAuth, getEarningReports);

/**
 * @swagger
 * /api/admin/plan-stats:
 *   get:
 *     summary: Get plan statistics with user purchases (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plan statistics
 */
router.get('/plan-stats', auth, adminAuth, getPlanStats);

/**
 * @swagger
 * /api/admin/recent-purchases:
 *   get:
 *     summary: Get recent plan purchases (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recent purchases
 */
router.get('/recent-purchases', auth, adminAuth, getRecentPurchases);

/**
 * @swagger
 * /api/admin/users-with-plans:
 *   get:
 *     summary: Get users with active plans (Admin only)
 *     tags: [Admin]
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
 *         description: Users with active plans
 */
router.get('/users-with-plans', auth, adminAuth, getUsersWithActivePlans);

module.exports = router;
