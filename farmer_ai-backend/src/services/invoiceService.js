const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate invoice PDF for an order
 * @param {Object} order - Order object with populated buyer and items
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generateInvoicePDF = async (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            // Collect PDF data
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Company Header
            doc.fontSize(24).font('Helvetica-Bold').text('AgriSense', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('Ecosystem Platform for Farmers', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
            doc.moveDown(2);

            // Invoice Details
            const invoiceY = doc.y;
            doc.fontSize(10).font('Helvetica-Bold').text('Invoice Number:', 50, invoiceY);
            doc.font('Helvetica').text(order.orderNumber || order._id.toString().slice(-8).toUpperCase(), 150, invoiceY);

            doc.font('Helvetica-Bold').text('Order Date:', 50, invoiceY + 15);
            doc.font('Helvetica').text(new Date(order.createdAt).toLocaleDateString('en-IN'), 150, invoiceY + 15);

            doc.font('Helvetica-Bold').text('Payment Status:', 50, invoiceY + 30);
            doc.font('Helvetica').text(order.paymentStatus.toUpperCase(), 150, invoiceY + 30);

            // Customer Details
            doc.font('Helvetica-Bold').text('Bill To:', 350, invoiceY);
            doc.font('Helvetica').text(`${order.buyer.firstName} ${order.buyer.lastName}`, 350, invoiceY + 15);
            doc.text(order.buyer.email, 350, invoiceY + 30);
            if (order.shippingAddress) {
                doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, 350, invoiceY + 45);
                doc.text(order.shippingAddress.zipCode || '', 350, invoiceY + 60);
            }

            doc.moveDown(4);

            // Items Table Header
            const tableTop = doc.y;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Item', 50, tableTop);
            doc.text('Qty', 300, tableTop);
            doc.text('Price', 370, tableTop);
            doc.text('Amount', 470, tableTop, { align: 'right' });

            // Draw header line
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // Items
            let currentY = tableTop + 25;
            doc.font('Helvetica');

            order.items.forEach((item, index) => {
                const productName = item.productName || 'Product';
                const quantity = item.quantity;
                const price = item.priceAtTime;
                const subtotal = item.subtotal;

                doc.text(productName, 50, currentY, { width: 230 });
                doc.text(quantity.toString(), 300, currentY);
                doc.text(`₹${price}`, 370, currentY);
                doc.text(`₹${subtotal}`, 470, currentY, { align: 'right' });

                currentY += 25;
            });

            // Draw line before totals
            doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
            currentY += 15;

            // Totals
            doc.font('Helvetica');
            doc.text('Subtotal:', 370, currentY);
            doc.text(`₹${order.totalAmount}`, 470, currentY, { align: 'right' });

            currentY += 20;
            doc.text('Shipping:', 370, currentY);
            doc.text('Free', 470, currentY, { align: 'right' });

            currentY += 20;
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('Total:', 370, currentY);
            doc.text(`₹${order.totalAmount}`, 470, currentY, { align: 'right' });

            // Footer
            doc.fontSize(8).font('Helvetica').text(
                'Thank you for your business!',
                50,
                700,
                { align: 'center', width: 500 }
            );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
