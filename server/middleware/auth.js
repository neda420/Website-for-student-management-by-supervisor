/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user data to request object
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware to verify JWT token from Authorization header
 * Expects format: "Bearer <token>"
 * Attaches decoded user object to req.user
 */
export const verifyToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Check if it starts with "Bearer "
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format. Use: Bearer <token>'
            });
        }

        // Extract token (remove "Bearer " prefix)
        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request object
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Token verification failed',
            error: error.message
        });
    }
};

/**
 * Middleware to check if user is a supervisor
 * Must be used after verifyToken middleware
 */
export const isSupervisor = (req, res, next) => {
    if (req.user && req.user.role === 'supervisor') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Supervisor privileges required.'
        });
    }
};
