const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    score: {
        type: Number,
        required: [true, 'Please add a rating between 0 and 5'],
        min: 0,
        max: 5
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'Hotel',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// A user can only rate a specific hotel once
RatingSchema.index({ hotel: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
