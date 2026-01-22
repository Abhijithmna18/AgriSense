const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    expert: {
        id: String,
        name: String,
        specialization: String,
        image: String
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    durationMinutes: {
        type: Number,
        default: 30
    },
    price: {
        type: Number,
        default: 500
    },
    status: {
        type: String,
        enum: ['upcoming', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    meetingLink: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);
