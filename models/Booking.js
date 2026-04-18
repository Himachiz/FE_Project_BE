const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  apptDate: {
    type: Date,
    required: true
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: true,
    index: true
  },

  // store selected services with booking-specific status
  services: [
    {
      service: {
        type: mongoose.Schema.ObjectId,
        ref: 'RoomService',
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'done', 'cancelled'],
        default: 'pending',
        required: true,
        index: true
      }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);