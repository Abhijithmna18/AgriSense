const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateInvoice = (booking, farmer, warehouse) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const fileName = `Invoice-${booking.bookingId}.pdf`;
            const filePath = path.join(__dirname, '../../uploads/invoices', fileName);

            // Ensure directory exists
            fs.mkdirSync(path.dirname(filePath), { recursive: true });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('INVOICE', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Invoice Number: INV-${booking.bookingId}`);
            doc.text(`Date: ${new Date().toLocaleDateString()}`);
            doc.moveDown();

            // From & To
            doc.text(`From: FarmerAI - ${warehouse.name}`, { bold: true });
            doc.text(`Location: ${warehouse.location.city}, ${warehouse.location.state}`);
            doc.moveDown();
            doc.text(`To: ${farmer.name}`);
            doc.text(`Contact: ${farmer.email}`);
            doc.moveDown();

            // Table Header
            const tableTop = 250;
            doc.font('Helvetica-Bold');
            doc.text('Description', 50, tableTop);
            doc.text('Quantity', 200, tableTop);
            doc.text('Duration', 300, tableTop);
            doc.text('Rate', 400, tableTop);
            doc.text('Total', 500, tableTop);
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // Table Content
            doc.font('Helvetica');
            const y = tableTop + 25;
            doc.text(`Storage for ${booking.cropName}`, 50, y);
            doc.text(`${booking.quantity} Tons`, 200, y);
            doc.text(`${booking.duration} Days`, 300, y);
            doc.text(`₹${booking.pricing.pricePerTonPerDay}`, 400, y);
            doc.text(`₹${booking.pricing.totalPrice}`, 500, y);

            // Footer / Total
            const totalY = y + 50;
            doc.moveTo(50, totalY).lineTo(550, totalY).stroke();
            doc.font('Helvetica-Bold').fontSize(14);
            doc.text(`Grand Total: ₹${booking.pricing.totalPrice}`, 350, totalY + 10);

            doc.fontSize(10).text('Thank you for using FarmerAI.', 50, 700, { align: 'center', width: 500 });

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', (err) => reject(err));

        } catch (error) {
            reject(error);
        }
    });
};
