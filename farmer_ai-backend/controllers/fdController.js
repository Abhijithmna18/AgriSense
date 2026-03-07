/**
 * Fixed Deposit Controller
 * Handles fixed deposit operations
 */

exports.getFixedDeposits = async (req, res) => {
    try {
        res.json({
            success: true,
            data: { fixedDeposits: [] }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createFixedDeposit = async (req, res) => {
    try {
        const fdData = req.body;
        res.json({
            success: true,
            message: 'Fixed deposit created',
            data: { ...fdData, fdId: Date.now() }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.withdrawFixedDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        res.json({
            success: true,
            message: 'Fixed deposit withdrawn',
            data: { fdId: id, status: 'withdrawn' }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.calculateMaturity = async (req, res) => {
    try {
        const { principal, rate, duration } = req.query;
        const maturityAmount = parseFloat(principal) * (1 + parseFloat(rate) / 100 * parseInt(duration) / 12);
        res.json({
            success: true,
            data: {
                principal: parseFloat(principal),
                rate: parseFloat(rate),
                duration: parseInt(duration),
                maturityAmount: maturityAmount.toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
