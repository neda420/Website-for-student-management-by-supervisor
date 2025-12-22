/**
 * Activity Log Controller
 * Handles logging of all user actions for the dashboard activity feed
 */

import pool from '../config/database.js';

/**
 * Helper function to log an activity
 * Used by other controllers to track user actions
 * 
 * @param {number} userId - ID of the user performing the action
 * @param {string} action - Description of the action
 * @param {string} entityType - Type of entity affected ('student', 'user', 'document', 'other')
 * @param {number|null} entityId - ID of the affected entity (optional)
 */
export const logActivity = async (userId, action, entityType, entityId = null) => {
    try {
        await pool.query(
            'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
            [userId, action, entityType, entityId]
        );
    } catch (error) {
        // Don't throw error - activity logging failure shouldn't break the main operation
        console.error('Activity logging error:', error.message);
    }
};

/**
 * GET /api/activities
 * Get recent activity logs for the dashboard
 */
export const getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20; // Default 20 activities
        const offset = parseInt(req.query.offset) || 0;

        // Get activity logs with user information (JOIN with users table)
        const [activities] = await pool.query(
            `SELECT 
        a.id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.timestamp,
        u.username,
        u.role
       FROM activity_logs a
       JOIN users u ON a.user_id = u.id
       ORDER BY a.timestamp DESC
       LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        // Get total count for pagination
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM activity_logs'
        );

        res.json({
            success: true,
            activities,
            total: countResult[0].total,
            limit,
            offset
        });

    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities',
            error: error.message
        });
    }
};

/**
 * GET /api/activities/student/:studentId
 * Get activity logs for a specific student
 */
export const getStudentActivities = async (req, res) => {
    try {
        const { studentId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const [activities] = await pool.query(
            `SELECT 
        a.id,
        a.action,
        a.entity_type,
        a.timestamp,
        u.username,
        u.role
       FROM activity_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.entity_type = 'student' AND a.entity_id = ?
       ORDER BY a.timestamp DESC
       LIMIT ?`,
            [studentId, limit]
        );

        res.json({
            success: true,
            activities
        });

    } catch (error) {
        console.error('Get student activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student activities',
            error: error.message
        });
    }
};
