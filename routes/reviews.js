const express = require('express');
const { getReviews, addReview, updateReview, deleteReview, likeReview } = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

const { protect, checkBanned } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Hotel review management
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     description: Retrieve all reviews across all hotels.
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Successful operation
 */

/**
 * @swagger
 * /hotels/{hotelId}/reviews:
 *   get:
 *     summary: Get reviews for a specific hotel
 *     description: Retrieve all reviews for a specific hotel.
 *     tags: [Reviews]
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
 *     summary: Add a review for a hotel
 *     description: Create a new review for a specific hotel. Requires a previous booking at the hotel.
 *     tags: [Reviews]
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
 *               - score
 *               - comment
 *             properties:
 *               score: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *           example:
 *             score: 3
 *             comment: "No Sheep ToT"
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Bad request (e.g. no booking found, already reviewed)
 */
router.route('/')
    .get(getReviews)
    .post(protect, checkBanned, addReview);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review
 *     description: Update an existing review. Only the author can update.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Review updated successfully
 *   delete:
 *     summary: Delete a review
 *     description: Delete an existing review. Only the author or an admin can delete.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 */
router.route('/:id')
    .put(protect, checkBanned, updateReview)
    .delete(protect, checkBanned, deleteReview);

/**
 * @swagger
 * /reviews/{id}/like:
 *   put:
 *     summary: Like or unlike a review
 *     description: Toggle like/unlike on a review.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [like, dislike]
 *           example:
 *             action: "like"
 *     responses:
 *       200:
 *         description: Operation successful
 */
router.route('/:id/like')
    .put(protect, checkBanned, likeReview);

module.exports = router;
