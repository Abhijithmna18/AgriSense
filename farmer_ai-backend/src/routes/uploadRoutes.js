const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

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

module.exports = router;
