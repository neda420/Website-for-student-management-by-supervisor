/**
 * Student Form Component
 * Create or edit student
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import Navigation from './Navigation';

const StudentForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = id && id !== 'new';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        status: 'Active',
        gpa: '',
        assigned_tasks: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchStudent();
        }
    }, [id]);

    const fetchStudent = async () => {
        try {
            setIsFetching(true);
            const response = await api.get(`/students/${id}`);
            const student = response.data.student;
            setFormData({
                name: student.name || '',
                email: student.email || '',
                department: student.department || '',
                status: student.status || 'Active',
                gpa: student.gpa ? student.gpa.toString() : '',
                assigned_tasks: student.assigned_tasks || '',
            });
        } catch (error: any) {
            toast.error('Failed to load student data');
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                gpa: formData.gpa ? parseFloat(formData.gpa) : null,
            };

            if (isEditMode) {
                await api.put(`/students/${id}`, payload);
                toast.success('Student updated successfully');
            } else {
                await api.post('/students', payload);
                toast.success('Student created successfully');
            }

            navigate('/students');
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} student`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
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
            <Container className="py-4">
                <Row className="mb-3">
                    <Col>
                        <Button variant="outline-secondary" onClick={() => navigate('/students')}>
                            ← Back to Students
                        </Button>
                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col xs={12} lg={8}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-primary text-white">
                                <h4 className="mb-0">{isEditMode ? 'Edit Student' : 'Add New Student'}</h4>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col xs={12} md={6}>
                                            <Form.Group className="mb-3" controlId="name">
                                                <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter student name"
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12} md={6}>
                                            <Form.Group className="mb-3" controlId="email">
                                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Enter email address"
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs={12} md={6}>
                                            <Form.Group className="mb-3" controlId="department">
                                                <Form.Label>Department</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    placeholder="Enter department"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12} md={6}>
                                            <Form.Group className="mb-3" controlId="status">
                                                <Form.Label>Status</Form.Label>
                                                <Form.Select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                    <option value="Graduated">Graduated</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs={12} md={6}>
                                            <Form.Group className="mb-3" controlId="gpa">
                                                <Form.Label>GPA</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="4"
                                                    name="gpa"
                                                    value={formData.gpa}
                                                    onChange={handleChange}
                                                    placeholder="Enter GPA (0.00 - 4.00)"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4" controlId="assigned_tasks">
                                        <Form.Label>Assigned Tasks</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="assigned_tasks"
                                            value={formData.assigned_tasks}
                                            onChange={handleChange}
                                            placeholder="Enter assigned tasks (comma-separated or description)"
                                        />
                                    </Form.Group>

                                    <div className="d-flex gap-2 justify-content-end">
                                        <Button
                                            variant="secondary"
                                            onClick={() => navigate('/students')}
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button variant="primary" type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        className="me-2"
                                                    />
                                                    {isEditMode ? 'Updating...' : 'Creating...'}
                                                </>
                                            ) : (
                                                <>{isEditMode ? 'Update Student' : 'Create Student'}</>
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default StudentForm;
