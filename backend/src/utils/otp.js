const { totp } = require("otplib");
const crypto = require("crypto");

// Configure TOTP for 6-digit OTPs valid for 10 minutes
totp.options = { digits: 6, step: 600 };

/**
 * Generate a 6-digit OTP and its hashed form
 */
const generateOTP = () => {
  const secret = crypto.randomBytes(16).toString("hex");
  const otp = totp.generate(secret);
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return { otp, hashedOTP, secret, expiresAt };
};

/**
 * Verify an OTP against its hash
 */
const verifyOTPHash = (inputOTP, storedHash) => {
  const inputHash = crypto.createHash("sha256").update(inputOTP).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(inputHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
};

/**
 * Generate a secure random token for email verification links
 */
const generateEmailToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return { token, hashedToken, expiresAt };
};

module.exports = { generateOTP, verifyOTPHash, generateEmailToken };
