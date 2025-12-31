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
