const AiProcurementService = require('../services/aiProcurementService');

exports.previewAutoRFQ = async (req, res) => {
    try {
        const { intent } = req.body;

        if (!intent || intent.trim() === '') {
            return res.status(400).json({ success: false, message: 'Intent text required.' });
        }

        const previewData = await AiProcurementService.previewAutoRFQ(intent, req.user);

        res.status(200).json({
            success: true,
            data: previewData
        });
    } catch (error) {
        console.error('[AI Procurement Preview Error]', error);
        res.status(500).json({ success: false, message: 'Failed to generate procurement preview.', error: error.message, stack: error.stack });
    }
};

exports.confirmAutoRFQ = async (req, res) => {
    try {
        const { previewData } = req.body;

        if (!previewData || !previewData.supplier_rankings) {
            return res.status(400).json({ success: false, message: 'Valid preview data is required.' });
        }

        const result = await AiProcurementService.confirmAutoRFQ(req.user._id || req.user.id, previewData);

        res.status(200).json(result);
    } catch (error) {
        console.error('[AI Procurement Confirm Error]', error);
        res.status(500).json({ success: false, message: 'Failed to confirm bulk RFQs.' });
    }
};
