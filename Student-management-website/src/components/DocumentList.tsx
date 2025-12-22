/**
 * Document List Component
 * Display all uploaded documents with search and management options
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import Navigation from './Navigation';
import { useAuth } from '../context/AuthContext';

interface Document {
    id: number;
    original_filename: string;
    student_name: string;
    uploaded_by_name: string;
    upload_date: string;
    file_size: number;
    student_id: number;
}

const DocumentList: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const location = useLocation();
    const [reuploadId, setReuploadId] = useState<number | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDocuments();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, location.key]);

    const handleReuploadClick = (id: number) => {
        setReuploadId(id);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !reuploadId) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('document', file);

        try {
            await api.put(`/documents/reupload/${reuploadId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Document re-uploaded successfully');
            fetchDocuments();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to re-upload document');
        } finally {
            setReuploadId(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/documents', {
                params: {
                    search: searchTerm,
                    _t: Date.now() // Cache busting
                }
            });
            setDocuments(response.data.documents || []);
        } catch (error: any) {
            toast.error('Failed to load documents');
            console.error(error);
        } finally {
            setLoading(false);
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

    const handleDownload = async (docId: number, originalName: string) => {
        try {
            const response = await api.get(`/documents/download/${docId}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download document');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await api.delete(`/documents/${id}`);
            toast.success('Document deleted successfully');
            fetchDocuments();
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Navigation />
            <Container className="py-4 animate-slideUp">
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h2>Documents Repository</h2>
                        <p className="text-muted">Manage all student documents</p>
                    </Col>
                </Row>

                <Card className="shadow-sm border-0 mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text>🔍</InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search by student name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="fs-1 mb-3">📂</div>
                        <h4>No documents found</h4>
                        <p className="text-muted">Try adjusting your search terms</p>
                    </div>
                ) : (
                    <Card className="shadow-sm border-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>File Name</th>
                                        <th>Student</th>
                                        <th>Uploaded By</th>
                                        <th>Date</th>
                                        <th>Size</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <span className="me-2">📄</span>
                                                    {doc.original_filename}
                                                </div>
                                            </td>
                                            <td>{doc.student_name}</td>
                                            <td>{doc.uploaded_by_name}</td>
                                            <td>{formatDate(doc.upload_date)}</td>
                                            <td>{formatFileSize(doc.file_size)}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => handleView(doc.id)}
                                                        title="View"
                                                    >
                                                        👁️
                                                    </Button>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleDownload(doc.id, doc.original_filename)}
                                                        title="Download"
                                                    >
                                                        ⬇
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
                                                            onClick={() => handleDelete(doc.id)}
                                                            title="Delete"
                                                        >
                                                            🗑
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            {/* Hidden File Input for Reupload */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>
                    </Card>
                )}
            </Container>
        </>
    );
};

export default DocumentList;
