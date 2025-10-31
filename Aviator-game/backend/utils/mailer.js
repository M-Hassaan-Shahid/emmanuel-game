const nodemailer = require("nodemailer");
require("dotenv").config();

// Dynamic transporter configuration based on environment variables
const createTransporter = () => {
    const emailService = process.env.EMAIL_SERVICE || 'gmail';

    // Configuration for different email services
    const serviceConfigs = {
        // Gmail
        gmail: {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        },

        // Outlook/Hotmail
        outlook: {
            service: 'hotmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        },

        // Yahoo
        yahoo: {
            service: 'yahoo',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        },

        // SendGrid
        sendgrid: {
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY,
            },
        },

        // Mailgun
        mailgun: {
            host: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILGUN_SMTP_USER,
                pass: process.env.MAILGUN_SMTP_PASS,
            },
        },

        // Amazon SES
        ses: {
            host: process.env.SES_SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SES_SMTP_USER,
                pass: process.env.SES_SMTP_PASS,
            },
        },

        // Custom SMTP (for any other provider)
        custom: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || process.env.EMAIL_USER,
                pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
            }
        },
    };

    const config = serviceConfigs[emailService.toLowerCase()] || serviceConfigs.gmail;

    console.log(`📧 Email service configured: ${emailService}`);

    return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Send OTP Email
const sendOTP = async (to, otp) => {
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Aviator Game'}" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Your OTP Code - Aviator Game",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #4CAF50;">Email Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="letter-spacing: 5px; color: #333; background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px;">
            ${otp}
          </h1>
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
            text: `Your OTP code is ${otp}. This code will expire in 10 minutes.`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        return { success: false, error: error.message };
    }
};

// Send Password Reset OTP
const sendPasswordResetOTP = async (to, otp) => {
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Aviator Game'}" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Password Reset OTP - Aviator Game",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #FF5722;">Password Reset Request</h2>
          <p>You requested to reset your password. Your OTP is:</p>
          <h1 style="letter-spacing: 5px; color: #333; background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px;">
            ${otp}
          </h1>
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      `,
            text: `Your password reset OTP is ${otp}. This code will expire in 10 minutes.`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Password reset email sent:", info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Error sending password reset email:", error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTP,
    sendPasswordResetOTP,
    transporter,
};
