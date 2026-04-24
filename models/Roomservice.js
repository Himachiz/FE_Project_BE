const mongoose = require('mongoose');

const RoomServiceSchema = new mongoose.Schema({
  // If hotel is null/omitted, this service is GLOBAL and applies to all hotels
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    default: null,
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
  },

  maxQuantity: {
    type: Number,
    required: [true, 'Please specify maximum quantity'],
    min: 1
  },
  
  minQuantity: {
    type: Number,
    required: [true, 'Please specify minimum quantity'],
    default: 1
  }

}, {
  timestamps: true,
  versionKey: false
});

// prevent duplicate names per hotel (sparse so null hotel fields don't all conflict)
RoomServiceSchema.index({ hotel: 1, name: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('RoomService', RoomServiceSchema);