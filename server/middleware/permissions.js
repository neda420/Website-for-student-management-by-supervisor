/**
 * Permission Checking Middleware
 * Provides granular permission checks based on user permission flags
 */

/**
 * Factory function that creates middleware to check specific permissions
 * @param {string} permission - The permission to check (e.g., 'can_edit_student')
 * @returns {Function} Express middleware function
 * 
 * Usage example:
 *   router.put('/students/:id', verifyToken, checkPermission('can_edit_student'), updateStudent);
 */
export const checkPermission = (permission) => {
    return (req, res, next) => {
        // Supervisors have all permissions automatically
        if (req.user && req.user.role === 'supervisor') {
            return next();
        }

        // Check if user has the specific permission
        if (req.user && req.user[permission] === true) {
            return next();
        }

        // Permission denied
        return res.status(403).json({
            success: false,
            message: `Access denied. Required permission: ${permission}`,
            requiredPermission: permission
        });
    };
};

/**
 * Middleware to check multiple permissions (user must have ALL of them)
 * @param {Array<string>} permissions - Array of permission names
 * @returns {Function} Express middleware function
 * 
 * Usage example:
 *   router.delete('/students/:id', verifyToken, checkAllPermissions(['can_delete_student', 'can_view_students']), deleteStudent);
 */
export const checkAllPermissions = (permissions) => {
    return (req, res, next) => {
        // Supervisors have all permissions automatically
        if (req.user && req.user.role === 'supervisor') {
            return next();
        }

        // Check if user has ALL required permissions
        const hasAllPermissions = permissions.every(
            permission => req.user && req.user[permission] === true
        );

        if (hasAllPermissions) {
            return next();
        }

        // Find which permissions are missing
        const missingPermissions = permissions.filter(
            permission => !req.user || req.user[permission] !== true
        );

        return res.status(403).json({
            success: false,
            message: 'Access denied. Missing required permissions.',
            missingPermissions
        });
    };
};

/**
 * Middleware to check if user has ANY of the specified permissions
 * @param {Array<string>} permissions - Array of permission names
 * @returns {Function} Express middleware function
 */
export const checkAnyPermission = (permissions) => {
    return (req, res, next) => {
        // Supervisors have all permissions automatically
        if (req.user && req.user.role === 'supervisor') {
            return next();
        }

        // Check if user has ANY of the required permissions
        const hasAnyPermission = permissions.some(
            permission => req.user && req.user[permission] === true
        );

        if (hasAnyPermission) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied. None of the required permissions found.',
            requiredPermissions: permissions
        });
    };
};
