-- StudentTrack Database Schema
-- This script creates all necessary tables for the student management system
-- Run this script after creating the 'studenttrack' database

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

-- =============================================================================
-- USERS TABLE
-- Stores supervisor and assistant credentials with granular permission flags
-- =============================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Bcrypt hashed password
    role ENUM('supervisor', 'assistant') NOT NULL DEFAULT 'assistant',
    
    -- Granular permission flags (boolean columns)
    can_view_students BOOLEAN DEFAULT TRUE,
    can_edit_student BOOLEAN DEFAULT FALSE,
    can_delete_student BOOLEAN DEFAULT FALSE,
    can_upload_docs BOOLEAN DEFAULT FALSE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- STUDENTS TABLE
-- Stores student profile information
-- =============================================================================
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    status ENUM('Active', 'Inactive', 'Graduated') NOT NULL DEFAULT 'Active',
    gpa DECIMAL(3, 2) DEFAULT NULL, -- e.g., 3.85 (range 0.00 to 4.00)
    assigned_tasks TEXT, -- Stored as JSON string or comma-separated values
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DOCUMENTS TABLE
-- Stores file metadata for documents uploaded to student profiles
-- Links to students table via foreign key (CASCADE DELETE)
-- =============================================================================
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL, -- Foreign key to students table
    original_filename VARCHAR(255) NOT NULL, -- Original file name from user
    stored_filename VARCHAR(255) NOT NULL, -- Unique filename on server
    file_path VARCHAR(500) NOT NULL, -- Full path to file
    file_size INT, -- File size in bytes
    uploaded_by INT NOT NULL, -- Foreign key to users table (who uploaded it)
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_student_id (student_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- ACTIVITY LOGS TABLE
-- Tracks all user actions for the dashboard's "Recent Activity" feed
-- =============================================================================
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Foreign key to users table (who performed the action)
    action TEXT NOT NULL, -- Description of the action (e.g., "Updated student John Doe's GPA")
    entity_type ENUM('student', 'user', 'document', 'other') NOT NULL, -- Type of entity affected
    entity_id INT, -- ID of the affected entity (nullable for general actions)
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DEFAULT DATA
-- Create a default supervisor account
-- =============================================================================
-- Password is 'supervisor123' (hashed with bcrypt - 10 rounds)
-- You should change this password after first login
INSERT INTO users (username, email, password, role, can_view_students, can_edit_student, can_delete_student, can_upload_docs, can_manage_users) 
VALUES (
    'supervisor',
    'supervisor@studenttrack.com',
    '$2a$10$rGqZ0vhN5O/yxVV8OyqVeOYP0OqZyLJ6jQXqKqJVV9mYN5yJVZ9hO', 
    'supervisor',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE
);

-- Log the initial setup
INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
SELECT id, 'System initialized - Database created', 'other', NULL
FROM users WHERE username = 'supervisor';

-- =============================================================================
-- SAMPLE DATA (Optional - for testing purposes)
-- Uncomment the following lines to add sample students
-- =============================================================================

-- INSERT INTO students (name, email, department, status, gpa, assigned_tasks) VALUES
-- ('John Smith', 'john.smith@university.edu', 'Computer Science', 'Active', 3.75, 'Complete Assignment 1, Prepare for midterm'),
-- ('Jane Doe', 'jane.doe@university.edu', 'Electrical Engineering', 'Active', 3.92, 'Lab Report 3, Project Proposal'),
-- ('Michael Johnson', 'michael.j@university.edu', 'Mechanical Engineering', 'Active', 3.45, 'Design Project, CAD Assignment'),
-- ('Emily Brown', 'emily.brown@university.edu', 'Computer Science', 'Graduated', 3.88, NULL);

-- =============================================================================
-- VERIFICATION QUERIES
-- Use these to verify the schema was created correctly
-- =============================================================================

-- Show all tables
-- SHOW TABLES;

-- Describe each table structure
-- DESCRIBE users;
-- DESCRIBE students;
-- DESCRIBE documents;
-- DESCRIBE activity_logs;

-- Verify the default supervisor account exists
-- SELECT id, username, email, role FROM users WHERE role = 'supervisor';

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
