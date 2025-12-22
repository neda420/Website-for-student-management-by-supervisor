/**
 * User Management Routes
 * Routes for managing assistants (supervisor only)
 */

import express from 'express';
import {
    getAllUsers,
    getUserById,
    updateUserPermissions,
    deleteUser
} from '../controllers/userController.js';
import { verifyToken, isSupervisor } from '../middleware/auth.js';

const router = express.Router();

// All user management routes require supervisor privileges
router.get('/', verifyToken, isSupervisor, getAllUsers);
router.get('/:id', verifyToken, isSupervisor, getUserById);
router.put('/:id/permissions', verifyToken, isSupervisor, updateUserPermissions);
router.delete('/:id', verifyToken, isSupervisor, deleteUser);

export default router;
