import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table } from 'react-bootstrap';
import Layout from '../components/common/Layout';

function Customers() {
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Function to fetch customers from API
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage({ type: 'danger', text: 'Token tidak ditemukan. Silakan login kembali.' });
        return;
      }

      const response = await fetch('http://localhost:3000/customers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCustomers(data.data || data); // Sesuaikan dengan struktur response API
      } else {
        setMessage({ type: 'danger', text: data.message || 'Gagal mengambil data customers' });
      }
    } catch (err) {
      console.error('Fetch customers error:', err);
      setMessage({ type: 'danger', text: 'Terjadi kesalahan saat mengambil data customers' });
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

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

      const response = await fetch('http://localhost:3000/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Customer berhasil dibuat!' });
        setFormData({ name: '', nik: '', address: '', phone: '' });
        
        // Refresh customers list setelah create berhasil
        await fetchCustomers();
      } else {
        setMessage({ type: 'danger', text: data.message || `Gagal membuat customer. Status: ${response.status}` });
      }
    } catch (err) {
      console.error('Create customer error:', err);
      setMessage({ type: 'danger', text: 'Terjadi kesalahan. Periksa koneksi internet.' });
    } finally {
      setLoading(false);
    }
  };

  // Format date untuk display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Hitung customers bulan ini
  const getThisMonthCustomers = () => {
    const now = new Date();
    return customers.filter(customer => {
      const created = new Date(customer.createdAt || customer.created_date);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
  };

  return (
    <Layout>
      <Container fluid>
        <Row>
          <Col lg={6}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">📝 Create New Customer</h5>
              </Card.Header>
              <Card.Body>
                {message.text && (
                  <Alert variant={message.type}>{message.text}</Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nama Lengkap <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Masukkan nama lengkap"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>NIK <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="nik"
                          value={formData.nik}
                          onChange={handleChange}
                          placeholder="Masukkan NIK"
                          required
                          maxLength={16}
                        />
                        <Form.Text className="text-muted">
                          16 digit angka NIK
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Alamat <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Masukkan alamat lengkap"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Nomor Telepon <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Contoh: 08123456789"
                      required
                    />
                    <Form.Text className="text-muted">
                      Format: 08xxxxxxxxxx
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
                          Creating...
                        </>
                      ) : (
                        'Create Customer'
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
                <h5 className="mb-0">👥 Recent Customers</h5>
                <div>
                  {loadingCustomers ? (
                    <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                  ) : (
                    <span className="badge bg-primary px-2 py-1">{customers.length} customers</span>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {loadingCustomers ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading customers...</p>
                  </div>
                ) : customers.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Nama</th>
                          <th>NIK</th>
                          <th>Phone</th>
                          <th>Created</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id || customer.customer_id}>
                            <td>
                              <div>
                                <strong>{customer.name || customer.full_name}</strong>
                                <br />
                                <small className="text-muted">
                                  {customer.address || customer.alamat}
                                </small>
                              </div>
                            </td>
                            <td>{customer.nik}</td>
                            <td>{customer.phone || customer.phone_number}</td>
                            <td>
                              <small className="text-muted">
                                {formatDate(customer.createdAt || customer.created_date)}
                              </small>
                            </td>
                            <td>
                              <Button variant="outline-primary" size="sm">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="text-muted mb-2">📝</div>
                    <p className="text-muted">No customers yet. Create your first customer!</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Quick Stats */}
            <Row className="mt-4">
              <Col md={6}>
                <Card className="border-primary">
                  <Card.Body className="text-center">
                    <h3 className="text-primary mb-1">
                      {loadingCustomers ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        customers.length
                      )}
                    </h3>
                    <p className="text-muted mb-0">Total Customers</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-success">
                  <Card.Body className="text-center">
                    <h3 className="text-success mb-1">
                      {loadingCustomers ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        getThisMonthCustomers()
                      )}
                    </h3>
                    <p className="text-muted mb-0">This Month</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

export default Customers;