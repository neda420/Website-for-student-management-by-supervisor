/**
 * Protected Route Component
 * Wraps routes that require authentication
 */


import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requirePermission?: string; // Optional permission check
    requireSupervisor?: boolean; // Optional supervisor-only check
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requirePermission,
    requireSupervisor,
}) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check supervisor requirement
    if (requireSupervisor && user?.role !== 'supervisor') {
        return <Navigate to="/" replace />;
    }

    // Check specific permission
    if (requirePermission && user) {
        const hasPermission = user[requirePermission as keyof typeof user];
        if (user.role !== 'supervisor' && !hasPermission) {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
