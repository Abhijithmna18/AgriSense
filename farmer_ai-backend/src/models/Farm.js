const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a farm name']
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        }
    },
    size: {
        type: Number,
        required: [true, 'Please add farm size in acres/hectares']
    },
    soilType: {
        type: String,
        enum: ['Clay', 'Sandy', 'Silty', 'Peaty', 'Chalky', 'Loamy', 'Other'],
        required: [true, 'Please add soil type']
    },
    irrigationSource: {
        type: String,
        enum: ['Rainfed', 'Well', 'Canal', 'River', 'Other'],
        default: 'Rainfed'
    },
    images: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Farm', FarmSchema);
