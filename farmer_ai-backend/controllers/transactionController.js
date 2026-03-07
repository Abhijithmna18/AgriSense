/**
 * Transaction Controller
 * Handles transaction operations
 */

exports.sendMoney = async (req, res) => {
    try {
        const { receiverId, amount, description } = req.body;
        res.json({
            success: true,
            message: 'Money sent successfully',
            data: { receiverId, amount, description, transactionId: Date.now() }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.requestPayment = async (req, res) => {
    try {
        const { toUserId, amount, description } = req.body;
        res.json({
            success: true,
            message: 'Payment request sent',
            data: { toUserId, amount, description, requestId: Date.now() }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        res.json({
            success: true,
            data: { transactions: [] }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        res.json({
            success: true,
            data: { transactionId: id, status: 'completed' }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
