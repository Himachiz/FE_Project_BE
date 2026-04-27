const express = require('express');
const {getBookings, getBooking, addBooking, updateBooking, deleteBooking} = require('../controllers/bookings');

const router = express.Router({mergeParams: true});

const { protect, authorize, checkBanned } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Hotel booking management
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     description: Retrieve all bookings. Admins can see all, users can only see their own.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /hotels/{hotelId}/bookings:
 *   get:
 *     summary: Get bookings for a specific hotel
 *     description: Retrieve bookings associated with a specific hotel.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
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
 *   post:
 *     summary: Create a booking for a specific hotel
 *     description: Create a booking for a specific hotel. Max 3 bookings per user.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apptDate
 *             properties:
 *               apptDate:
 *                 type: string
 *                 format: date-time
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceId: { type: string }
 *                     quantity: { type: number }
 *           example:
 *             apptDate: "2026-03-18T00:00:00.000Z"
 *             services:
 *               - serviceId: "69e353c8247a0bd814885d19"
 *                 quantity: 1
 *     responses:
 *       200:
 *         description: Booking created successfully
 *       400:
 *         description: Bad request (e.g. limit exceeded, duplicate booking)
 */
router.route('/').get(protect, getBookings).post(protect, checkBanned, authorize('admin', 'user'), addBooking);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a single booking
 *     description: Retrieve detailed information about a single booking by ID.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Booking not found
 *   put:
 *     summary: Update a booking
 *     description: Update booking information (e.g. date).
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apptDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       404:
 *         description: Booking not found
 *   delete:
 *     summary: Delete a booking
 *     description: Delete a booking and its associated review if it's the last one.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 */
router.route('/:id').get(protect, getBooking).put(protect, checkBanned, authorize('admin', 'user'), updateBooking).delete(protect, checkBanned, authorize('admin', 'user'), deleteBooking);

module.exports = router;
