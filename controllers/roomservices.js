// controllers/roomservices.js

const RoomService = require("../models/Roomservice");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");

// Create a new room service — omit hotelId to create a GLOBAL service (applies to all hotels)
exports.createRoomService = async (req, res) => {
  try {
    const { name, description, status, minQuantity, maxQuantity } = req.body;
    const hotelId = req.params.hotelId || req.body.hotelId;

    // If hotelId provided, verify hotel exists
    if (hotelId) {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ success: false, message: "Hotel not found" });
      }
    }

    const service = await RoomService.create({
      hotel: hotelId || null,
      name,
      description,
      minQuantity,
      maxQuantity, 
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

// Get all room services for a specific hotel (hotel-specific + global services)
exports.getRoomServicesByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // Return services specific to this hotel OR global services (hotel: null)
    const services = await RoomService.find({
      $or: [{ hotel: hotelId }, { hotel: null }]
    }).sort({ hotel: -1, name: 1 }); // hotel-specific first, then global

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

exports.updateRoomService = async (req, res) => {
  try {
    let service = await RoomService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Room service not found" });
    }

    service = await RoomService.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteRoomService = async (req, res) => {
  try {
    const service = await RoomService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Room service not found" });
    }

    await service.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};