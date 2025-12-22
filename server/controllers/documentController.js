/**
 * Document Management Controller
 * Handles file uploads, downloads, and document management for students
 */

import pool from '../config/database.js';
import { logActivity } from './activityLogController.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * POST /api/documents/upload/:studentId
 * Upload a document for a student (uses Multer middleware)
 */
export const uploadDocument = async (req, res) => {
    const uploadedFiles = req.files || [];

    try {
        const { studentId } = req.params;

        // Check if file was uploaded
        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        // Check if student exists
        const [students] = await pool.query(
            'SELECT name FROM students WHERE id = ?',
            [studentId]
        );

        if (students.length === 0) {
            // Delete uploaded files if student doesn't exist
            uploadedFiles.forEach(file => {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const documents = [];

        // Process each file
        for (const file of uploadedFiles) {
            // Insert document record
            const [result] = await pool.query(
                `INSERT INTO documents 
           (student_id, original_filename, stored_filename, file_path, file_size, uploaded_by) 
           VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    studentId,
                    file.originalname,
                    file.filename,
                    file.path,
                    file.size,
                    req.user.id
                ]
            );

            documents.push({
                id: result.insertId,
                original_filename: file.originalname,
                file_size: file.size
            });
        }

        // Log activity
        await logActivity(
            req.user.id,
            `Uploaded ${uploadedFiles.length} document(s) for student: ${students[0].name}`,
            'document',
            null
        );

        res.status(201).json({
            success: true,
            message: 'Documents uploaded successfully',
            documents
        });

    } catch (error) {
        // Delete uploaded files if database operation fails
        uploadedFiles.forEach(file => {
            if (file.path && fs.existsSync(file.path)) {
                try {
                    fs.unlinkSync(file.path);
                } catch (unlinkError) {
                    console.error('Failed to delete file:', unlinkError);
                }
            }
        });

        console.error('Upload document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload documents',
            error: error.message
        });
    }
};

/**
 * GET /api/documents
 * Get all documents with optional filtering
 */
export const getAllDocuments = async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT d.*, s.name as student_name, u.username as uploaded_by_name 
            FROM documents d
            JOIN students s ON d.student_id = s.id
            JOIN users u ON d.uploaded_by = u.id
        `;
        const params = [];

        if (search) {
            query += ` WHERE s.name LIKE ?`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY d.upload_date DESC`;

        const [documents] = await pool.query(query, params);

        res.json({
            success: true,
            documents
        });
    } catch (error) {
        console.error('Get all documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents',
            error: error.message
        });
    }
};

/**
 * GET /api/documents/student/:studentId
 * Get all documents for a specific student
 */
export const getStudentDocuments = async (req, res) => {
    try {
        const { studentId } = req.params;

        const [documents] = await pool.query(
            `SELECT d.*, u.username as uploaded_by_name 
       FROM documents d
       JOIN users u ON d.uploaded_by = u.id
       WHERE d.student_id = ?
       ORDER BY d.upload_date DESC`,
            [studentId]
        );

        res.json({
            success: true,
            documents
        });

    } catch (error) {
        console.error('Get student documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents',
            error: error.message
        });
    }
};

/**
 * GET /api/documents/view/:id
 * View a specific document (inline)
 */
export const viewDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // Get document info
        const [documents] = await pool.query(
            'SELECT * FROM documents WHERE id = ?',
            [id]
        );

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const document = documents[0];

        // Check if file exists
        if (!fs.existsSync(document.file_path)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        // Determine content type based on extension
        const ext = path.extname(document.original_filename).toLowerCase();
        let contentType = 'application/octet-stream';

        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.txt') contentType = 'text/plain';

        // Set headers for inline view
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${document.original_filename}"`);

        // Stream file to response
        const fileStream = fs.createReadStream(document.file_path);
        fileStream.pipe(res);

    } catch (error) {
        console.error('View document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to view document',
            error: error.message
        });
    }
};

/**
 * GET /api/documents/download/:id
 * Download a specific document
 */
export const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // Get document info
        const [documents] = await pool.query(
            'SELECT * FROM documents WHERE id = ?',
            [id]
        );

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const document = documents[0];

        // Check if file exists
        if (!fs.existsSync(document.file_path)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        // Set headers for download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${document.original_filename}"`);

        // Stream file to response
        const fileStream = fs.createReadStream(document.file_path);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download document',
            error: error.message
        });
    }
};

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // Get document info
        const [documents] = await pool.query(
            `SELECT d.*, s.name as student_name 
       FROM documents d
       JOIN students s ON d.student_id = s.id
       WHERE d.id = ?`,
            [id]
        );

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const document = documents[0];

        // Delete file from filesystem
        if (fs.existsSync(document.file_path)) {
            fs.unlinkSync(document.file_path);
        }

        // Delete database record
        await pool.query('DELETE FROM documents WHERE id = ?', [id]);

        // Log activity
        await logActivity(
            req.user.id,
            `Deleted document "${document.original_filename}" from student: ${document.student_name}`,
            'document',
            null
        );

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
            error: error.message
        });
    }
};

/**
 * PUT /api/documents/reupload/:id
 * Replace an existing document file
 */
export const reuploadDocument = async (req, res) => {
    const file = req.file;
    const { id } = req.params;

    if (!file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    try {
        // Get existing document info
        const [documents] = await pool.query(
            `SELECT d.*, s.name as student_name 
             FROM documents d
             JOIN students s ON d.student_id = s.id
             WHERE d.id = ?`,
            [id]
        );

        if (documents.length === 0) {
            // Delete uploaded file if document doesn't exist
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const oldDocument = documents[0];

        // Delete old file from filesystem
        if (fs.existsSync(oldDocument.file_path)) {
            try {
                fs.unlinkSync(oldDocument.file_path);
            } catch (err) {
                console.error('Failed to delete old file:', err);
                // Continue with update even if delete fails
            }
        }

        // Update database record
        await pool.query(
            `UPDATE documents 
             SET original_filename = ?, 
                 stored_filename = ?, 
                 file_path = ?, 
                 file_size = ?, 
                 upload_date = CURRENT_TIMESTAMP,
                 uploaded_by = ?
             WHERE id = ?`,
            [
                file.originalname,
                file.filename,
                file.path,
                file.size,
                req.user.id,
                id
            ]
        );

        // Log activity
        await logActivity(
            req.user.id,
            `Re-uploaded/Replaced document "${oldDocument.original_filename}" for student: ${oldDocument.student_name}`,
            'document',
            null
        );

        res.json({
            success: true,
            message: 'Document re-uploaded successfully',
            document: {
                id: parseInt(id),
                original_filename: file.originalname,
                file_size: file.size,
                upload_date: new Date()
            }
        });

    } catch (error) {
        // Delete uploaded new file if operation fails
        if (file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            } catch (unlinkError) {
                console.error('Failed to delete new file:', unlinkError);
            }
        }

        console.error('Re-upload document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to re-upload document',
            error: error.message
        });
    }
};
