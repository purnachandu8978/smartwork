const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../../controllers/auth.controller");
const { authenticate } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validate");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("../../validations/auth.validation");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", validate(registerSchema), authController.register.bind(authController));

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verify email with token
 *     tags: [Auth]
 *     security: []
 */
router.get("/verify-email", authController.verifyEmail.bind(authController));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 */
router.post("/login", validate(loginSchema), authController.login.bind(authController));
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post("/logout", authenticate, authController.logout.bind(authController));
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));
router.post("/verify-otp", authController.verifyOTP.bind(authController));
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword.bind(authController));
router.put("/change-password", authenticate, validate(changePasswordSchema), authController.changePassword.bind(authController));
router.get("/me", authenticate, authController.getMe.bind(authController));

// ─── OAuth Routes ─────────────────────────────────────────────────────────────
router.get("/google", passport.authenticate("google", { session: false, scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }), authController.googleCallback.bind(authController));

router.get("/github", passport.authenticate("github", { session: false, scope: ["user:email"] }));
router.get("/github/callback", passport.authenticate("github", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }), authController.githubCallback.bind(authController));

module.exports = router;
