const Booking = require('../models/Booking');
const Warehouse = require('../models/Warehouse');

// Helper to call Ollama
async function queryOllama(prompt) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2', // Or 'mistral', ensure model is pulled
                prompt: prompt,
                stream: false
            })
        });
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Ollama Error:", error);
        return "AI Analysis Unavailable. Ensure Ollama is running.";
    }
}

// @desc    Generate AI Report for Warehouse
// @route   GET /api/warehouses/reports/ai
// @access  Admin
exports.generateAiReport = async (req, res) => {
    try {
        // Aggregate Data
        const totalWarehouses = await Warehouse.countDocuments({ status: 'ACTIVE' });
        const bookings = await Booking.find({ status: { $in: ['CONFIRMED', 'STORED', 'COMPLETED'] } });

        const totalRevenue = bookings.reduce((sum, b) => sum + (b.payment?.amountPaid || 0), 0);
        const totalTons = bookings.reduce((sum, b) => sum + b.quantity, 0);

        const prompt = `
            You are an Agri-Tech Analyst. Analyze the following warehouse data:
            - Active Warehouses: ${totalWarehouses}
            - Total Confirmed Bookings: ${bookings.length}
            - Total Revenue: ₹${totalRevenue}
            - Total Stored Volume: ${totalTons} Tons

            generate a concise, professional executive summary in bullet points highlighting utilization, revenue trends, and suggestions for optimization.
        `;

        const report = await queryOllama(prompt);

        res.status(200).json({
            success: true,
            data: {
                summary: report,
                metrics: { totalWarehouses, totalRevenue, totalTons, totalBookings: bookings.length }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
