import React, { useState } from 'react';
import { Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/home', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Create User', icon: '👥' },
    { path: '/customers', label: 'Create Customer', icon: '👨‍💼' },
    { path: '/assignments', label: 'Assignments', icon: '📋' },
    { path: '/approver', label: 'Approver', icon: '✅' }, // Menu baru untuk Approver
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setShowSidebar(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      {/* Header/Navbar */}
      <Navbar bg="white" expand="lg" className="header sticky-top">
        <Container fluid>
          <Navbar.Brand href="#" className="d-flex align-items-center">
            <span 
              className="bg-primary text-white rounded p-2 me-2"
              style={{ backgroundColor: '#DB8928' }}
            >
              🏢
            </span>
            <strong>LPS Admin</strong>
          </Navbar.Brand>
          
          <Navbar.Toggle 
            aria-controls="offcanvasNavbar" 
            onClick={() => setShowSidebar(true)}
          />
          
          <Navbar.Collapse id="navbar-nav" className="justify-content-end">
            <Nav className="align-items-center">
              <Nav.Item className="me-3">
                <small className="text-muted">Welcome,</small>
                <br />
                <strong>{user.name || user.username}</strong>
              </Nav.Item>
              <Nav.Item>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Sidebar Offcanvas for Mobile */}
      <Offcanvas 
        show={showSidebar} 
        onHide={() => setShowSidebar(false)}
        className="bg-sidebar"
        style={{ width: '280px' }}
      >
        <Offcanvas.Header closeButton className="text-white">
          <Offcanvas.Title>
            <strong>LPS Admin</strong>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Nav className="flex-column">
            {menuItems.map((item) => (
              <Nav.Link
                key={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => handleNavigate(item.path)}
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid>
        <div className="row">
          {/* Sidebar for Desktop */}
          <div className="col-md-3 col-lg-2 d-none d-md-block sidebar p-0">
            <div className="position-fixed" style={{ width: '280px' }}>
              <div className="p-4 text-white">
                <h5 className="mb-4">🏢 LPS Admin</h5>
              </div>
              <Nav className="flex-column">
                {menuItems.map((item) => (
                  <Nav.Link
                    key={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <span className="me-2">{item.icon}</span>
                    {item.label}
                  </Nav.Link>
                ))}
              </Nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10 ms-auto main-content">
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

export default Layout;