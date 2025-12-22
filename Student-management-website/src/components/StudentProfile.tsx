/**
 * Student Profile Component
 * View student details and documents
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, ListGroup, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import FileUpload from './FileUpload';

interface Student {
    id: number;
    name: string;
    email: string;
    department: string;
    status: string;
    gpa: number | null;
    assigned_tasks: string;
    created_at: string;
    updated_at: string;
}

interface Document {
    id: number;
    original_filename: string;
    file_size: number;
    uploaded_by_name: string;
    upload_date: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    due_date: string;
}

const StudentProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    // Task Modal State
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Pending',
        due_date: ''
    });
    const [isSavingTask, setIsSavingTask] = useState(false);

    // Reupload State
    const [reuploadId, setReuploadId] = useState<number | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchStudentProfile();
    }, [id]);

    const fetchStudentProfile = async () => {
        try {
            setIsLoading(true);
            const [studentRes, tasksRes] = await Promise.all([
                api.get(`/students/${id}`),
                api.get('/tasks', { params: { student_id: id } })
            ]);

            setStudent(studentRes.data.student);
            setDocuments(studentRes.data.documents || []);
            setTasks(tasksRes.data.tasks || []);
        } catch (error: any) {
            toast.error('Failed to load profile data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingTask(true);
        try {
            await api.post('/tasks', {
                ...taskForm,
                student_id: id
            });
            toast.success('Task assigned successfully');
            setShowTaskModal(false);
            setTaskForm({
                title: '',
                description: '',
                priority: 'Medium',
                status: 'Pending',
                due_date: ''
            });
            fetchStudentProfile();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create task');
        } finally {
            setIsSavingTask(false);
        }
    };

    const handleReuploadClick = (docId: number) => {
        setReuploadId(docId);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !reuploadId) return;

        const formData = new FormData();
        formData.append('document', e.target.files[0]);

        try {
            await api.put(`/documents/reupload/${reuploadId}`, formData);
            toast.success('Document updated successfully');
            fetchStudentProfile();
        } catch (error) {
            toast.error('Failed to re-upload document');
        } finally {
            setReuploadId(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleView = async (docId: number) => {
        try {
            const response = await api.get(`/documents/view/${docId}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
            window.open(url, '_blank');
        } catch (error) {
            toast.error('Failed to view document');
        }
    };

    const handleDownload = async (docId: number, filename: string) => {
        try {
            const response = await api.get(`/documents/download/${docId}`, {
                responseType: 'blob',
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download document');
        }
    };

    const handleDeleteDocument = async (docId: number) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await api.delete(`/documents/${docId}`);
            toast.success('Document deleted successfully');
            fetchStudentProfile(); // Refresh
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete document');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
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

    if (!student) {
        return (
            <>
                <Navigation />
                <Container className="py-5 text-center">
                    <h3>Student not found</h3>
                    <Button variant="primary" onClick={() => navigate('/students')}>
                        Back to Students
                    </Button>
                </Container>
            </>
        );
    }

    return (
        <>
            <Navigation />
            <Container fluid className="py-4">
                <Row className="mb-3">
                    <Col>
                        <Button variant="outline-secondary" onClick={() => navigate('/students')}>
                            ← Back to Students
                        </Button>
                    </Col>
                </Row>

                <Row className="g-4">
                    {/* Student Information */}
                    <Col xs={12} lg={5}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Header className="bg-primary text-white">
                                <h4 className="mb-0">Student Profile</h4>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <h3 className="fw-bold">{student.name}</h3>
                                    <Badge
                                        bg={
                                            student.status === 'Active'
                                                ? 'success'
                                                : student.status === 'Inactive'
                                                    ? 'warning'
                                                    : 'secondary'
                                        }
                                    >
                                        {student.status}
                                    </Badge>
                                </div>

                                <ListGroup variant="flush">
                                    <ListGroup.Item className="px-0">
                                        <strong>Email:</strong> {student.email}
                                    </ListGroup.Item>
                                    <ListGroup.Item className="px-0">
                                        <strong>Department:</strong> {student.department || 'Not specified'}
                                    </ListGroup.Item>
                                    <ListGroup.Item className="px-0">
                                        <strong>GPA:</strong> {student.gpa ? Number(student.gpa).toFixed(2) : 'Not specified'}
                                    </ListGroup.Item>
                                    <ListGroup.Item className="px-0">
                                        <strong>Assigned Tasks:</strong>
                                        <div className="mt-2">
                                            {student.assigned_tasks ? (
                                                <p className="mb-0 text-muted">{student.assigned_tasks}</p>
                                            ) : (
                                                <p className="mb-0 text-muted">No tasks assigned</p>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="px-0">
                                        <strong>Created:</strong> {formatDate(student.created_at)}
                                    </ListGroup.Item>
                                    <ListGroup.Item className="px-0">
                                        <strong>Last Updated:</strong> {formatDate(student.updated_at)}
                                    </ListGroup.Item>
                                </ListGroup>

                                {user?.can_edit_student && (
                                    <Button
                                        variant="primary"
                                        className="w-100 mt-3"
                                        onClick={() => navigate(`/students/${id}/edit`)}
                                    >
                                        ✏️ Edit Profile
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Main Content Area */}
                    <Col xs={12} lg={7}>
                        <Tabs defaultActiveKey="documents" id="student-tabs" className="mb-3">
                            <Tab eventKey="documents" title={`📄 Documents (${documents.length})`}>
                                <Card className="shadow-sm border-0">
                                    <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Documents List</h5>
                                        {user?.can_upload_docs && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => setShowUpload(!showUpload)}
                                            >
                                                {showUpload ? 'Cancel' : '📤 Upload Document'}
                                            </Button>
                                        )}
                                    </Card.Header>
                                    <Card.Body>
                                        {/* File Upload Component */}
                                        {showUpload && (
                                            <div className="mb-4">
                                                <FileUpload
                                                    studentId={parseInt(id!)}
                                                    onUploadSuccess={() => {
                                                        setShowUpload(false);
                                                        fetchStudentProfile();
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Documents List */}
                                        {documents.length === 0 ? (
                                            <div className="text-center py-5 text-muted">
                                                <p>No documents uploaded yet</p>
                                            </div>
                                        ) : (
                                            <ListGroup>
                                                {documents.map((doc) => (
                                                    <ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center">
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span>📄</span>
                                                                <div>
                                                                    <strong>{doc.original_filename}</strong>
                                                                    <div className="text-muted small">
                                                                        {formatFileSize(doc.file_size)} • Uploaded by {doc.uploaded_by_name} on{' '}
                                                                        {formatDate(doc.upload_date)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                variant="outline-info"
                                                                size="sm"
                                                                onClick={() => handleView(doc.id)}
                                                            >
                                                                View
                                                            </Button>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => handleDownload(doc.id, doc.original_filename)}
                                                            >
                                                                Download
                                                            </Button>
                                                            {user?.can_upload_docs && (
                                                                <Button
                                                                    variant="outline-warning"
                                                                    size="sm"
                                                                    onClick={() => handleReuploadClick(doc.id)}
                                                                    title="Re-upload"
                                                                >
                                                                    ↻
                                                                </Button>
                                                            )}
                                                            {user?.can_delete_student && (
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Tab>

                            <Tab eventKey="assignments" title={`✅ Assignments (${tasks.length})`}>
                                <Card className="shadow-sm border-0">
                                    <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Tasks & Assignments</h5>
                                        {user?.can_edit_student && (
                                            <Button variant="primary" size="sm" onClick={() => setShowTaskModal(true)}>
                                                + Assign Task
                                            </Button>
                                        )}
                                    </Card.Header>
                                    <Card.Body>
                                        {tasks.length === 0 ? (
                                            <p className="text-muted text-center py-5">No tasks assigned to this student</p>
                                        ) : (
                                            <ListGroup variant="flush">
                                                {tasks.map(task => (
                                                    <ListGroup.Item key={task.id} className="px-0 py-3 border-bottom">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <h6 className="mb-1 fw-bold">{task.title}</h6>
                                                                <p className="text-muted small mb-1">{task.description}</p>
                                                                <div className="d-flex gap-2">
                                                                    <Badge bg={
                                                                        task.status === 'Completed' ? 'success' :
                                                                            task.status === 'In Progress' ? 'primary' : 'warning'
                                                                    }>
                                                                        {task.status}
                                                                    </Badge>
                                                                    {task.due_date && (
                                                                        <small className="text-muted">
                                                                            Due: {formatDate(task.due_date)}
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Badge bg={
                                                                task.priority === 'High' || task.priority === 'Important' ? 'danger' :
                                                                    task.priority === 'Medium' ? 'primary' : 'secondary'
                                                            }>
                                                                {task.priority}
                                                            </Badge>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Tab>
                        </Tabs>

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        {/* Task Create Modal */}
                        <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Assign New Task</Modal.Title>
                            </Modal.Header>
                            <Form onSubmit={handleCreateTask}>
                                <Modal.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control
                                            required
                                            value={taskForm.title}
                                            onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={taskForm.description}
                                            onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Row>
                                        <Col>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Priority</Form.Label>
                                                <Form.Select
                                                    value={taskForm.priority}
                                                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                    <option value="Important">Important</option>
                                                    <option value="Super Important">Super Important</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Status</Form.Label>
                                                <Form.Select
                                                    value={taskForm.status}
                                                    onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Due Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={taskForm.due_date}
                                            onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                        />
                                    </Form.Group>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                                    <Button variant="primary" type="submit" disabled={isSavingTask}>
                                        {isSavingTask ? 'Assigning...' : 'Assign Task'}
                                    </Button>
                                </Modal.Footer>
                            </Form>
                        </Modal>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default StudentProfile;
