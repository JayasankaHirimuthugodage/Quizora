import nodemailer from 'nodemailer';
import { AppError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Email service class for handling email operations
 */
export class EmailService {
  static transporter = null;

  /**
   * Initialize email transporter
   */
  static async initializeTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify transporter configuration
      await this.transporter.verify();
      console.log('✅ Email transporter initialized successfully');
      
      return this.transporter;
    } catch (error) {
      console.error('❌ Email transporter initialization failed:', error.message);
      throw new AppError('Email service initialization failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Send email using template
   * @param {Object} options - Email options
   * @returns {Object} Send result
   */
  static async sendEmail({ to, subject, html, text }) {
    try {
      await this.initializeTransporter();

      const mailOptions = {
        from: `"Quizora" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Email sent successfully:', {
        to,
        subject,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new AppError('Failed to send email', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {string} resetToken - Password reset token
   * @param {string} userName - User name
   * @returns {Object} Send result
   */
  static async sendPasswordResetEmail(email, resetToken, userName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const html = this.getPasswordResetTemplate(userName, resetUrl);
    
    return this.sendEmail({
      to: email,
      subject: 'Reset Your Quizora Password',
      html
    });
  }

  /**
   * Send welcome email to new users
   * @param {string} email - Recipient email
   * @param {string} userName - User name
   * @param {string} tempPassword - Temporary password (for admin-created accounts)
   * @param {string} role - User role
   * @returns {Object} Send result
   */
  static async sendWelcomeEmail(email, userName, tempPassword, role) {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    
    const html = this.getWelcomeTemplate(userName, email, tempPassword, role, loginUrl);
    
    return this.sendEmail({
      to: email,
      subject: 'Welcome to Quizora!',
      html
    });
  }

  /**
   * Send account locked notification
   * @param {string} email - Recipient email
   * @param {string} userName - User name
   * @param {Date} unlockTime - Time when account will be unlocked
   * @returns {Object} Send result
   */
  static async sendAccountLockedEmail(email, userName, unlockTime) {
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;
    
    const html = this.getAccountLockedTemplate(userName, unlockTime, supportEmail);
    
    return this.sendEmail({
      to: email,
      subject: 'Quizora Account Temporarily Locked',
      html
    });
  }

  /**
   * Get password reset email template
   * @param {string} userName - User name
   * @param {string} resetUrl - Password reset URL
   * @returns {string} HTML template
   */
  static getPasswordResetTemplate(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #007bff; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 14px; color: #666; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Quizora</h1>
                  <h2>Password Reset Request</h2>
              </div>
              <div class="content">
                  <p>Hello ${userName},</p>
                  <p>We received a request to reset your password for your Quizora account.</p>
                  <p>Click the button below to reset your password:</p>
                  <a href="${resetUrl}" class="button">Reset Password</a>
                  <div class="warning">
                      <strong>Important:</strong>
                      <ul>
                          <li>This link will expire in 1 hour</li>
                          <li>If you didn't request this reset, please ignore this email</li>
                          <li>Never share this link with anyone</li>
                      </ul>
                  </div>
                  <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                  <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 3px;">${resetUrl}</p>
              </div>
              <div class="footer">
                  <p>This is an automated email. Please do not reply.</p>
                  <p>&copy; 2025 Quizora. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Get welcome email template
   * @param {string} userName - User name
   * @param {string} email - User email
   * @param {string} tempPassword - Temporary password
   * @param {string} role - User role
   * @param {string} loginUrl - Login URL
   * @returns {string} HTML template
   */
  static getWelcomeTemplate(userName, email, tempPassword, role, loginUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Quizora</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #28a745; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .credentials { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 14px; color: #666; }
              .security-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to Quizora!</h1>
                  <p>Your account has been created</p>
              </div>
              <div class="content">
                  <p>Hello ${userName},</p>
                  <p>Welcome to Quizora! Your account has been created with the role of <strong>${role}</strong>.</p>
                  <div class="credentials">
                      <h3>Your Login Credentials:</h3>
                      <p><strong>Email:</strong> ${email}</p>
                      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                  </div>
                  <div class="security-note">
                      <strong>Security Notice:</strong>
                      <p>For your security, please change your password immediately after your first login.</p>
                  </div>
                  <p>Click the button below to access your account:</p>
                  <a href="${loginUrl}" class="button">Login to Quizora</a>
                  <p>If you have any questions or need assistance, please contact your administrator.</p>
              </div>
              <div class="footer">
                  <p>This is an automated email. Please do not reply.</p>
                  <p>&copy; 2025 Quizora. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Get account locked email template
   * @param {string} userName - User name
   * @param {Date} unlockTime - Unlock time
   * @param {string} supportEmail - Support email
   * @returns {string} HTML template
   */
  static getAccountLockedTemplate(userName, unlockTime, supportEmail) {
    const unlockTimeString = unlockTime.toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Temporarily Locked</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .footer { text-align: center; padding: 20px; font-size: 14px; color: #666; }
              .warning { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Account Security Alert</h1>
                  <h2>Temporary Account Lock</h2>
              </div>
              <div class="content">
                  <p>Hello ${userName},</p>
                  <p>Your Quizora account has been temporarily locked due to multiple failed login attempts.</p>
                  <div class="warning">
                      <h3>Account Details:</h3>
                      <p><strong>Lock Time:</strong> ${unlockTimeString}</p>
                      <p><strong>Reason:</strong> Multiple failed login attempts detected</p>
                  </div>
                  <p>Your account will be automatically unlocked at the time specified above. You can then try logging in again.</p>
                  <p>If you believe this was not you attempting to access your account, please contact support immediately.</p>
                  <p><strong>Support Contact:</strong> ${supportEmail}</p>
              </div>
              <div class="footer">
                  <p>This is an automated security notification.</p>
                  <p>&copy; 2025 Quizora. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Strip HTML tags from text
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
  static stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}
