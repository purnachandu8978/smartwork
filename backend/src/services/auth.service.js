const crypto = require("crypto");
const User = require("../models/User");
const { generateTokenPair, verifyRefreshToken, REFRESH_TOKEN_EXPIRE } = require("../config/jwt");
const { generateOTP, verifyOTPHash, generateEmailToken } = require("../utils/otp");
const { sendEmail, emailTemplates } = require("../config/email");
const { ApiError } = require("../utils/ApiError");
const logger = require("../utils/logger");

class AuthService {
  async register({ firstName, lastName, email, password, role = "employee" }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw ApiError.conflict("Email already registered");

    const { token, hashedToken, expiresAt } = generateEmailToken();

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: expiresAt,
    });

    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}&email=${email}`;
    const { subject, html } = emailTemplates.verifyEmail(firstName, verifyUrl);
    await sendEmail({ to: email, subject, html }).catch((err) =>
      logger.error("Failed to send verification email:", err)
    );

    return user.toPublicJSON();
  }

  async verifyEmail(token, email) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) throw ApiError.badRequest("Invalid or expired verification link");

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // Send welcome email
    const { subject, html } = emailTemplates.welcomeEmail(user.firstName);
    await sendEmail({ to: user.email, subject, html }).catch(() => {});

    return { message: "Email verified successfully" };
  }

  async login({ email, password, rememberMe = false, ip, userAgent }) {
    const user = await User.findOne({ email }).select("+password +refreshTokens");
    if (!user) throw ApiError.unauthorized("Invalid email or password");
    if (!user.isEmailVerified) throw ApiError.unauthorized("Please verify your email first");
    if (!user.isActive) throw ApiError.forbidden("Your account has been deactivated");

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw ApiError.unauthorized("Invalid email or password");

    const { accessToken, refreshToken } = generateTokenPair(user);

    // Store refresh token
    user.cleanExpiredRefreshTokens();
    const expireMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    user.refreshTokens.push({
      token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      expiresAt: new Date(Date.now() + expireMs),
      device: userAgent,
      ip,
    });
    user.lastLogin = new Date();
    await user.save();

    return { accessToken, refreshToken, user: user.toPublicJSON() };
  }

  async refreshTokens(refreshToken, ip) {
    const decoded = verifyRefreshToken(refreshToken);
    const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const user = await User.findById(decoded.id).select("+refreshTokens");
    if (!user) throw ApiError.unauthorized("Invalid refresh token");

    const storedToken = user.refreshTokens.find(
      (rt) => rt.token === hashedToken && rt.expiresAt > new Date()
    );
    if (!storedToken) throw ApiError.unauthorized("Refresh token expired or invalid");

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== hashedToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);
    user.refreshTokens.push({
      token: crypto.createHash("sha256").update(newRefreshToken).digest("hex"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip,
    });
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId, refreshToken) {
    const user = await User.findById(userId).select("+refreshTokens");
    if (!user) return;

    const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== hashedToken);
    await user.save();
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    // Don't reveal if email exists
    if (!user) return { message: "If this email exists, an OTP has been sent" };

    const { otp, hashedOTP, expiresAt } = generateOTP();
    user.passwordResetOTP = hashedOTP;
    user.passwordResetExpiry = expiresAt;
    await user.save();

    const { subject, html } = emailTemplates.resetPassword(user.firstName, otp);
    await sendEmail({ to: email, subject, html }).catch((err) =>
      logger.error("Failed to send OTP email:", err)
    );

    return { message: "If this email exists, an OTP has been sent" };
  }

  async verifyOTP(email, otp) {
    const user = await User.findOne({
      email,
      passwordResetExpiry: { $gt: Date.now() },
    }).select("+passwordResetOTP +passwordResetExpiry");

    if (!user || !user.passwordResetOTP) throw ApiError.badRequest("Invalid or expired OTP");

    const isValid = verifyOTPHash(otp, user.passwordResetOTP);
    if (!isValid) throw ApiError.badRequest("Invalid OTP");

    return { message: "OTP verified successfully" };
  }

  async resetPassword(email, otp, newPassword) {
    const user = await User.findOne({
      email,
      passwordResetExpiry: { $gt: Date.now() },
    }).select("+passwordResetOTP +passwordResetExpiry");

    if (!user || !user.passwordResetOTP) throw ApiError.badRequest("Invalid or expired OTP");

    const isValid = verifyOTPHash(otp, user.passwordResetOTP);
    if (!isValid) throw ApiError.badRequest("Invalid OTP");

    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetExpiry = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return { message: "Password reset successfully" };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw ApiError.notFound("User not found");

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw ApiError.unauthorized("Current password is incorrect");

    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return { message: "Password changed successfully. Please log in again." };
  }

  async handleOAuthLogin(user, ip, userAgent) {
    const { accessToken, refreshToken } = generateTokenPair(user);

    const userDoc = await User.findById(user._id).select("+refreshTokens");
    userDoc.cleanExpiredRefreshTokens();
    userDoc.refreshTokens.push({
      token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      device: userAgent,
      ip,
    });
    userDoc.lastLogin = new Date();
    await userDoc.save();

    return { accessToken, refreshToken, user: userDoc.toPublicJSON() };
  }
}

module.exports = new AuthService();
