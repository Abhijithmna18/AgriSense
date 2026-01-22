const mongoose = require('mongoose');

const FarmObservationSchema = new mongoose.Schema({
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['Disease', 'Pest', 'Weather', 'General', 'Soil'],
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },
    notes: {
        type: String,
        required: [true, 'Please add observation notes']
    },
    date: {
        type: Date,
        default: Date.now
    },
    // Link to AI Analysis if applicable
    aiAnalysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlantIdentification', // Assuming this model exists or will exist roughly with this name
        default: null
    },
    images: [String]
});

module.exports = mongoose.model('FarmObservation', FarmObservationSchema);
