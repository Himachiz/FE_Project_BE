const express = require('express');
const {getUsers, updateUser, deleteUser}=require('../controllers/users');

const router=express.Router();

const {protect, authorize} = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Admin only)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users. Only accessible by admins.
 *     tags: [Users]
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
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized (Admin only)
 */
router.route('/').get(protect,authorize('admin','PomPhet'),getUsers);

router.route('/:id').put(protect,authorize('PomPhet'),updateUser).delete(protect,authorize('PomPhet'),deleteUser);

module.exports=router;