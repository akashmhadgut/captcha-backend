const express = require('express');
const router = express.Router();
const {
  getRandomCaptcha,
  submitCaptcha,
   
} = require('../controllers/captchaController');
const auth = require('../middleware/auth');
 
/**
 * @swagger
 * /api/captchas/random:
 *   get:
 *     summary: Get random captcha
 *     tags: [Captchas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Random captcha
 */
router.get('/random', auth, getRandomCaptcha);

/**
 * @swagger
 * /api/captchas/submit:
 *   post:
 *     summary: Submit captcha answer
 *     tags: [Captchas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - captchaId
 *               - answer
 *             properties:
 *               captchaId:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Captcha result
 */
 router.post('/submit', auth, submitCaptcha);


/**
 * @swagger
 * /api/captchas/upload:
 *   post:
 *     summary: Upload captcha (Admin only)
 *     tags: [Captchas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - answer
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               answer:
 *                 type: string
 *               difficulty:
 *                 type: string
 *     responses:
 *       201:
 *         description: Captcha uploaded
 */
 module.exports = router;
