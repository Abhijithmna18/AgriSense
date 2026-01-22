const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use strict host/port from env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html, attachments = []) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
            attachments
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Email Send Error:', error);
    }
};

exports.sendBookingRequestEmail = async (booking, farmer, warehouse) => {
    const subject = `Booking Request Received - ${booking.bookingId}`;
    const html = `
        <h3>Booking Request Submitted</h3>
        <p>Dear ${farmer.name},</p>
        <p>Your request to book storage at <strong>${warehouse.name}</strong> has been received.</p>
        <ul>
            <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
            <li><strong>Crop:</strong> ${booking.cropName} (${booking.quantity} Tons)</li>
            <li><strong>Duration:</strong> ${booking.duration} Days</li>
            <li><strong>Status:</strong> PENDING REVIEW</li>
        </ul>
        <p>We will notify you once the admin reviews your request.</p>
    `;
    await sendEmail(farmer.email, subject, html);
};

exports.sendApprovalEmail = async (booking, farmer) => {
    const subject = `Booking Approved - Action Required - ${booking.bookingId}`;
    const html = `
        <h3>Your Booking is Approved!</h3>
        <p>Dear ${farmer.name},</p>
        <p>Your booking request has been approved. Please log in to add transport details and complete payment.</p>
        <ul>
            <li><strong>Price per Ton/Day:</strong> ₹${booking.pricing.pricePerTonPerDay}</li>
            <li><strong>Total Amount:</strong> ₹${booking.pricing.totalPrice}</li>
        </ul>
        <p><a href="${process.env.CLIENT_URL}/bookings/my">Click here to complete booking</a></p>
    `;
    await sendEmail(farmer.email, subject, html);
};

exports.sendPaymentSuccessEmail = async (booking, farmer, invoicePath) => {
    const subject = `Booking Confirmed & Invoice - ${booking.bookingId}`;
    const html = `
        <h3>Booking Confirmed!</h3>
        <p>Dear ${farmer.name},</p>
        <p>We have received your payment of ₹${booking.payment.amountPaid}. Your booking is now CONFIRMED (Pending Final Allocation).</p>
        <p>Please find the invoice attached.</p>
    `;

    // Attach Invoice
    const attachments = invoicePath ? [{ filename: `Invoice-${booking.bookingId}.pdf`, path: invoicePath }] : [];

    await sendEmail(farmer.email, subject, html, attachments);
};

/**
 * Send marketplace order invoice email with PDF attachment
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.customerName - Customer name
 * @param {string} options.orderNumber - Order number
 * @param {Buffer} options.pdfBuffer - Invoice PDF buffer
 * @returns {Promise<void>}
 */
exports.sendInvoiceEmail = async ({ to, customerName, orderNumber, pdfBuffer }) => {
    try {
        const subject = `Invoice for Order #${orderNumber}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #16a34a;">Thank you for your order!</h2>
                <p>Dear ${customerName},</p>
                <p>Thank you for shopping with AgriSense. Your order has been confirmed.</p>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p>Please find your invoice attached to this email.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                    If you have any questions, please contact us at support@agrisense.com
                </p>
                <p style="color: #6b7280; font-size: 12px;">
                    This is an automated email. Please do not reply to this message.
                </p>
            </div>
        `;

        const attachments = [
            {
                filename: `invoice-${orderNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ];

        await sendEmail(to, subject, html, attachments);
        console.log(`Invoice email sent to ${to} for order ${orderNumber}`);
    } catch (error) {
        // Log error but don't throw - we don't want email failure to block order creation
        console.error('Failed to send invoice email:', error);
    }
};
