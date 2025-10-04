import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table } from 'react-bootstrap';
import Layout from '../components/common/Layout';

function Users() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'agent' // default role sekarang agent
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [users, setUsers] = useState([
    { id: 1, email: 'admin@gmail.com', full_name: 'User Satu', role: 'admin', createdAt: '2024-01-15' },
    { id: 2, email: 'agent@gmail.com', full_name: 'User Dua', role: 'agent', createdAt: '2024-01-14' },
    { id: 3, email: 'approver@gmail.com', full_name: 'User Tiga', role: 'approver', createdAt: '2024-01-13' }
  ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validasi password
    if (formData.password.length < 6) {
      setMessage({ type: 'danger', text: 'Password harus minimal 6 karakter' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage({ type: 'danger', text: 'Token tidak ditemukan. Silakan login kembali.' });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'User berhasil dibuat!' });
        setFormData({ 
          email: '', 
          password: '', 
          full_name: '', 
          role: 'agent' 
        });
        
        // Tambahkan user baru ke list
        setUsers(prev => [...prev, {
          id: Date.now(), // temporary ID
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          createdAt: new Date().toISOString().split('T')[0]
        }]);
      } else {
        setMessage({ type: 'danger', text: data.message || `Gagal membuat user. Status: ${response.status}` });
      }
    } catch (err) {
      console.error('Create user error:', err);
      setMessage({ type: 'danger', text: 'Terjadi kesalahan. Periksa koneksi internet.' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'danger', text: 'Admin' },
      agent: { bg: 'primary', text: 'Agent' },
      approver: { bg: 'warning', text: 'Approver' }
    };
    
    const config = roleConfig[role] || { bg: 'secondary', text: role };
    return <span className={`badge bg-${config.bg}`}>{config.text}</span>;
  };

  return (
    <Layout>
      <Container fluid>
        <Row>
          <Col lg={6}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">👥 Create New User</h5>
              </Card.Header>
              <Card.Body>
                {message.text && (
                  <Alert variant={message.type}>{message.text}</Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Masukkan email"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Masukkan password"
                      required
                      minLength={6}
                    />
                    <Form.Text className="text-muted">
                      Minimal 6 karakter
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nama Lengkap <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="agent">Agent</option>
                      <option value="approver">Approver</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Pilih role untuk user
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating User...
                        </>
                      ) : (
                        'Create User'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">👥 Users List</h5>
                <span className="badge bg-primary px-2 py-1">{users.length} users</span>
              </Card.Header>
              <Card.Body className="p-0">
                {users.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Created</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div>
                                <strong>{user.full_name}</strong>
                                <br />
                                <small className="text-muted">{user.email}</small>
                              </div>
                            </td>
                            <td>{getRoleBadge(user.role)}</td>
                            <td>
                              <small className="text-muted">
                                {new Date(user.createdAt).toLocaleDateString('id-ID')}
                              </small>
                            </td>
                            <td>
                              <Button variant="outline-primary" size="sm" className="me-1">
                                Edit
                              </Button>
                              <Button variant="outline-danger" size="sm">
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="text-muted mb-2">👥</div>
                    <p className="text-muted">No users yet. Create your first user!</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Quick Stats */}
            <Row className="mt-4">
              <Col md={4}>
                <Card className="border-danger">
                  <Card.Body className="text-center py-3">
                    <h4 className="text-danger mb-1">
                      {users.filter(u => u.role === 'admin').length}
                    </h4>
                    <p className="text-muted mb-0 small">Admin</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-primary">
                  <Card.Body className="text-center py-3">
                    <h4 className="text-primary mb-1">
                      {users.filter(u => u.role === 'agent').length}
                    </h4>
                    <p className="text-muted mb-0 small">Agents</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-warning">
                  <Card.Body className="text-center py-3">
                    <h4 className="text-warning mb-1">
                      {users.filter(u => u.role === 'approver').length}
                    </h4>
                    <p className="text-muted mb-0 small">Approvers</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Role Information */}
            <Card className="mt-4 border-0 bg-light">
              <Card.Body>
                <h6 className="mb-3">Role Information:</h6>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-danger">Admin - Full access</span>
                  <span className="badge bg-primary">Agent - Create customers & transactions</span>
                  <span className="badge bg-warning text-dark">Approver - Approve transactions</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

export default Users;