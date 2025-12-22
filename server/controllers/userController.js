/**
 * User Management Controller
 * Handles CRUD operations for assistants (supervisor only)
 */

import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { logActivity } from './activityLogController.js';

/**
 * GET /api/users
 * Get all users (assistants only, not supervisor)
 */
export const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id, username, email, role, can_view_students, can_edit_student, 
              can_delete_student, can_upload_docs, can_manage_users, created_at 
       FROM users 
       WHERE role = 'assistant'
       ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            users
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

/**
 * GET /api/users/:id
 * Get a specific user by ID
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await pool.query(
            `SELECT id, username, email, role, can_view_students, can_edit_student, 
              can_delete_student, can_upload_docs, can_manage_users, created_at 
       FROM users 
       WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};

/**
 * PUT /api/users/:id/permissions
 * Update user permissions (supervisor only)
 */
export const updateUserPermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            can_view_students,
            can_edit_student,
            can_delete_student,
            can_upload_docs,
            can_manage_users
        } = req.body;

        // Check if user exists and is not a supervisor
        const [users] = await pool.query(
            'SELECT username, role FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (users[0].role === 'supervisor') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify supervisor permissions'
            });
        }

        // Update permissions
        await pool.query(
            `UPDATE users 
       SET can_view_students = ?, can_edit_student = ?, can_delete_student = ?, 
           can_upload_docs = ?, can_manage_users = ?
       WHERE id = ?`,
            [
                can_view_students,
                can_edit_student,
                can_delete_student,
                can_upload_docs,
                can_manage_users,
                id
            ]
        );

        // Log activity
        await logActivity(
            req.user.id,
            `Updated permissions for assistant: ${users[0].username}`,
            'user',
            parseInt(id)
        );

        res.json({
            success: true,
            message: 'Permissions updated successfully'
        });

    } catch (error) {
        console.error('Update permissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update permissions',
            error: error.message
        });
    }
};

/**
 * DELETE /api/users/:id
 * Delete a user (supervisor only)
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists and is not a supervisor
        const [users] = await pool.query(
            'SELECT username, role FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (users[0].role === 'supervisor') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete supervisor account'
            });
        }

        const username = users[0].username;

        // Delete user (this will cascade delete activity logs due to foreign key)
        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        // Log activity
        await logActivity(
            req.user.id,
            `Deleted assistant: ${username}`,
            'user',
            null
        );

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};
