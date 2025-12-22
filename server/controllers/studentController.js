/**
 * Student Management Controller
 * Handles CRUD operations for students
 */

import pool from '../config/database.js';
import { logActivity } from './activityLogController.js';

/**
 * GET /api/students
 * Get all students with pagination and search
 */
export const getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'created_at';
        const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

        // Valid sort fields
        const validSortFields = ['name', 'email', 'department', 'status', 'gpa', 'created_at', 'assigned_tasks'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';

        // Build search query
        let query = 'SELECT * FROM students';
        let countQuery = 'SELECT COUNT(*) as total FROM students';
        const params = [];
        const countParams = [];

        if (search) {
            const searchCondition = ' WHERE name LIKE ? OR email LIKE ? OR department LIKE ?';
            query += searchCondition;
            countQuery += searchCondition;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
            countParams.push(searchParam, searchParam, searchParam);
        }

        query += ` ORDER BY ${sortField} ${order} LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Get students
        const [students] = await pool.query(query, params);

        // Get total count
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            students,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch students',
            error: error.message
        });
    }
};

/**
 * GET /api/students/:id
 * Get a specific student by ID with their documents
 */
export const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get student
        const [students] = await pool.query(
            'SELECT * FROM students WHERE id = ?',
            [id]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get student's documents
        const [documents] = await pool.query(
            `SELECT d.*, u.username as uploaded_by_name 
       FROM documents d
       JOIN users u ON d.uploaded_by = u.id
       WHERE d.student_id = ?
       ORDER BY d.upload_date DESC`,
            [id]
        );

        res.json({
            success: true,
            student: students[0],
            documents
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student',
            error: error.message
        });
    }
};

/**
 * POST /api/students
 * Create a new student
 */
export const createStudent = async (req, res) => {
    try {
        const { name, email, department, status, gpa, assigned_tasks } = req.body;

        // Validation
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Check if email already exists
        const [existing] = await pool.query(
            'SELECT id FROM students WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A student with this email already exists'
            });
        }

        // Insert student
        const [result] = await pool.query(
            `INSERT INTO students (name, email, department, status, gpa, assigned_tasks) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, department || null, status || 'Active', gpa || null, assigned_tasks || null]
        );

        // Log activity
        await logActivity(
            req.user.id,
            `Created new student: ${name}`,
            'student',
            result.insertId
        );

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            studentId: result.insertId
        });

    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create student',
            error: error.message
        });
    }
};

/**
 * PUT /api/students/:id
 * Update a student
 */
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, department, status, gpa, assigned_tasks } = req.body;

        // Check if student exists
        const [students] = await pool.query(
            'SELECT name FROM students WHERE id = ?',
            [id]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if email is being changed and if it already exists
        if (email) {
            const [existing] = await pool.query(
                'SELECT id FROM students WHERE email = ? AND id != ?',
                [email, id]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'A student with this email already exists'
                });
            }
        }

        // Build update query dynamically based on provided fields
        const updates = [];
        const params = [];

        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (email !== undefined) { updates.push('email = ?'); params.push(email); }
        if (department !== undefined) { updates.push('department = ?'); params.push(department); }
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }
        if (gpa !== undefined) { updates.push('gpa = ?'); params.push(gpa); }
        if (assigned_tasks !== undefined) { updates.push('assigned_tasks = ?'); params.push(assigned_tasks); }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        params.push(id);

        // Update student
        await pool.query(
            `UPDATE students SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Log activity
        await logActivity(
            req.user.id,
            `Updated student: ${name || students[0].name}`,
            'student',
            parseInt(id)
        );

        res.json({
            success: true,
            message: 'Student updated successfully'
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update student',
            error: error.message
        });
    }
};

/**
 * DELETE /api/students/:id
 * Delete a student (cascades to documents)
 */
export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if student exists
        const [students] = await pool.query(
            'SELECT name FROM students WHERE id = ?',
            [id]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const studentName = students[0].name;

        // Delete student (CASCADE will delete related documents)
        await pool.query('DELETE FROM students WHERE id = ?', [id]);

        // Log activity
        await logActivity(
            req.user.id,
            `Deleted student: ${studentName}`,
            'student',
            null
        );

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete student',
            error: error.message
        });
    }
};
