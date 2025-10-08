import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge, Spinner, Modal } from 'react-bootstrap';
import Layout from '../components/common/Layout';

function Assignments() {
    const [formData, setFormData] = useState({
        customer_id: '',
        agent_id: '',
        // Data baru dari Admin
        jenis_identitas: 'KTP', 
        no_identitas: '',
        nama_lengkap: '',
        tempat_lahir: '',
        tanggal_lahir: '', 
        jenis_kelamin: 'Laki-laki', 
        alamat: '',
        no_telepon: '',
        status_layak_bayar: 'Layak', 
        total_simpanan: '',
        nominal_layak_bayar: '',
        batas_akhir_pengajuan: '', 
        nama_bank: '',
        no_cif: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [agents, setAgents] = useState([]);
    
    // State untuk modal review
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [reviewNote, setReviewNote] = useState('');
    const [reviewAction, setReviewAction] = useState('approve');
    const [reviewLoading, setReviewLoading] = useState(false);
    
    // State untuk modal detail
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [assignmentDetail, setAssignmentDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Fetch assignments, customers, and agents on component mount
    useEffect(() => {
        fetchAssignments();
        fetchCustomers();
        fetchAgents();
    }, []);

    // --- Data Fetching Functions ---

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://lsp-backend-zeta.vercel.app/assignments', {
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
            const response = await fetch('https://lsp-backend-zeta.vercel.app/customers', {
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
            const response = await fetch('https://lsp-backend-zeta.vercel.app/users/agents', {
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

    // --- Handler Functions ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
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

            // Validasi minimum untuk field yang baru (Admin harus isi)
            const requiredFields = ['no_identitas', 'nama_lengkap', 'alamat', 'nama_bank', 'no_cif', 'total_simpanan'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    setMessage({ type: 'danger', text: `Field '${field.replace('_', ' ')}' wajib diisi.` });
                    setLoading(false);
                    return;
                }
            }

            const response = await fetch('https://lsp-backend-zeta.vercel.app/assignments', {
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
                setFormData(prevData => ({ 
                    customer_id: '', 
                    agent_id: '', 
                    jenis_identitas: prevData.jenis_identitas,
                    no_identitas: '',
                    nama_lengkap: '',
                    tempat_lahir: '',
                    tanggal_lahir: '',
                    jenis_kelamin: prevData.jenis_kelamin,
                    alamat: '',
                    no_telepon: '',
                    status_layak_bayar: 'Layak', 
                    total_simpanan: '',
                    nominal_layak_bayar: '',
                    batas_akhir_pengajuan: '',
                    nama_bank: '',
                    no_cif: '',
                }));
                
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

    // --- Review Functions ---

    const handleShowReviewModal = (assignment, action) => {
        setSelectedAssignment(assignment);
        setReviewAction(action);
        setReviewNote('');
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async () => {
        if (!selectedAssignment) return;

        setReviewLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://lsp-backend-zeta.vercel.app/assignments/${selectedAssignment.id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: reviewAction,
                    note: reviewNote
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: `Assignment berhasil di${reviewAction === 'approve' ? 'setujui' : 'tolak'}!` });
                setShowReviewModal(false);
                await fetchAssignments(); // Refresh data
            } else {
                setMessage({ type: 'danger', text: data.message || `Gagal melakukan ${reviewAction}` });
            }
        } catch (err) {
            console.error('Review assignment error:', err);
            setMessage({ type: 'danger', text: 'Terjadi kesalahan saat melakukan review' });
        } finally {
            setReviewLoading(false);
        }
    };

    // --- Detail Functions ---

    const handleShowDetailModal = async (assignmentId) => {
        setDetailLoading(true);
        setShowDetailModal(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://lsp-backend-zeta.vercel.app/assignments/${assignmentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setAssignmentDetail(data.data || data);
            } else {
                setMessage({ type: 'danger', text: data.message || 'Gagal mengambil detail assignment' });
            }
        } catch (err) {
            console.error('Fetch assignment detail error:', err);
            setMessage({ type: 'danger', text: 'Terjadi kesalahan saat mengambil detail assignment' });
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setAssignmentDetail(null);
    };
    
    // --- Helper Functions ---
    
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'warning', text: 'Pending (Draft)' },
            submitted: { bg: 'info', text: 'Submitted' }, 
            approved: { bg: 'success', text: 'Approved' },
            rejected: { bg: 'danger', text: 'Rejected' },
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

    const formatCurrency = (amount) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // --- Component Render ---

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
                                    {/* 1. Customer and Agent Selection */}
                                    <Row>
                                        <Col md={6}>
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
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
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
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <hr className="my-3" />
                                    
                                    <h6 className="mb-3">Customer Details (Admin Input)</h6>

                                    {/* 2. Detail Identitas */}
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Jenis ID</Form.Label>
                                                <Form.Select name="jenis_identitas" value={formData.jenis_identitas} onChange={handleChange} required>
                                                    <option value="KTP">KTP</option>
                                                    <option value="SIM">SIM</option>
                                                    <option value="Paspor">Paspor</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={8}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>No. Identitas <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="no_identitas" value={formData.no_identitas} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Nama Lengkap <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required />
                                    </Form.Group>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Jenis Kelamin</Form.Label>
                                                <Form.Select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange}>
                                                    <option value="Laki-laki">Laki-laki</option>
                                                    <option value="Perempuan">Perempuan</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Tempat Lahir</Form.Label>
                                                <Form.Control type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Tanggal Lahir</Form.Label>
                                                <Form.Control type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Alamat <span className="text-danger">*</span></Form.Label>
                                        <Form.Control as="textarea" rows={2} name="alamat" value={formData.alamat} onChange={handleChange} required />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>No. Telepon</Form.Label>
                                        <Form.Control type="text" name="no_telepon" value={formData.no_telepon} onChange={handleChange} />
                                    </Form.Group>

                                    <hr className="my-4" />
                                    
                                    <h6 className="mb-3">Financial & Bank Details</h6>

                                    {/* 3. Detail Bank dan Finansial */}
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nama Bank <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="nama_bank" value={formData.nama_bank} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>No. CIF <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="no_cif" value={formData.no_cif} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Total Simpanan <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="number" name="total_simpanan" value={formData.total_simpanan} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Status Layak Bayar</Form.Label>
                                                <Form.Select name="status_layak_bayar" value={formData.status_layak_bayar} onChange={handleChange}>
                                                    <option value="Layak">Layak</option>
                                                    <option value="Tidak Layak">Tidak Layak</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nominal Layak Bayar</Form.Label>
                                                <Form.Control type="number" name="nominal_layak_bayar" value={formData.nominal_layak_bayar} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label>Batas Akhir Pengajuan</Form.Label>
                                                <Form.Control type="date" name="batas_akhir_pengajuan" value={formData.batas_akhir_pengajuan} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    

                                    <div className="d-grid">
                                        <Button 
                                            variant="primary" 
                                            type="submit" 
                                            size="lg"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
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

                        {/* Quick Stats & Agents Info */}
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
                                            {assignments.filter(a => a.status === 'pending' || a.status === 'submitted').length}
                                        </h4>
                                        <p className="text-muted mb-0 small">In Progress (Pending/Submitted)</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

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

                    {/* Assignments List */}
                    <Col lg={7}>
                        <Card className="shadow-sm">
                            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">📋 Assignments List</h5>
                                <div>
                                    {loadingAssignments ? (
                                        <Spinner animation="border" size="sm" className="text-primary" />
                                    ) : (
                                        <span className="badge bg-primary px-2 py-1">{assignments.length} assignments</span>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {loadingAssignments ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" className="mb-3" />
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
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assignments.map((assignment) => (
                                                    <tr key={assignment.id}>
                                                        <td>
                                                            <div>
                                                                <strong>{assignment.nama_lengkap || getCustomerName(assignment.customer_id)}</strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    ID: {assignment.no_identitas 
                                                                        ? assignment.no_identitas.substring(0, 8) + '...' 
                                                                        : assignment.customer_id 
                                                                            ? assignment.customer_id.substring(0, 8) + '...'
                                                                            : 'Not set'
                                                                    }
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <strong>{getAgentName(assignment.agent_id)}</strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    ID: {assignment.agent_id 
                                                                        ? assignment.agent_id.substring(0, 8) + '...' 
                                                                        : 'Not set'
                                                                    }
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
                                                            <div className="d-flex gap-1">
                                                                <Button 
                                                                    variant="outline-primary" 
                                                                    size="sm" 
                                                                    onClick={() => handleShowDetailModal(assignment.id)}
                                                                >
                                                                    View Detail
                                                                </Button>
                                                                
                                                                {/* Approve/Reject buttons hanya muncul jika status submitted */}
                                                                {assignment.status === 'submitted' && (
                                                                    <>
                                                                        <Button 
                                                                            variant="outline-success" 
                                                                            size="sm"
                                                                            onClick={() => handleShowReviewModal(assignment, 'approve')}
                                                                        >
                                                                            Approve
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline-danger" 
                                                                            size="sm"
                                                                            onClick={() => handleShowReviewModal(assignment, 'reject')}
                                                                        >
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                
                                                                {/* Delete button hanya muncul jika status masih pending/initial */}
                                                                {assignment.status === 'pending' && (
                                                                    <Button variant="outline-danger" size="sm">
                                                                        Delete
                                                                    </Button>
                                                                )}
                                                            </div>
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
                                    <Badge bg="warning">Pending (Draft) - Agent sedang mengerjakan</Badge>
                                    <Badge bg="info">Submitted - Agent telah mengirim, menunggu review</Badge>
                                    <Badge bg="success">Approved - Disetujui Admin/Approver</Badge>
                                    <Badge bg="danger">Rejected - Ditolak Admin/Approver</Badge>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Review Modal */}
                <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {reviewAction === 'approve' ? 'Approve Assignment' : 'Reject Assignment'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Catatan {reviewAction === 'approve' ? 'Persetujuan' : 'Penolakan'}:
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={reviewNote}
                                onChange={(e) => setReviewNote(e.target.value)}
                                placeholder={
                                    reviewAction === 'approve' 
                                        ? "Masukkan catatan persetujuan (opsional)"
                                        : "Masukkan alasan penolakan"
                                }
                            />
                        </Form.Group>
                        {selectedAssignment && (
                            <div className="alert alert-info">
                                <strong>Assignment:</strong> {selectedAssignment.nama_lengkap || getCustomerName(selectedAssignment.customer_id)}
                                <br />
                                <strong>Agent:</strong> {getAgentName(selectedAssignment.agent_id)}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowReviewModal(false)}
                            disabled={reviewLoading}
                        >
                            Batal
                        </Button>
                        <Button 
                            variant={reviewAction === 'approve' ? 'success' : 'danger'}
                            onClick={handleReviewSubmit}
                            disabled={reviewLoading || (reviewAction === 'reject' && !reviewNote.trim())}
                        >
                            {reviewLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Processing...
                                </>
                            ) : (
                                reviewAction === 'approve' ? 'Approve' : 'Reject'
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Detail Modal */}
                <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Assignment Detail</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {detailLoading ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">Loading detail assignment...</p>
                            </div>
                        ) : assignmentDetail ? (
                            <div>
                                <Row>
                                    <Col md={6}>
                                        <h6 className="text-muted">Customer Information</h6>
                                        <p><strong>Nama Lengkap:</strong> {assignmentDetail.nama_lengkap}</p>
                                        <p><strong>Jenis Identitas:</strong> {assignmentDetail.jenis_identitas}</p>
                                        <p><strong>No. Identitas:</strong> {assignmentDetail.no_identitas}</p>
                                        <p><strong>Jenis Kelamin:</strong> {assignmentDetail.jenis_kelamin}</p>
                                        <p><strong>Tempat Lahir:</strong> {assignmentDetail.tempat_lahir || '-'}</p>
                                        <p><strong>Tanggal Lahir:</strong> {assignmentDetail.tanggal_lahir ? formatDate(assignmentDetail.tanggal_lahir) : '-'}</p>
                                        <p><strong>Alamat:</strong> {assignmentDetail.alamat}</p>
                                        <p><strong>No. Telepon:</strong> {assignmentDetail.no_telepon || '-'}</p>
                                    </Col>
                                    <Col md={6}>
                                        <h6 className="text-muted">Assignment Information</h6>
                                        <p><strong>Status:</strong> {getStatusBadge(assignmentDetail.status)}</p>
                                        <p><strong>Agent:</strong> {getAgentName(assignmentDetail.agent_id)}</p>
                                        <p><strong>Dibuat:</strong> {formatDate(assignmentDetail.created_at)}</p>
                                        <p><strong>Diupdate:</strong> {formatDate(assignmentDetail.updated_at)}</p>
                                        
                                        <h6 className="text-muted mt-3">Financial Information</h6>
                                        <p><strong>Total Simpanan:</strong> {formatCurrency(assignmentDetail.total_simpanan)}</p>
                                        <p><strong>Status Layak Bayar:</strong> {assignmentDetail.status_layak_bayar}</p>
                                        <p><strong>Nominal Layak Bayar:</strong> {formatCurrency(assignmentDetail.nominal_layak_bayar)}</p>
                                        <p><strong>Batas Akhir Pengajuan:</strong> {assignmentDetail.batas_akhir_pengajuan ? formatDate(assignmentDetail.batas_akhir_pengajuan) : '-'}</p>
                                        
                                        <h6 className="text-muted mt-3">Bank Information</h6>
                                        <p><strong>Nama Bank:</strong> {assignmentDetail.nama_bank}</p>
                                        <p><strong>No. CIF:</strong> {assignmentDetail.no_cif}</p>
                                    </Col>
                                </Row>
                                
                                {assignmentDetail.note && (
                                    <div className="mt-3 p-3 bg-light rounded">
                                        <h6>Catatan:</h6>
                                        <p className="mb-0">{assignmentDetail.note}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-muted">Tidak dapat memuat detail assignment</p>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDetailModal}>
                            Tutup
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Layout>
    );
}

export default Assignments;