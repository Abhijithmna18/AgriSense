const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    listExperts,
    bookConsultation,
    getMyConsultations,
    cancelConsultation,
    getAvailableSlots
} = require('../controllers/advisoryController');

router.use(protect);

// GET /api/advisory/experts?specialization=...
router.get('/experts', listExperts);

// GET /api/advisory/slots?expertId=exp1&date=2025-03-10
router.get('/slots', getAvailableSlots);

// GET /api/advisory/my-consultations
router.get('/my-consultations', getMyConsultations);

// POST /api/advisory/book
router.post('/book', bookConsultation);

// PUT /api/advisory/:id/cancel
router.put('/:id/cancel', cancelConsultation);

module.exports = router;
