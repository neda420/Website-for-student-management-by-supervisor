
import express from 'express';
import {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/taskController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Get all tasks - requires can_view_students (assuming viewing tasks is part of viewing students)
router.get(
    '/',
    verifyToken,
    checkPermission('can_view_students'),
    getAllTasks
);

// Create task - requires can_edit_student (assuming assigning tasks is editing student)
router.post(
    '/',
    verifyToken,
    checkPermission('can_edit_student'),
    createTask
);

// Update task - requires can_edit_student
router.put(
    '/:id',
    verifyToken,
    checkPermission('can_edit_student'),
    updateTask
);

// Delete task - requires can_edit_student
router.delete(
    '/:id',
    verifyToken,
    checkPermission('can_edit_student'),
    deleteTask
);

export default router;
