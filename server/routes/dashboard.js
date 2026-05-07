/**
 * Dashboard Routes
 * Routes for dashboard statistics and activity logs
 */

import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { 
  getRecentActivities, 
  getStudentActivities 
} from '../controllers/activityLogController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// 1. Apply global middleware to all routes in this router
// This ensures every dashboard endpoint is protected without repeating code
router.use(verifyToken);
router.use(checkPermission('can_view_students'));

// 2. Define clean routes without redundant middleware chains
router.get('/stats', getDashboardStats);

router.get('/activities', getRecentActivities);

router.get('/activities/student/:studentId', getStudentActivities);

export default router;
