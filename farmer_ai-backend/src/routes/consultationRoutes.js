const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Assuming this exists
const { getExperts, getConsultations, bookConsultation, cancelConsultation } = require('../controllers/consultationController');

router.use(protect);

router.get('/experts', getExperts);
router.get('/', getConsultations);
router.post('/', bookConsultation);
router.delete('/:id', cancelConsultation);

module.exports = router;
