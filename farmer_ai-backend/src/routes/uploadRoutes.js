const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { analyzeImage } = require('../services/generalImageAnalysisService');

const uploadDocument = require('../middleware/uploadDocument');

router.post('/', upload.single('image'), (req, res) => {
    if (req.file) {
        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: `/${req.file.path.replace(/\\/g, '/')}`
        });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

router.post('/analyze', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const analysisResult = await analyzeImage(req.file.path);

        res.status(200).json({
            success: true,
            imageUrl: `/${req.file.path.replace(/\\/g, '/')}`,
            analysis: analysisResult
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Analysis failed', error: error.message });
    }
});

router.post('/document', uploadDocument.single('file'), (req, res) => {
    if (req.file) {
        res.status(200).json({
            message: 'Document uploaded successfully',
            fileUrl: `/${req.file.path.replace(/\\/g, '/')}`
        });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

module.exports = router;
