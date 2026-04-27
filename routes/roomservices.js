const express = require("express");
// routes/roomservices.js
// routes/roomservices.js
const {
  createRoomService,
  getRoomServicesByHotel,
  getRoomServicesByBooking,
  getRoomServiceById,
  updateRoomService,
  deleteRoomService,
} = require("../controllers/roomservices");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: RoomServices
 *   description: Room service management
 */

/**
 * @swagger
 * /roomservices:
 *   post:
 *     summary: Create a new room service
 *     description: Create a new room service. Only accessible by admins.
 *     tags: [RoomServices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoomService'
 *           example:
 *             hotel: "69be6cb8cbaa281bfca363af"
 *             name: "Extra Blanket"
 *             description: "ผ้าห่มเพิ่มเติมสำหรับความอบอุ่นในห้องพัก"
 *             status: "available"
 *             minQuantity: 1
 *             maxQuantity: 20
 *     responses:
 *       201:
 *         description: Created successfully
 */
router.post("/", protect, authorize('admin'), createRoomService);

/**
 * @swagger
 * /roomservices/hotel/{hotelId}:
 *   get:
 *     summary: Get all services for a hotel
 *     description: Retrieve all room services associated with a specific hotel.
 *     tags: [RoomServices]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/hotel/:hotelId", getRoomServicesByHotel);

/**
 * @swagger
 * /roomservices/booking/{bookingId}:
 *   get:
 *     summary: Get all services for a booking
 *     description: Retrieve all room services associated with a specific booking.
 *     tags: [RoomServices]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/booking/:bookingId", getRoomServicesByBooking);

/**
 * @swagger
 * /roomservices/{id}:
 *   get:
 *     summary: Get a single room service
 *     description: Retrieve detailed information about a single room service by ID.
 *     tags: [RoomServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room Service ID
 *     responses:
 *       200:
 *         description: Successful operation
 *   put:
 *     summary: Update a room service
 *     description: Update room service information. Only accessible by admins.
 *     tags: [RoomServices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room Service ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoomService'
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     summary: Delete a room service
 *     description: Delete a room service. Only accessible by admins.
 *     tags: [RoomServices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room Service ID
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.get("/:id", getRoomServiceById);
router.put("/:id", protect, authorize('admin'), updateRoomService);
router.delete("/:id", protect, authorize('admin'), deleteRoomService);

module.exports = router;