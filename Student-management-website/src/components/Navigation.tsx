/**
 * Navigation Bar Component
 * Top navigation with user menu
 */


import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    📚 StudentTrack
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">
                            Dashboard
                        </Nav.Link>
                        {user.can_view_students && (
                            <>
                                <Nav.Link as={Link} to="/students">
                                    Students
                                </Nav.Link>
                                <Nav.Link as={Link} to="/documents">
                                    Documents
                                </Nav.Link>
                                <Nav.Link as={Link} to="/assignments">
                                    Assignments
                                </Nav.Link>
                            </>
                        )}
                        {user.role === 'supervisor' && (
                            <Nav.Link as={Link} to="/users">
                                User Management
                            </Nav.Link>
                        )}
                    </Nav>
                    <Nav>
                        <NavDropdown
                            title={`👤 ${user.username}`}
                            id="user-dropdown"
                            align="end"
                        >
                            <NavDropdown.Item disabled>
                                <small className="text-muted">
                                    Role: {user.role === 'supervisor' ? 'Supervisor' : 'Assistant'}
                                </small>
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleLogout}>
                                Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
