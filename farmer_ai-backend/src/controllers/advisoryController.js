/**
 * advisoryController.js
 * Handles expert consultation booking and advisory services.
 * Uses the Consultation model.
 */
const Consultation = require('../models/Consultation');
const notificationService = require('../services/notificationService');

/** Static list of available experts */
const EXPERTS = [
    { id: 'exp1', name: 'Dr. Ramesh Kumar', specialization: 'Soil Science & Crop Nutrition', rating: 4.8, sessions: 142, fee: 500, image: 'https://i.pravatar.cc/100?img=11', available: true },
    { id: 'exp2', name: 'Dr. Priya Nair', specialization: 'Plant Pathology & Disease Control', rating: 4.9, sessions: 217, fee: 600, image: 'https://i.pravatar.cc/100?img=47', available: true },
    { id: 'exp3', name: 'Dr. Suresh Patel', specialization: 'Agronomy & Crop Management', rating: 4.7, sessions: 98, fee: 450, image: 'https://i.pravatar.cc/100?img=12', available: true },
    { id: 'exp4', name: 'Dr. Meera Iyer', specialization: 'Irrigation & Water Management', rating: 4.6, sessions: 75, fee: 400, image: 'https://i.pravatar.cc/100?img=48', available: false },
    { id: 'exp5', name: 'Dr. Anil Singh', specialization: 'Organic Farming & Sustainability', rating: 4.8, sessions: 189, fee: 550, image: 'https://i.pravatar.cc/100?img=15', available: true },
];

/**
 * @desc    List all available experts
 * @route   GET /api/advisory/experts
 * @access  Private
 */
exports.listExperts = async (req, res) => {
    const { specialization } = req.query;
    let experts = EXPERTS;
    if (specialization) {
        experts = experts.filter((e) => e.specialization.toLowerCase().includes(specialization.toLowerCase()));
    }
    res.json({ success: true, count: experts.length, data: experts });
};

/**
 * @desc    Book a consultation with an expert
 * @route   POST /api/advisory/book
 * @access  Private
 */
exports.bookConsultation = async (req, res) => {
    const { expertId, scheduledAt, notes } = req.body;

    if (!expertId || !scheduledAt) {
        return res.status(400).json({ success: false, message: 'expertId and scheduledAt are required.' });
    }

    const expert = EXPERTS.find((e) => e.id === expertId);
    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found.' });
    if (!expert.available) return res.status(400).json({ success: false, message: 'This expert is not available for booking.' });

    // Prevent double-booking same slot
    const conflict = await Consultation.findOne({
        'expert.id': expertId,
        scheduledAt: new Date(scheduledAt),
        status: 'upcoming'
    });
    if (conflict) return res.status(409).json({ success: false, message: 'This time slot is already booked. Choose another.' });

    // Generate a Jitsi-based meeting link (no API key required)
    const roomName = `agrisense-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const meetingLink = `https://meet.jit.si/${roomName}`;

    const consultation = await Consultation.create({
        user: req.user.id,
        expert: {
            id: expert.id,
            name: expert.name,
            specialization: expert.specialization,
            image: expert.image
        },
        scheduledAt: new Date(scheduledAt),
        price: expert.fee,
        meetingLink,
        notes: notes || ''
    });

    // Send in-app notification
    await notificationService.sendSystemAlert(
        req.user.id,
        '📅 Consultation Booked',
        `Your session with ${expert.name} is confirmed for ${new Date(scheduledAt).toLocaleString()}. Meeting link sent.`
    );

    res.status(201).json({ success: true, data: consultation });
};

/**
 * @desc    Get all consultations for the logged-in user
 * @route   GET /api/advisory/my-consultations
 * @access  Private
 */
exports.getMyConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find({ user: req.user.id }).sort({ scheduledAt: -1 });
        res.json({ success: true, count: consultations.length, data: consultations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch consultations.' });
    }
};

/**
 * @desc    Cancel a consultation
 * @route   PUT /api/advisory/:id/cancel
 * @access  Private
 */
exports.cancelConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findOne({ _id: req.params.id, user: req.user.id });
        if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found.' });
        if (consultation.status !== 'upcoming') {
            return res.status(400).json({ success: false, message: 'Only upcoming consultations can be cancelled.' });
        }

        consultation.status = 'cancelled';
        await consultation.save();
        res.json({ success: true, data: consultation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to cancel consultation.' });
    }
};

/**
 * @desc    Get available time slots for an expert on a date
 * @route   GET /api/advisory/slots?expertId=exp1&date=2025-03-10
 * @access  Private
 */
exports.getAvailableSlots = async (req, res) => {
    const { expertId, date } = req.query;
    if (!expertId || !date) return res.status(400).json({ success: false, message: 'expertId and date are required.' });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const booked = await Consultation.find({
        'expert.id': expertId,
        scheduledAt: { $gte: dayStart, $lte: dayEnd },
        status: 'upcoming'
    }).select('scheduledAt');

    const bookedHours = new Set(booked.map((b) => new Date(b.scheduledAt).getHours()));

    // Available slots: 9am–5pm, 30-min intervals
    const slots = [];
    for (let h = 9; h < 18; h++) {
        for (const m of [0, 30]) {
            const slot = new Date(date);
            slot.setHours(h, m, 0, 0);
            if (slot < new Date()) continue; // Skip past slots
            slots.push({
                datetime: slot.toISOString(),
                available: !bookedHours.has(h),
                label: slot.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            });
        }
    }

    res.json({ success: true, date, expertId, slots });
};
