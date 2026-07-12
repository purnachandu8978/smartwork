const authService = require("../services/auth.service");
const { ApiResponse } = require("../utils/ApiResponse");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

class AuthController {
  async register(req, res) {
    const user = await authService.register(req.body);
    ApiResponse.created(res, user, "Registration successful. Please verify your email.");
  }

  async verifyEmail(req, res) {
    const { token, email } = req.query;
    const result = await authService.verifyEmail(token, email);
    ApiResponse.success(res, result, result.message);
  }

  async login(req, res) {
    const { accessToken, refreshToken, user } = await authService.login({
      ...req.body,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    ApiResponse.success(res, { accessToken, user }, "Login successful");
  }

  async refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token not found" });
    }

    const tokens = await authService.refreshTokens(refreshToken, req.ip);
    res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS);
    ApiResponse.success(res, { accessToken: tokens.accessToken }, "Token refreshed");
  }

  async logout(req, res) {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (refreshToken) {
      await authService.logout(req.user._id, refreshToken);
    }
    res.clearCookie("refreshToken");
    ApiResponse.success(res, null, "Logged out successfully");
  }

  async forgotPassword(req, res) {
    const result = await authService.forgotPassword(req.body.email);
    ApiResponse.success(res, result, result.message);
  }

  async verifyOTP(req, res) {
    const result = await authService.verifyOTP(req.body.email, req.body.otp);
    ApiResponse.success(res, result, result.message);
  }

  async resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    ApiResponse.success(res, result, result.message);
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
    res.clearCookie("refreshToken");
    ApiResponse.success(res, result, result.message);
  }

  async getMe(req, res) {
    ApiResponse.success(res, req.user.toPublicJSON(), "User profile fetched");
  }

  async googleCallback(req, res) {
    const { accessToken, refreshToken } = await authService.handleOAuthLogin(
      req.user,
      req.ip,
      req.get("User-Agent")
    );
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${accessToken}`);
  }

  async githubCallback(req, res) {
    const { accessToken, refreshToken } = await authService.handleOAuthLogin(
      req.user,
      req.ip,
      req.get("User-Agent")
    );
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${accessToken}`);
  }
}

module.exports = new AuthController();
