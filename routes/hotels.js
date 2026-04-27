const express = require('express');
const {getHotels, getHotel, createHotel, updateHotel, deleteHotel} = require('../controllers/hotels');

//Include other resource router
const bookingRouter = require('./bookings');
const reviewRouter = require('./reviews');
const roomserviceRouter = require('./roomservices');

const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Hotel management and discovery
 */

//Re-route into other resource routers
router.use('/:hotelId/bookings/', bookingRouter);
router.use('/:hotelId/reviews/', reviewRouter);
router.use('/:hotelId/roomservices', roomserviceRouter);

/**
 * @swagger
 * /hotels:
 *   get:
 *     summary: Get all hotels
 *     description: Retrieve a list of all hotels with optional filtering, sorting, and pagination.
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Select specific fields (comma-separated)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by specific fields (comma-separated)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
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
 *                 pagination: { type: object }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hotel'
 *   post:
 *     summary: Create a new hotel
 *     description: Create a new hotel. Only accessible by admins.
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hotel'
 *           example:
 *             name: "White Park City Hall"
 *             address: "10 Coleman Street"
 *             district: "Downtown Core"
 *             province: "Singapore"
 *             postalcode: "17989"
 *             tel: "+65 6336 3456"
 *             region: "Central"
 *             picture: "https://drive.google.com/uc?id=1O5DM3dJrKbUFCHAY8BTlx_Ky63dHvY8W"
 *             dailyrate: 2500
 *     responses:
 *       201:
 *         description: Hotel created successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized (Admin only)
 */
router.route('/').get(getHotels).post(protect, authorize('admin'), createHotel);

/**
 * @swagger
 * /hotels/{id}:
 *   get:
 *     summary: Get a single hotel
 *     description: Retrieve detailed information about a single hotel by ID.
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *       404:
 *         description: Hotel not found
 *   put:
 *     summary: Update a hotel
 *     description: Update hotel information. Only accessible by admins.
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hotel'
 *     responses:
 *       200:
 *         description: Hotel updated successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized (Admin only)
 *       404:
 *         description: Hotel not found
 *   delete:
 *     summary: Delete a hotel
 *     description: Delete a hotel and its associated bookings and reviews. Only accessible by admins.
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized (Admin only)
 *       404:
 *         description: Hotel not found
 */
router.route('/:id').get(getHotel).put(protect, authorize('admin'), updateHotel).delete(protect, authorize('admin'), deleteHotel);

module.exports=router;
