/**
 * File Upload Component
 * Upload documents with progress bar
 */

import React, { useState } from 'react';
import { Form, Button, ProgressBar, Alert } from 'react-bootstrap';
import api from '../utils/axios';
import { toast } from 'react-toastify';

interface FileUploadProps {
    studentId: number;
    onUploadSuccess?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ studentId, onUploadSuccess }) => {
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(e.target.files);
            setUploadProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        const formData = new FormData();
        // Append all selected files
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('documents', selectedFiles[i]);
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            await api.post(`/documents/upload/${studentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    }
                },
            });

            toast.success('Documents uploaded successfully');
            setSelectedFiles(null);
            setUploadProgress(0);

            // Reset file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            // Call success callback
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to upload documents');
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="file-upload-component">
            <Form.Group controlId="file-upload" className="mb-3">
                <Form.Label>Select Documents (Max 10 files)</Form.Label>
                <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
                {selectedFiles && selectedFiles.length > 0 && (
                    <div className="mt-2">
                        <small className="text-muted d-block mb-1">
                            Selected {selectedFiles.length} file(s):
                        </small>
                        <ul className="list-unstyled mb-0 ps-3">
                            {Array.from(selectedFiles).map((file, index) => (
                                <li key={index} className="text-muted small">
                                    • {file.name} ({formatFileSize(file.size)})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Form.Group>

            {isUploading && (
                <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Uploading...</small>
                        <small className="text-muted">{uploadProgress}%</small>
                    </div>
                    <ProgressBar now={uploadProgress} striped animated />
                </div>
            )}

            <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!selectedFiles || isUploading}
                className="w-100"
            >
                {isUploading ? `Uploading... ${uploadProgress}%` : '📤 Upload Documents'}
            </Button>

            {!selectedFiles && !isUploading && (
                <Alert variant="info" className="mt-3 mb-0">
                    <small>
                        💡 You can select multiple files at once. Supported formats: PDF, DOC, DOCX, XLS, XLSX, images, etc.
                    </small>
                </Alert>
            )}
        </div>
    );
};

export default FileUpload;
