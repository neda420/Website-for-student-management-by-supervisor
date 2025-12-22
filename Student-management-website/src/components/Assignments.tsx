
/**
 * Assignments Page
 * View and filter all tasks/assignments
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Badge, Button, Spinner, InputGroup } from 'react-bootstrap';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import Navigation from './Navigation';
import { useNavigate } from 'react-router-dom';

interface Task {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    due_date: string;
    student_id: number;
    student_name: string;
    created_by_name: string;
    created_at: string;
}

const Assignments: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterPriority, setFilterPriority] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks();
    }, [filterPriority, filterStatus]);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            if (filterPriority) params.priority = filterPriority;
            if (filterStatus) params.status = filterStatus;
            if (searchTerm) params.search = searchTerm;

            const response = await api.get('/tasks', { params });
            setTasks(response.data.tasks);
        } catch (error: any) {
            toast.error('Failed to load assignments');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTasks();
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Super Important': return 'danger';
            case 'Important': return 'warning';
            case 'High': return 'info';
            case 'Medium': return 'primary';
            case 'Low': return 'secondary';
            default: return 'secondary';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'In Progress': return 'primary';
            case 'Overdue': return 'danger';
            default: return 'warning'; // Pending
        }
    };

    return (
        <>
            <Navigation />
            <Container fluid className="py-4 animate-slideUp">
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h2>Assignments & Tasks</h2>
                        <p className="text-muted">Manage student workload and priorities</p>
                    </Col>
                </Row>

                <Card className="shadow-sm border-0 mb-4">
                    <Card.Body>
                        <Form onSubmit={handleSearch}>
                            <Row className="g-3">
                                <Col md={4}>
                                    <InputGroup>
                                        <InputGroup.Text>🔍</InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search tasks or students..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <Button variant="outline-secondary" type="submit">Search</Button>
                                    </InputGroup>
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={filterPriority}
                                        onChange={(e) => setFilterPriority(e.target.value)}
                                    >
                                        <option value="">All Priorities</option>
                                        <option value="Super Important">Super Important</option>
                                        <option value="Important">Important</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Overdue">Overdue</option>
                                    </Form.Select>
                                </Col>
                                <Col md={2} className="d-flex">
                                    <Button
                                        variant="outline-secondary"
                                        className="w-100"
                                        onClick={() => {
                                            setFilterPriority('');
                                            setFilterStatus('');
                                            setSearchTerm('');
                                            // Reset triggers effect since state changes
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                <Card className="shadow-sm border-0">
                    <Card.Body className="p-0">
                        {isLoading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <h4>No assignments found</h4>
                                <p>Try adjusting your search filters</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Title</th>
                                            <th>Student</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Due Date</th>
                                            <th>Assigned By</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((task) => (
                                            <tr key={task.id}>
                                                <td className="ps-4">
                                                    <div className="fw-bold">{task.title}</div>
                                                    <small className="text-muted text-truncate d-block" style={{ maxWidth: '250px' }}>
                                                        {task.description}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span
                                                        className="text-primary"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => navigate(`/students/${task.student_id}`)}
                                                    >
                                                        {task.student_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Badge bg={getPriorityBadge(task.priority)}>
                                                        {task.priority}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusBadge(task.status)} pill>
                                                        {task.status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                                                </td>
                                                <td>
                                                    <small className="text-muted">{task.created_by_name}</small>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => navigate(`/students/${task.student_id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
};

export default Assignments;
