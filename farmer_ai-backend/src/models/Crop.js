const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a crop name'],
        trim: true
    },
    scientificName: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    climate: {
        type: String,
        required: [true, 'Please add climate requirements']
    },
    soil: {
        type: String,
        required: [true, 'Please add soil requirements']
    },
    sowingSeason: {
        type: String,
        required: [true, 'Please add sowing season']
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

module.exports = mongoose.model('Crop', CropSchema);
