// controllers/roomservices.js

const RoomService = require("../models/RoomService");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");

// Create a new room service for a hotel
exports.createRoomService = async (req, res) => {
  try {
    const { hotelId, name, description, status } = req.body;

    // Verify hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    const service = await RoomService.create({
      hotel: hotelId,
      name,
      description,
      status: status || 'available'
    });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all room services for a specific hotel
exports.getRoomServicesByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const services = await RoomService.find({ hotel: hotelId });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all services for a specific booking
exports.getRoomServicesByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate({
      path: 'services',
      select: 'name description status'
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      count: booking.services.length,
      data: booking.services
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};