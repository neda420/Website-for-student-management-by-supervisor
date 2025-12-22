/**
 * Document Management Routes
 * Routes for document upload, download, and management with Multer configuration
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
    uploadDocument,
    reuploadDocument,
    getStudentDocuments,
    downloadDocument,
    viewDocument,
    deleteDocument,
    getAllDocuments
} from '../controllers/documentController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-random-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}-${uniqueSuffix}${ext}`);
    }
});

// File filter - you can restrict file types here
const fileFilter = (req, file, cb) => {
    // Accept all files for now
    // You can add restrictions like:
    // const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    // const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // if (extname) {
    //   cb(null, true);
    // } else {
    //   cb(new Error('Invalid file type'));
    // }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    }
});

// Get all documents - requires can_view_students permission
router.get(
    '/',
    verifyToken,
    checkPermission('can_view_students'),
    getAllDocuments
);

// Upload document - requires can_upload_docs permission
router.post(
    '/upload/:studentId',
    verifyToken,
    checkPermission('can_upload_docs'),
    upload.array('documents', 10), // Allow up to 10 files at once
    uploadDocument
);

// Re-upload/Replace document - requires can_upload_docs permission
router.put(
    '/reupload/:id',
    verifyToken,
    checkPermission('can_upload_docs'),
    upload.single('document'), // Single file replacement
    reuploadDocument
);

// Get student's documents - requires can_view_students permission
router.get(
    '/student/:studentId',
    verifyToken,
    checkPermission('can_view_students'),
    getStudentDocuments
);

// View document - requires can_view_students permission
router.get(
    '/view/:id',
    verifyToken,
    checkPermission('can_view_students'),
    viewDocument
);

// Download document - requires can_view_students permission
router.get(
    '/download/:id',
    verifyToken,
    checkPermission('can_view_students'),
    downloadDocument
);

// Delete document - requires can_delete_student permission
router.delete(
    '/:id',
    verifyToken,
    checkPermission('can_delete_student'),
    deleteDocument
);

export default router;
