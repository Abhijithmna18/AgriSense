const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

/**
 * Send verification email with OTP
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.name - Recipient name
 * @param {String} options.otp - OTP code
 * @param {String} options.link - Verification link
 */
const sendVerificationEmail = async ({ to, name, otp, link }) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"AgriSense" <noreply@agrisense.com>',
        to,
        subject: 'Verify Your Email - AgriSense',
        text: `
Hello ${name},

Thank you for registering with AgriSense!

Your verification code is: ${otp}

This code will expire in 10 minutes.

Alternatively, you can click the link below to verify your email:
${link}

If you didn't request this, please ignore this email.

Best regards,
AgriSense Team
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #1B4332;
            background-color: #F9F8F4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #2D7A4F, #52B788);
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
        }
        .otp-box {
            background: #F9F8F4;
            border: 2px dashed #D4AF37;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #2D7A4F;
            letter-spacing: 8px;
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2D7A4F, #52B788);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            margin: 20px 0;
        }
        .footer {
            background: #F9F8F4;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌱 AgriSense</h1>
        </div>
        <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with AgriSense! We're excited to have you join our community of smart farmers.</p>
            
            <p>To complete your registration, please verify your email address using the code below:</p>
            
            <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>
            
            <p style="text-align: center;">
                <a href="${link}" class="button">Verify Email</a>
            </p>
            
            <p style="font-size: 14px; color: #666;">
                If you didn't create an account with AgriSense, please ignore this email.
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} AgriSense. All rights reserved.</p>
            <p>Intelligent Agriculture for a Smarter Future</p>
        </div>
    </div>
</body>
</html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send verification email');
    }
};

/**
 * Send password reset email
 * @param {Object} options - Email options
 */
const sendPasswordResetEmail = async ({ to, name, otp, link }) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"AgriSense" <noreply@agrisense.com>',
        to,
        subject: 'Reset Your Password - AgriSense',
        text: `
Hello ${name},

We received a request to reset your password.

Your password reset code is: ${otp}

This code will expire in 10 minutes.

Alternatively, click the link below:
${link}

If you didn't request this, please ignore this email.

Best regards,
AgriSense Team
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1B4332; background-color: #F9F8F4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2D7A4F, #52B788); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .otp-box { background: #F9F8F4; border: 2px dashed #D4AF37; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #2D7A4F; letter-spacing: 8px; margin: 10px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #2D7A4F, #52B788); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 20px 0; }
        .footer { background: #F9F8F4; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌱 AgriSense</h1>
        </div>
        <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password.</p>
            <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Password Reset Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>
            <p style="text-align: center;">
                <a href="${link}" class="button">Reset Password</a>
            </p>
            <p style="font-size: 14px; color: #666;">
                If you didn't request this, please ignore this email and your password will remain unchanged.
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} AgriSense. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
