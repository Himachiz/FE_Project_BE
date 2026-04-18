const express = require("express");
const {
  createRoomService,
  getRoomServicesByHotel,
  getRoomServicesByBooking
} = require("../controllers/roomservices");

const router = express.Router();

// POST /api/v1/roomservices - Create a new room service
router.post("/", createRoomService);

// GET /api/v1/roomservices/hotel/:hotelId - Get all services for a hotel
router.get("/hotel/:hotelId", getRoomServicesByHotel);

// GET /api/v1/roomservices/booking/:bookingId - Get all services for a booking
router.get("/booking/:bookingId", getRoomServicesByBooking);

module.exports = router;