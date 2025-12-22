/**
 * Authentication Controller
 * Handles user authentication: login, registration, and profile fetching
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { logActivity } from './activityLogController.js';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user by username
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create JWT token with user data (excluding password)
        const tokenPayload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            // Include permission flags in token for easy access
            can_view_students: user.can_view_students,
            can_edit_student: user.can_edit_student,
            can_delete_student: user.can_delete_student,
            can_upload_docs: user.can_upload_docs,
            can_manage_users: user.can_manage_users
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: '24h' // Token expires in 24 hours
        });

        // Log login activity
        await logActivity(user.id, `Logged in`, 'user', user.id);

        // Return token and user data (without password)
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

/**
 * POST /api/auth/register
 * Register a new assistant (supervisor only)
 */
export const register = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            can_view_students = true,
            can_edit_student = false,
            can_delete_student = false,
            can_upload_docs = false,
            can_manage_users = false
        } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        // Check if username or email already exists
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user (always as 'assistant' role)
        const [result] = await pool.query(
            `INSERT INTO users 
       (username, email, password, role, can_view_students, can_edit_student, 
        can_delete_student, can_upload_docs, can_manage_users) 
       VALUES (?, ?, ?, 'assistant', ?, ?, ?, ?, ?)`,
            [
                username,
                email,
                hashedPassword,
                can_view_students,
                can_edit_student,
                can_delete_student,
                can_upload_docs,
                can_manage_users
            ]
        );

        // Log activity
        await logActivity(
            req.user.id,
            `Created new assistant: ${username}`,
            'user',
            result.insertId
        );

        res.status(201).json({
            success: true,
            message: 'Assistant created successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
export const getCurrentUser = async (req, res) => {
    try {
        // Get user from database (req.user comes from JWT token)
        const [users] = await pool.query(
            'SELECT id, username, email, role, can_view_students, can_edit_student, can_delete_student, can_upload_docs, can_manage_users, created_at FROM users WHERE id = ?',
            [req.user.id]
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
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data',
            error: error.message
        });
    }
};
