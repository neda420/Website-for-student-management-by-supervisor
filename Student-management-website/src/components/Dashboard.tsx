/**
 * Dashboard Component
 * Main dashboard with statistics and recent activity feed
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import Navigation from './Navigation';
import { useAuth } from '../context/AuthContext';

interface Stats {
    totalStudents: number;
    totalAssistants: number;
    totalDocuments: number;
    recentUploads: number;
    studentsByStatus: Array<{ status: string; count: number }>;
    recentUploadsList: {
        id: number;
        original_filename: string;
        upload_date: string;
        student_name: string;
        uploaded_by_name: string;
    }[];
    assignments: {
        total: number;
        highPriority: number;
        pending: number;
    };
}

interface Activity {
    id: number;
    action: string;
    entity_type: string;
    username: string;
    role: string;
    timestamp: string;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); // Hooks must be called before any conditional returns
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    useEffect(() => {
        // Only fetch data when authenticated and auth is not loading
        if (isAuthenticated && !authLoading) {
            fetchDashboardData();
        } else if (!authLoading) {
            // If not authenticated and not loading, set loading to false
            setIsLoading(false);
        }
    }, [isAuthenticated, authLoading]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);

            // Fetch stats and activities in parallel
            const [statsResponse, activitiesResponse] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/activities?limit=10'),
            ]);

            setStats(statsResponse.data.stats);
            setActivities(activitiesResponse.data.activities);
        } catch (error: any) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case 'student': return '🎓';
            case 'user': return '👤';
            case 'document': return '📄';
            default: return '📋';
        }
    };

    if (isLoading) {
        return (
            <>
                <Navigation />
                <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                    <Spinner animation="border" variant="primary" />
                </Container>
            </>
        );
    }

    return (
        <>
            <Navigation />
            <Container className="py-4 animate-slideUp">
                <Row className="mb-4">
                    <Col>
                        <h2>Dashboard</h2>
                        <p className="text-muted">Overview of system activities</p>
                    </Col>
                </Row>

                {/* Statistics Cards */}
                <Row className="g-3 mb-4">
                    <Col xs={12} sm={6} lg={3}>
                        <Card
                            className="shadow-sm border-0 h-100"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/students')}
                        >
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1 small">Total Students</p>
                                        <h3 className="mb-0 fw-bold text-primary">{stats?.totalStudents || 0}</h3>
                                    </div>
                                    <div className="fs-1">🎓</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} sm={6} lg={3}>
                        <Card
                            className="shadow-sm border-0 h-100"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/users')}
                        >
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1 small">Assistants</p>
                                        <h3 className="mb-0 fw-bold text-success">{stats?.totalAssistants || 0}</h3>
                                    </div>
                                    <div className="fs-1">👨‍💼</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} lg={3}>
                        <Card
                            className="shadow-sm border-0 h-100"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/documents')}
                        >
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1 small">Total Documents</p>
                                        <h3 className="mb-0 fw-bold text-info">{stats?.totalDocuments || 0}</h3>
                                    </div>
                                    <div className="fs-1">📄</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} sm={6} lg={3}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1 small">Recent Uploads (7d)</p>
                                        <h3 className="mb-0 fw-bold text-warning">{stats?.recentUploads || 0}</h3>
                                    </div>
                                    <div className="fs-1">📤</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} sm={6} lg={3}>
                        <Card
                            className="shadow-sm border-0 h-100"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/assignments')}
                        >
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1 small">Active Assignments</p>
                                        <h3 className="mb-0 fw-bold text-danger">{stats?.assignments?.pending || 0}</h3>
                                    </div>
                                    <div className="fs-1">📋</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Students by Status */}
                {(stats?.studentsByStatus?.length ?? 0) > 0 && (
                    <Row className="mb-4">
                        <Col xs={12}>
                            <Card className="shadow-sm border-0">
                                <Card.Body>
                                    <h5 className="mb-3">Students by Status</h5>
                                    <div className="d-flex flex-wrap gap-3">
                                        {stats?.studentsByStatus?.map((status) => (
                                            <Badge
                                                key={status.status}
                                                bg={
                                                    status.status === 'Active'
                                                        ? 'success'
                                                        : status.status === 'Inactive'
                                                            ? 'warning'
                                                            : 'secondary'
                                                }
                                                className="px-3 py-2"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => navigate(`/students?status=${status.status}`)}
                                            >
                                                {status.status}: {status.count}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Recent Activity */}
                <Row>
                    <Col xs={12}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-white border-0 pt-3">
                                <h5 className="mb-0">Recent Activity</h5>
                            </Card.Header>
                            <ListGroup variant="flush">
                                {activities.length === 0 ? (
                                    <ListGroup.Item className="text-center text-muted py-4">
                                        No recent activity
                                    </ListGroup.Item>
                                ) : (
                                    activities.map((activity) => (
                                        <ListGroup.Item key={activity.id} className="border-start-0 border-end-0">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span>{getEntityIcon(activity.entity_type)}</span>
                                                        <strong className="text-primary">{activity.username}</strong>
                                                        <Badge bg="secondary" pill className="small">
                                                            {activity.role}
                                                        </Badge>
                                                    </div>
                                                    <p className="mb-0 text-muted small">{activity.action}</p>
                                                </div>
                                                <small className="text-muted text-nowrap ms-3">
                                                    {formatTimestamp(activity.timestamp)}
                                                </small>
                                            </div>
                                        </ListGroup.Item>
                                    ))
                                )}
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Dashboard;
