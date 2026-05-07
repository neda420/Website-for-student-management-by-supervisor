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

// Get dashboard statistics
router.get(
  '/stats', 
  verifyToken, 
  checkPermission('can_view_students'), 
  getDashboardStats
);

// Get recent activities
router.get(
  '/activities', 
  verifyToken, 
  checkPermission('can_view_students'), 
  getRecentActivities
);

// Get activities for specific student
router.get(
  '/activities/student/:studentId', 
  verifyToken, 
  checkPermission('can_view_students'), 
  getStudentActivities
);

export default router;
