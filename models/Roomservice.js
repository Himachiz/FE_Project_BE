const mongoose = require('mongoose');

const RoomServiceSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: true,
    index: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
    index: true
  }

}, {
  timestamps: true,
  versionKey: false
});

// prevent duplicate service names per hotel
RoomServiceSchema.index({ hotel: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('RoomService', RoomServiceSchema);