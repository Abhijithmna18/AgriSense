const Consultation = require('../models/Consultation');

// Mock Experts Data
const EXPERTS = [
    {
        id: 'exp_1',
        name: 'Dr. Sarah Swaminathan',
        specialization: 'Soil Health & Agronomy',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
        price: 500,
        availableSlots: ['10:00 AM', '02:00 PM', '04:00 PM']
    },
    {
        id: 'exp_2',
        name: 'Prof. Rajesh Koothrappali',
        specialization: 'Crop Disease Specialist',
        image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
        price: 750,
        availableSlots: ['09:00 AM', '11:00 AM', '03:00 PM']
    }
];

// @desc    Get available experts
// @route   GET /api/consultations/experts
// @access  Private
exports.getExperts = (req, res) => {
    res.json(EXPERTS);
};

// @desc    Get user consultations
// @route   GET /api/consultations
// @access  Private
exports.getConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find({ user: req.user._id }).sort({ scheduledAt: 1 });
        res.json(consultations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Book a consultation
// @route   POST /api/consultations
// @access  Private
exports.bookConsultation = async (req, res) => {
    try {
        const { expertId, date, timeSlot } = req.body;
        const expert = EXPERTS.find(e => e.id === expertId);

        if (!expert) {
            return res.status(404).json({ message: 'Expert not found' });
        }

        // Generate a fake meeting link
        const meetingLink = `https://meet.google.com/abc-${Math.random().toString(36).substring(7)}-xyz`;

        // Construct simplified Date object (In prod, handle timezones strictly)
        // Assuming date is "YYYY-MM-DD" and timeSlot is "HH:mm AM/PM"
        // For strictness, let's just use the string for display or a simple Date parse
        const scheduledAt = new Date(`${date} ${timeSlot}`);

        const consultation = await Consultation.create({
            user: req.user._id,
            expert: {
                id: expert.id,
                name: expert.name,
                specialization: expert.specialization,
                image: expert.image
            },
            scheduledAt,
            price: expert.price,
            meetingLink
        });

        res.status(201).json(consultation);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Cancel a consultation
// @route   DELETE /api/consultations/:id
// @access  Private
exports.cancelConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findOne({ _id: req.params.id, user: req.user._id });

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        consultation.status = 'cancelled';
        await consultation.save();

        res.json({ message: 'Consultation cancelled', id: req.params.id });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
