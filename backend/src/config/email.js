const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"SmartWork Hub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
  logger.info(`Email sent: ${info.messageId}`);
  return info;
};

const emailTemplates = {
  verifyEmail: (name, url) => ({
    subject: "Verify Your Email — SmartWork Hub",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#6366f1;font-size:28px;margin:0;">SmartWork Hub</h1>
          <p style="color:#94a3b8;margin-top:8px;">Enterprise Workspace Platform</p>
        </div>
        <h2 style="color:#f1f5f9;font-size:22px;">Hi ${name}! 👋</h2>
        <p style="color:#94a3b8;line-height:1.6;">Please verify your email address to complete your account setup.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${url}" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Verify Email</a>
        </div>
        <p style="color:#64748b;font-size:13px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  }),

  resetPassword: (name, otp) => ({
    subject: "Password Reset OTP — SmartWork Hub",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <h1 style="color:#6366f1;text-align:center;">SmartWork Hub</h1>
        <h2 style="color:#f1f5f9;">Hi ${name},</h2>
        <p style="color:#94a3b8;">Your password reset OTP is:</p>
        <div style="text-align:center;margin:24px 0;padding:20px;background:#1e293b;border-radius:12px;border:2px solid #6366f1;">
          <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#6366f1;">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:13px;">This OTP expires in 10 minutes.</p>
      </div>
    `,
  }),

  welcomeEmail: (name) => ({
    subject: "Welcome to SmartWork Hub! 🎉",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <h1 style="color:#6366f1;text-align:center;">SmartWork Hub</h1>
        <h2 style="color:#f1f5f9;">Welcome aboard, ${name}! 🚀</h2>
        <p style="color:#94a3b8;">Your account is ready. Start managing your work smarter with SmartWork Hub.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${process.env.CLIENT_URL}" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a>
        </div>
      </div>
    `,
  }),

  taskAssigned: (assigneeName, taskTitle, projectName, url) => ({
    subject: `Task Assigned: ${taskTitle}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:16px;">
        <h1 style="color:#6366f1;">SmartWork Hub</h1>
        <h2>Hi ${assigneeName},</h2>
        <p style="color:#94a3b8;">You have been assigned a new task:</p>
        <div style="background:#1e293b;padding:20px;border-radius:8px;border-left:4px solid #6366f1;">
          <h3 style="margin:0;color:#f1f5f9;">${taskTitle}</h3>
          <p style="color:#94a3b8;margin:8px 0 0;">Project: ${projectName}</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${url}" style="background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;">View Task</a>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
