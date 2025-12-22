/**
 * Student List Component
 * Displays all students with search, pagination, and actions
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Spinner, Badge, Pagination, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';

interface Student {
    id: number;
    name: string;
    email: string;
    department: string;
    status: 'Active' | 'Inactive' | 'Graduated';
    gpa: number | null;
    created_at: string;
}

const StudentList: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('created_at');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const location = useLocation();

    useEffect(() => {
        fetchStudents();
    }, [currentPage, searchTerm, sortBy, order, location.key]);

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const searchParams = new URLSearchParams(location.search);
            const statusFilter = searchParams.get('status');

            const response = await api.get('/students', {
                params: {
                    page: currentPage,
                    limit: 10,
                    search: searchTerm,
                    status: statusFilter,
                    sortBy,
                    order,
                    _t: Date.now() // Cache busting
                },
            });
            setStudents(response.data.students || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (error: any) {
            toast.error('Failed to load students');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setOrder('asc');
        }
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortBy !== field) return <span className="text-muted ms-1 small">⇅</span>;
        return <span className="ms-1 small">{order === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleDeleteClick = (student: Student) => {
        setStudentToDelete(student);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!studentToDelete) return;

        try {
            setIsDeleting(true);
            await api.delete(`/students/${studentToDelete.id}`);
            toast.success('Student deleted successfully');
            setShowDeleteModal(false);
            setStudentToDelete(null);
            fetchStudents(); // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete student');
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            Active: 'success',
            Inactive: 'warning',
            Graduated: 'secondary',
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <>
            <Navigation />
            <Container fluid className="py-4">
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <h2 className="mb-0 fw-bold">Students</h2>
                            {user?.can_edit_student && (
                                <Button variant="primary" onClick={() => navigate('/students/new')}>
                                    ➕ Add Student
                                </Button>
                            )}
                        </div>
                    </Col>
                </Row>

                <Card className="shadow-sm border-0">
                    <Card.Body>
                        {/* Search Bar */}
                        <Row className="mb-3">
                            <Col xs={12} md={6} lg={4}>
                                <InputGroup>
                                    <InputGroup.Text>🔍</InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by name, email, or department..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </InputGroup>
                            </Col>
                        </Row>

                        {/* Table */}
                        {isLoading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <h4>No students found</h4>
                                <p>Try adjusting your search or add a new student</p>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <Table hover>
                                        <thead className="table-light">
                                            <tr>
                                                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                                    Name <SortIcon field="name" />
                                                </th>
                                                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                                                    Email <SortIcon field="email" />
                                                </th>
                                                <th onClick={() => handleSort('department')} style={{ cursor: 'pointer' }}>
                                                    Department <SortIcon field="department" />
                                                </th>
                                                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                                    Status <SortIcon field="status" />
                                                </th>
                                                <th onClick={() => handleSort('gpa')} style={{ cursor: 'pointer' }}>
                                                    GPA <SortIcon field="gpa" />
                                                </th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student) => (
                                                <tr key={student.id} style={{ cursor: 'pointer' }}>
                                                    <td onClick={() => navigate(`/students/${student.id}`)}>
                                                        <strong>{student.name}</strong>
                                                    </td>
                                                    <td onClick={() => navigate(`/students/${student.id}`)}>
                                                        {student.email}
                                                    </td>
                                                    <td onClick={() => navigate(`/students/${student.id}`)}>
                                                        {student.department || '-'}
                                                    </td>
                                                    <td onClick={() => navigate(`/students/${student.id}`)}>
                                                        {getStatusBadge(student.status)}
                                                    </td>
                                                    <td onClick={() => navigate(`/students/${student.id}`)}>
                                                        {student.gpa ? Number(student.gpa).toFixed(2) : '-'}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => navigate(`/students/${student.id}`)}
                                                            >
                                                                View
                                                            </Button>
                                                            {user?.can_edit_student && (
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    onClick={() => navigate(`/students/${student.id}/edit`)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            )}
                                                            {user?.can_delete_student && (
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteClick(student)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center mt-4">
                                        <Pagination>
                                            <Pagination.Prev
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            />
                                            {[...Array(totalPages)].map((_, index) => (
                                                <Pagination.Item
                                                    key={index + 1}
                                                    active={index + 1 === currentPage}
                                                    onClick={() => setCurrentPage(index + 1)}
                                                >
                                                    {index + 1}
                                                </Pagination.Item>
                                            ))}
                                            <Pagination.Next
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            />
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete student <strong>{studentToDelete?.name}</strong>?
                    This will also delete all associated documents.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    className="me-2"
                                />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default StudentList;
