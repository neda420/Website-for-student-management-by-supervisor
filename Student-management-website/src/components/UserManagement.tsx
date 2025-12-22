/**
 * User Management Component
 * Manage assistants - supervisor only
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import Navigation from './Navigation';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    can_view_students: boolean;
    can_edit_student: boolean;
    can_delete_student: boolean;
    can_upload_docs: boolean;
    can_manage_users: boolean;
    created_at: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [createForm, setCreateForm] = useState({
        username: '',
        email: '',
        password: '',
        can_view_students: true,
        can_edit_student: false,
        can_delete_student: false,
        can_upload_docs: false,
        can_manage_users: false,
    });

    const [permissions, setPermissions] = useState({
        can_view_students: false,
        can_edit_student: false,
        can_delete_student: false,
        can_upload_docs: false,
        can_manage_users: false,
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/users');
            setUsers(response.data.users);
        } catch (error: any) {
            toast.error('Failed to load users');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await api.post('/auth/register', createForm);
            toast.success('Assistant created successfully');
            setShowCreateModal(false);
            setCreateForm({
                username: '',
                email: '',
                password: '',
                can_view_students: true,
                can_edit_student: false,
                can_delete_student: false,
                can_upload_docs: false,
                can_manage_users: false,
            });
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create assistant');
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenPermissionsModal = (user: User) => {
        setSelectedUser(user);
        setPermissions({
            can_view_students: user.can_view_students,
            can_edit_student: user.can_edit_student,
            can_delete_student: user.can_delete_student,
            can_upload_docs: user.can_upload_docs,
            can_manage_users: user.can_manage_users,
        });
        setShowPermissionsModal(true);
    };

    const handleUpdatePermissions = async () => {
        if (!selectedUser) return;

        setIsSaving(true);
        try {
            await api.put(`/users/${selectedUser.id}/permissions`, permissions);
            toast.success('Permissions updated successfully');
            setShowPermissionsModal(false);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update permissions');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!window.confirm(`Are you sure you want to delete assistant "${user.username}"?`)) {
            return;
        }

        try {
            await api.delete(`/users/${user.id}`);
            toast.success('Assistant deleted successfully');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete assistant');
        }
    };

    return (
        <>
            <Navigation />
            <Container fluid className="py-4 animate-slideUp">
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <h2 className="mb-0 fw-bold">User Management</h2>
                            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                                ➕ Create Assistant
                            </Button>
                        </div>
                    </Col>
                </Row>

                <Card className="shadow-sm border-0">
                    <Card.Body>
                        {isLoading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <h4>No assistants found</h4>
                                <p>Create your first assistant to get started</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Permissions</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td>
                                                    <strong>{user.username}</strong>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {user.can_view_students && <Badge bg="info" className="small">View</Badge>}
                                                        {user.can_edit_student && <Badge bg="primary" className="small">Edit</Badge>}
                                                        {user.can_delete_student && <Badge bg="danger" className="small">Delete</Badge>}
                                                        {user.can_upload_docs && <Badge bg="success" className="small">Upload</Badge>}
                                                        {user.can_manage_users && <Badge bg="warning" className="small">Manage Users</Badge>}
                                                    </div>
                                                </td>
                                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleOpenPermissionsModal(user)}
                                                        >
                                                            Edit Permissions
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
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

            {/* Create Assistant Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Create New Assistant</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateUser}>
                    <Modal.Body>
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3" controlId="username">
                                    <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={createForm.username}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, username: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, email: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="password"
                                value={createForm.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </Form.Group>

                        <h6 className="mb-3">Permissions</h6>
                        <Form.Check
                            type="checkbox"
                            id="create-view"
                            label="Can View Students"
                            checked={createForm.can_view_students}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, can_view_students: e.target.checked })}
                            className="mb-2"
                        />
                        <Form.Check
                            type="checkbox"
                            id="create-edit"
                            label="Can Edit Students"
                            checked={createForm.can_edit_student}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, can_edit_student: e.target.checked })}
                            className="mb-2"
                        />
                        <Form.Check
                            type="checkbox"
                            id="create-delete"
                            label="Can Delete Students"
                            checked={createForm.can_delete_student}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, can_delete_student: e.target.checked })}
                            className="mb-2"
                        />
                        <Form.Check
                            type="checkbox"
                            id="create-upload"
                            label="Can Upload Documents"
                            checked={createForm.can_upload_docs}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, can_upload_docs: e.target.checked })}
                            className="mb-2"
                        />
                        <Form.Check
                            type="checkbox"
                            id="create-manage"
                            label="Can Manage Users"
                            checked={createForm.can_manage_users}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, can_manage_users: e.target.checked })}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create Assistant'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Permissions Modal */}
            <Modal show={showPermissionsModal} onHide={() => setShowPermissionsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Permissions - {selectedUser?.username}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Check
                        type="checkbox"
                        id="perm-view"
                        label="Can View Students"
                        checked={permissions.can_view_students}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPermissions({ ...permissions, can_view_students: e.target.checked })}
                        className="mb-2"
                    />
                    <Form.Check
                        type="checkbox"
                        id="perm-edit"
                        label="Can Edit Students"
                        checked={permissions.can_edit_student}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPermissions({ ...permissions, can_edit_student: e.target.checked })}
                        className="mb-2"
                    />
                    <Form.Check
                        type="checkbox"
                        id="perm-delete"
                        label="Can Delete Students"
                        checked={permissions.can_delete_student}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPermissions({ ...permissions, can_delete_student: e.target.checked })}
                        className="mb-2"
                    />
                    <Form.Check
                        type="checkbox"
                        id="perm-upload"
                        label="Can Upload Documents"
                        checked={permissions.can_upload_docs}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPermissions({ ...permissions, can_upload_docs: e.target.checked })}
                        className="mb-2"
                    />
                    <Form.Check
                        type="checkbox"
                        id="perm-manage"
                        label="Can Manage Users"
                        checked={permissions.can_manage_users}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPermissions({ ...permissions, can_manage_users: e.target.checked })}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPermissionsModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdatePermissions} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserManagement;
