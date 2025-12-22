
/**
 * Task Management Controller
 * Handles CRUD operations for tasks/assignments
 */

import pool from '../config/database.js';
import { logActivity } from './activityLogController.js';

/**
 * GET /api/tasks
 * Get all tasks with optional filtering
 */
export const getAllTasks = async (req, res) => {
    try {
        const { student_id, status, priority, search } = req.query;

        let query = `
            SELECT t.*, s.name as student_name, u.username as created_by_name 
            FROM tasks t
            LEFT JOIN students s ON t.student_id = s.id
            LEFT JOIN users u ON t.created_by = u.id
            WHERE 1=1
        `;
        const params = [];

        if (student_id) {
            query += ` AND t.student_id = ?`;
            params.push(student_id);
        }

        if (status) {
            query += ` AND t.status = ?`;
            params.push(status);
        }

        if (priority) {
            query += ` AND t.priority = ?`;
            params.push(priority);
        }

        if (search) {
            query += ` AND (t.title LIKE ? OR t.description LIKE ? OR s.name LIKE ?)`;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += ` ORDER BY 
            CASE 
                WHEN t.priority = 'Super Important' THEN 1
                WHEN t.priority = 'Important' THEN 2
                WHEN t.priority = 'High' THEN 3
                WHEN t.priority = 'Medium' THEN 4
                ELSE 5
            END,
            t.created_at DESC`;

        const [tasks] = await pool.query(query, params);

        res.json({
            success: true,
            tasks
        });

    } catch (error) {
        console.error('Get all tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message
        });
    }
};

/**
 * POST /api/tasks
 * Create a new task
 */
export const createTask = async (req, res) => {
    try {
        const { student_id, title, description, priority, status, due_date } = req.body;

        if (!student_id || !title) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and Title are required'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO tasks (student_id, title, description, priority, status, due_date, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                student_id,
                title,
                description || null,
                priority || 'Medium',
                status || 'Pending',
                due_date || null,
                req.user.id
            ]
        );

        // Get student name for log
        const [students] = await pool.query('SELECT name FROM students WHERE id = ?', [student_id]);
        const studentName = students[0]?.name || 'Unknown Student';

        await logActivity(
            req.user.id,
            `Assigned task "${title}" to ${studentName}`,
            'task',
            result.insertId
        );

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            taskId: result.insertId
        });

    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message
        });
    }
};

/**
 * PUT /api/tasks/:id
 * Update a task
 */
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, status, due_date } = req.body;

        const updates = [];
        const params = [];

        if (title !== undefined) { updates.push('title = ?'); params.push(title); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }
        if (due_date !== undefined) { updates.push('due_date = ?'); params.push(due_date); }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        params.push(id);

        await pool.query(
            `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        await logActivity(
            req.user.id,
            `Updated task ID: ${id}`,
            'task',
            parseInt(id)
        );

        res.json({
            success: true,
            message: 'Task updated successfully'
        });

    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error.message
        });
    }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

        await logActivity(
            req.user.id,
            `Deleted task ID: ${id}`,
            'task',
            parseInt(id)
        );

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error.message
        });
    }
};
