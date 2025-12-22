/**
 * Dashboard Controller
 * Provides statistics and data for the dashboard view
 */

import pool from '../config/database.js';

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
    try {
        // Get total students count
        const [studentCount] = await pool.query(
            'SELECT COUNT(*) as total FROM students'
        );

        // Get total assistants count
        const [assistantCount] = await pool.query(
            "SELECT COUNT(*) as total FROM users WHERE role = 'assistant'"
        );

        // Get total documents count
        const [documentCount] = await pool.query(
            'SELECT COUNT(*) as total FROM documents'
        );

        // Get students by status
        const [statusBreakdown] = await pool.query(
            `SELECT status, COUNT(*) as count 
       FROM students 
       GROUP BY status`
        );

        // Get recent uploads count (last 7 days)
        const [recentUploadsCount] = await pool.query(
            `SELECT COUNT(*) as count 
       FROM documents 
       WHERE upload_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
        );

        // Get last 10 uploads details
        const [recentUploadsList] = await pool.query(
            `SELECT d.id, d.original_filename, d.upload_date, s.name as student_name, u.username as uploaded_by_name 
             FROM documents d
             LEFT JOIN students s ON d.student_id = s.id
             LEFT JOIN users u ON d.uploaded_by = u.id
             ORDER BY d.upload_date DESC 
             LIMIT 10`
        );

        // Get assignments stats
        // Check if tasks table exists first to avoid crash if migration failed
        let assignmentsStats = [{ total: 0, high_priority: 0, pending: 0 }];
        try {
            const [rows] = await pool.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN priority IN ('High', 'Important', 'Super Important') THEN 1 ELSE 0 END) as high_priority,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
                FROM tasks
            `);
            if (rows.length > 0) assignmentsStats = rows;
        } catch (err) {
            console.warn("Tasks table query failed (table might be missing):", err.message);
        }

        res.json({
            success: true,
            stats: {
                totalStudents: studentCount[0].total,
                totalAssistants: assistantCount[0].total,
                totalDocuments: documentCount[0].total,
                recentUploads: recentUploadsCount[0].count,
                recentUploadsList: recentUploadsList,
                studentsByStatus: statusBreakdown,
                assignments: {
                    total: Number(assignmentsStats[0].total),
                    highPriority: Number(assignmentsStats[0].high_priority || 0),
                    pending: Number(assignmentsStats[0].pending || 0)
                }
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};
