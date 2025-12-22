/**
 * Student Management Routes
 * Routes for CRUD operations on students with permission checks
 */

import express from 'express';
import {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} from '../controllers/studentController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Get all students - requires can_view_students permission
router.get('/', verifyToken, checkPermission('can_view_students'), getAllStudents);

// Get specific student - requires can_view_students permission
router.get('/:id', verifyToken, checkPermission('can_view_students'), getStudentById);

// Create student - requires can_edit_student permission
router.post('/', verifyToken, checkPermission('can_edit_student'), createStudent);

// Update student - requires can_edit_student permission
router.put('/:id', verifyToken, checkPermission('can_edit_student'), updateStudent);

// Delete student - requires can_delete_student permission
router.delete('/:id', verifyToken, checkPermission('can_delete_student'), deleteStudent);

export default router;
