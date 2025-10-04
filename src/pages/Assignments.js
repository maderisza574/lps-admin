import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import Layout from '../components/common/Layout';

function Assignments() {
  const [formData, setFormData] = useState({
    customer_id: '',
    agent_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);

  // Fetch assignments, customers, and agents on component mount
  useEffect(() => {
    fetchAssignments();
    fetchCustomers();
    fetchAgents();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://lps-admin-nu.vercel.app/assignments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setAssignments(data.data || []);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Gagal mengambil data assignments' });
      }
    } catch (err) {
      console.error('Fetch assignments error:', err);
      setMessage({ type: 'danger', text: 'Terjadi kesalahan saat mengambil data assignments' });
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://lps-admin-nu.vercel.app/customers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setCustomers(data.data || data || []);
      }
    } catch (err) {
      console.error('Fetch customers error:', err);
    }
  };

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      // 🔧 UPDATE: Gunakan endpoint yang benar untuk agents
      const response = await fetch('https://lps-admin-nu.vercel.app/users/agents', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAgents(data.data || []);
      } else {
        setMessage({ type: 'warning', text: 'Gagal mengambil data agents' });
      }
    } catch (err) {
      console.error('Fetch agents error:', err);
      setMessage({ type: 'warning', text: 'Tidak dapat mengambil data agents' });
    }
  };

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

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage({ type: 'danger', text: 'Token tidak ditemukan. Silakan login kembali.' });
        setLoading(false);
        return;
      }

      const response = await fetch('https://lps-admin-nu.vercel.app/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Assignment berhasil dibuat!' });
        setFormData({ customer_id: '', agent_id: '' });
        
        // Refresh assignments list setelah create berhasil
        await fetchAssignments();
      } else {
        setMessage({ type: 'danger', text: data.message || `Gagal membuat assignment. Status: ${response.status}` });
      }
    } catch (err) {
      console.error('Create assignment error:', err);
      setMessage({ type: 'danger', text: 'Terjadi kesalahan. Periksa koneksi internet.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Pending' },
      submitted: { bg: 'success', text: 'Submitted' },
      completed: { bg: 'primary', text: 'Completed' },
      cancelled: { bg: 'danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getCustomerName = (customerId) => {
    if (!customerId) return 'Not Assigned';
    const customer = customers.find(c => c.id === customerId || c.customer_id === customerId);
    return customer ? customer.name || customer.full_name : 'Unknown Customer';
  };

  const getAgentName = (agentId) => {
    if (!agentId) return 'Not Assigned';
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.full_name : 'Unknown Agent';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <Container fluid>
        <Row>
          <Col lg={5}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">📋 Create New Assignment</h5>
              </Card.Header>
              <Card.Body>
                {message.text && (
                  <Alert variant={message.type}>{message.text}</Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Customer <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="customer_id"
                      value={formData.customer_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Pilih Customer</option>
                      {customers.map((customer) => (
                        <option 
                          key={customer.id || customer.customer_id} 
                          value={customer.id || customer.customer_id}
                        >
                          {customer.name || customer.full_name} - {customer.nik}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Pilih customer yang akan ditugaskan
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Agent <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="agent_id"
                      value={formData.agent_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Pilih Agent</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.full_name} - {agent.email}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Pilih agent yang akan menangani customer
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
                          Creating Assignment...
                        </>
                      ) : (
                        'Create Assignment'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Quick Stats */}
            <Row className="mt-4">
              <Col md={6}>
                <Card className="border-primary">
                  <Card.Body className="text-center py-3">
                    <h4 className="text-primary mb-1">{assignments.length}</h4>
                    <p className="text-muted mb-0 small">Total Assignments</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-warning">
                  <Card.Body className="text-center py-3">
                    <h4 className="text-warning mb-1">
                      {assignments.filter(a => a.status === 'pending').length}
                    </h4>
                    <p className="text-muted mb-0 small">Pending</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Agents Info */}
            <Card className="mt-4 border-0 bg-light">
              <Card.Body>
                <h6 className="mb-3">Available Agents:</h6>
                {agents.length > 0 ? (
                  <div>
                    {agents.map((agent) => (
                      <div key={agent.id} className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong>{agent.full_name}</strong>
                          <br />
                          <small className="text-muted">{agent.email}</small>
                        </div>
                        <Badge bg="primary">Agent</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">No agents available</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card className="shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📋 Assignments List</h5>
                <div>
                  {loadingAssignments ? (
                    <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                  ) : (
                    <span className="badge bg-primary px-2 py-1">{assignments.length} assignments</span>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {loadingAssignments ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading assignments...</p>
                  </div>
                ) : assignments.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Customer</th>
                          <th>Agent</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td>
                              <div>
                                <strong>{getCustomerName(assignment.customer_id)}</strong>
                                <br />
                                <small className="text-muted">
                                  ID: {assignment.customer_id || 'Not set'}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <strong>{getAgentName(assignment.agent_id)}</strong>
                                <br />
                                <small className="text-muted">
                                  ID: {assignment.agent_id || 'Not set'}
                                </small>
                              </div>
                            </td>
                            <td>{getStatusBadge(assignment.status)}</td>
                            <td>
                              <small className="text-muted">
                                {formatDate(assignment.created_at)}
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
                    <div className="text-muted mb-2">📋</div>
                    <p className="text-muted">No assignments yet. Create your first assignment!</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Status Legend */}
            <Card className="mt-4 border-0 bg-light">
              <Card.Body>
                <h6 className="mb-3">Status Information:</h6>
                <div className="d-flex flex-wrap gap-2">
                  <Badge bg="warning">Pending - Menunggu konfirmasi</Badge>
                  <Badge bg="success">Submitted - Sudah dikirim</Badge>
                  <Badge bg="primary">Completed - Selesai</Badge>
                  <Badge bg="danger">Cancelled - Dibatalkan</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

export default Assignments;