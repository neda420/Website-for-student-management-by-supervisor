// src/components/AnimatedRoutes.tsx
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Import all route components
import Dashboard from './Dashboard';
import StudentList from './StudentList';
import StudentProfile from './StudentProfile';
import StudentForm from './StudentForm';
import DocumentList from './DocumentList';
import UserManagement from './UserManagement';
import Login from './Login';
import Assignments from './Assignments';
import ProtectedRoute from './ProtectedRoute';

const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
};

const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.4,
};

const AnimatedRoutes: React.FC = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <motion.div
                                variants={pageVariants}
                                initial="initial"
                                animate="in"
                                exit="out"
                                transition={pageTransition}
                            >
                                <Dashboard />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/students"
                    element={
                        <ProtectedRoute requirePermission="can_view_students">
                            <motion.div
                                variants={pageVariants}
                                initial="initial"
                                animate="in"
                                exit="out"
                                transition={pageTransition}
                            >
                                <StudentList />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/students/:id"
                    element={
                        <ProtectedRoute requirePermission="can_view_students">
                            <motion.div
                                variants={pageVariants}
                                initial="initial"
                                animate="in"
                                exit="out"
                                transition={pageTransition}
                            >
                                <StudentProfile />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/students/new"
                    element={
                        <ProtectedRoute requirePermission="can_edit_student">
                            <motion.div
                                variants={pageVariants}
                                initial="initial"
                                animate="in"
                                exit="out"
                                transition={pageTransition}
                            >
                                <StudentForm />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/students/:id/edit"
                    element={
                        <ProtectedRoute requirePermission="can_edit_student">
                            <motion.div
                                variants={pageVariants}
                                initial="initial"
                                animate="in"
                                exit="out"
                                transition={pageTransition}
                            >
                                <StudentForm />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/documents"
                    element={
                        <ProtectedRoute requirePermission="can_view_students">
                            <motion.div
                                variants={pageVariants}
                                initial="initial"
                                animate="in"
                                exit="out"
                                transition={pageTransition}
                            >
                                <DocumentList />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/assignments"
                    element={
                        <ProtectedRoute requirePermission="can_view_students">
                            <motion.div
                                variants={pageVariants}
                                initial="initial"
                                animate="in"
                                exit="out"
                                transition={pageTransition}
                            >
                                <Assignments />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <ProtectedRoute requireSupervisor>
                            <motion.div
                                variants={pageVariants}
                                initial="initial"
                                animate="in"
                                exit="out"
                                transition={pageTransition}
                            >
                                <UserManagement />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />

                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
