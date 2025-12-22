/**
 * Authentication Routes
 * Routes for login, registration, and user profile
 */

import express from 'express';
import { login, register, getCurrentUser } from '../controllers/authController.js';
import { verifyToken, isSupervisor } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

// Supervisor-only routes
router.post('/register', verifyToken, isSupervisor, register);

export default router;
