const express=require('express');
const {register, login, getMe}=require('../controllers/auth');

const router=express.Router();

const {protect} = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and registration
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with personal details and a secure password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             name: "John Doe"
 *             email: "john@example.com"
 *             tel: "0812345678"
 *             password: "password123"
 *             role: "user"
 *     responses:
 *       200:
 *         description: User registered successfully. Returns user data and JWT token in cookie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token: { type: string }
 *                 _id: { type: string }
 *                 name: { type: string }
 *                 email: { type: string }
 *                 tel: { type: string }
 *                 role: { type: string }
 *                 createdAt: { type: string, format: date-time }
 *                 isban: { type: boolean }
 *       400:
 *         description: Bad request. Possible reasons include missing fields, invalid email format, or duplicate email.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Please add a valid email"
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user with email and password to receive a JWT token and set an auth cookie.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *           example:
 *             email: "john@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful. JWT token is returned in the response body and set in the 'token' cookie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token: { type: string }
 *                 _id: { type: string }
 *                 name: { type: string }
 *                 email: { type: string }
 *                 role: { type: string }
 *       401:
 *         description: Invalid credentials (incorrect email or password).
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid credentials"
 *       403:
 *         description: Access denied. The user account has been banned.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Your account is banned"
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the profile of the currently logged-in user.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, getMe);

module.exports=router;