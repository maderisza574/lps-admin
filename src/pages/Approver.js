import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge, Spinner, Modal } from 'react-bootstrap';
import Layout from '../components/common/Layout';

function Approver() {
    const [formData, setFormData] = useState({
        user_id: '',
        judul: '',
        deskripsi: '',
        attachments: ['']
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [approvers, setApprovers] = useState([]);
    const [loadingApprovers, setLoadingApprovers] = useState(true);
    const [users, setUsers] = useState([]);
    
    // State untuk modal edit
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingApprover, setEditingApprover] = useState(null);
    const [editFormData, setEditFormData] = useState({
        judul: '',
        deskripsi: '',
        attachments: ['']
    });
    const [editLoading, setEditLoading] = useState(false);
    
    // State untuk modal detail
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [approverDetail, setApproverDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // State untuk modal delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingApprover, setDeletingApprover] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // State untuk preview file
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewType, setPreviewType] = useState('');

    // Fetch approvers dan users pada component mount
    useEffect(() => {
        fetchApprovers();
        fetchUsers();
    }, []);

    // --- Data Fetching Functions ---

    const fetchApprovers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://lsp-backend-zeta.vercel.app/approver', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setApprovers(data.data || []);
            } else {
                setMessage({ type: 'danger', text: data.message || 'Gagal mengambil data approver' });
            }
        } catch (err) {
            console.error('Fetch approvers error:', err);
            setMessage({ type: 'danger', text: 'Terjadi kesalahan saat mengambil data approver' });
        } finally {
            setLoadingApprovers(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('No token found');
                setMessage({ type: 'danger', text: 'Token tidak ditemukan. Silakan login kembali.' });
                return;
            }

            // Coba endpoint users biasa
            let response = await fetch('https://lsp-backend-zeta.vercel.app/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Jika endpoint users tidak berhasil, coba endpoint agents
            if (!response.ok) {
                console.log('Trying agents endpoint...');
                response = await fetch('https://lsp-backend-zeta.vercel.app/users/agents', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            const data = await response.json();
            console.log('Final users data:', data);

            if (response.ok) {
                // Handle berbagai kemungkinan struktur response
                let usersData = [];
                
                if (Array.isArray(data)) {
                    usersData = data;
                } else if (data.data && Array.isArray(data.data)) {
                    usersData = data.data;
                } else if (data.users && Array.isArray(data.users)) {
                    usersData = data.users;
                } else {
                    console.warn('Unexpected data structure:', data);
                    usersData = [];
                }
                
                setUsers(usersData);
                
                if (usersData.length === 0) {
                    setMessage({ type: 'warning', text: 'Tidak ada data users yang ditemukan' });
                }
            } else {
                throw new Error(data.message || `HTTP ${response.status}`);
            }
        } catch (err) {
            console.error('Fetch users error:', err);
            setMessage({ type: 'warning', text: `Gagal mengambil data users: ${err.message}` });
            setUsers([]); // Set empty array sebagai fallback
        }
    };

    // --- Helper Functions untuk Get User/Customer by ID ---

    const getUserById = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://lsp-backend-zeta.vercel.app/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.data || data;
            }
            return null;
        } catch (err) {
            console.error('Get user by ID error:', err);
            return null;
        }
    };

    // --- File Preview Functions ---

    const getFileType = (url) => {
        if (!url) return 'unknown';
        
        const extension = url.split('.').pop().toLowerCase();
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
        const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
        const presentationTypes = ['ppt', 'pptx'];
        
        if (imageTypes.includes(extension)) return 'image';
        if (documentTypes.includes(extension)) return 'document';
        if (spreadsheetTypes.includes(extension)) return 'spreadsheet';
        if (presentationTypes.includes(extension)) return 'presentation';
        if (extension === 'pdf') return 'pdf';
        
        return 'unknown';
    };

    const getFileIcon = (url) => {
        const fileType = getFileType(url);
        
        switch (fileType) {
            case 'image':
                return '🖼️';
            case 'pdf':
                return '📄';
            case 'document':
                return '📝';
            case 'spreadsheet':
                return '📊';
            case 'presentation':
                return '📑';
            default:
                return '📎';
        }
    };

    const getFileNameFromUrl = (url) => {
        if (!url) return 'Unknown File';
        return url.split('/').pop() || 'Unknown File';
    };

    const handlePreviewFile = (url) => {
        const fileType = getFileType(url);
        setPreviewUrl(url);
        setPreviewType(fileType);
        setShowPreviewModal(true);
    };

    // --- Handler Functions ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleAttachmentChange = (index, value) => {
        const newAttachments = [...formData.attachments];
        newAttachments[index] = value;
        setFormData(prevData => ({
            ...prevData,
            attachments: newAttachments
        }));
    };

    const addAttachmentField = () => {
        setFormData(prevData => ({
            ...prevData,
            attachments: [...prevData.attachments, '']
        }));
    };

    const removeAttachmentField = (index) => {
        if (formData.attachments.length > 1) {
            const newAttachments = formData.attachments.filter((_, i) => i !== index);
            setFormData(prevData => ({
                ...prevData,
                attachments: newAttachments
            }));
        }
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

            // Validasi field wajib
            if (!formData.user_id || !formData.judul) {
                setMessage({ type: 'danger', text: 'Field User dan Judul wajib diisi.' });
                setLoading(false);
                return;
            }

            // Filter attachments yang tidak kosong
            const filteredAttachments = formData.attachments.filter(attachment => attachment.trim() !== '');

            const payload = {
                ...formData,
                attachments: filteredAttachments
            };

            const response = await fetch('https://lsp-backend-zeta.vercel.app/approver', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Approver berhasil dibuat!' });
                setFormData({
                    user_id: '',
                    judul: '',
                    deskripsi: '',
                    attachments: ['']
                });
                
                await fetchApprovers();
            } else {
                setMessage({ type: 'danger', text: data.message || `Gagal membuat approver. Status: ${response.status}` });
            }
        } catch (err) {
            console.error('Create approver error:', err);
            setMessage({ type: 'danger', text: 'Terjadi kesalahan. Periksa koneksi internet.' });
        } finally {
            setLoading(false);
        }
    };

    // --- Edit Functions ---

    const handleShowEditModal = (approver) => {
        setEditingApprover(approver);
        setEditFormData({
            judul: approver.judul || '',
            deskripsi: approver.deskripsi || '',
            attachments: approver.attachments && approver.attachments.length > 0 
                ? [...approver.attachments] 
                : ['']
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleEditAttachmentChange = (index, value) => {
        const newAttachments = [...editFormData.attachments];
        newAttachments[index] = value;
        setEditFormData(prevData => ({
            ...prevData,
            attachments: newAttachments
        }));
    };

    const addEditAttachmentField = () => {
        setEditFormData(prevData => ({
            ...prevData,
            attachments: [...prevData.attachments, '']
        }));
    };

    const removeEditAttachmentField = (index) => {
        if (editFormData.attachments.length > 1) {
            const newAttachments = editFormData.attachments.filter((_, i) => i !== index);
            setEditFormData(prevData => ({
                ...prevData,
                attachments: newAttachments
            }));
        }
    };

    const handleEditSubmit = async () => {
        if (!editingApprover) return;

        setEditLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Filter attachments yang tidak kosong
            const filteredAttachments = editFormData.attachments.filter(attachment => attachment.trim() !== '');

            const payload = {
                ...editFormData,
                attachments: filteredAttachments
            };

            const response = await fetch(`https://lsp-backend-zeta.vercel.app/approver/${editingApprover.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Approver berhasil diupdate!' });
                setShowEditModal(false);
                await fetchApprovers(); // Refresh data
            } else {
                setMessage({ type: 'danger', text: data.message || `Gagal mengupdate approver` });
            }
        } catch (err) {
            console.error('Edit approver error:', err);
            setMessage({ type: 'danger', text: 'Terjadi kesalahan saat mengupdate approver' });
        } finally {
            setEditLoading(false);
        }
    };

    // --- Detail Functions ---

    const handleShowDetailModal = async (approverId) => {
        setDetailLoading(true);
        setShowDetailModal(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://lsp-backend-zeta.vercel.app/approver/${approverId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const approverData = data.data || data;
                
                // Jika ada user_id, ambil detail user
                if (approverData.user_id) {
                    const userDetail = await getUserById(approverData.user_id);
                    approverData.user_detail = userDetail;
                }
                
                setApproverDetail(approverData);
            } else {
                setMessage({ type: 'danger', text: data.message || 'Gagal mengambil detail approver' });
            }
        } catch (err) {
            console.error('Fetch approver detail error:', err);
            setMessage({ type: 'danger', text: 'Terjadi kesalahan saat mengambil detail approver' });
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setApproverDetail(null);
    };

    // --- Delete Functions ---

    const handleShowDeleteModal = (approver) => {
        setDeletingApprover(approver);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!deletingApprover) return;

        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://lsp-backend-zeta.vercel.app/approver/${deletingApprover.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Approver berhasil dihapus!' });
                setShowDeleteModal(false);
                await fetchApprovers(); // Refresh data
            } else {
                setMessage({ type: 'danger', text: data.message || `Gagal menghapus approver` });
            }
        } catch (err) {
            console.error('Delete approver error:', err);
            setMessage({ type: 'danger', text: 'Terjadi kesalahan saat menghapus approver' });
        } finally {
            setDeleteLoading(false);
        }
    };

    // --- Helper Functions ---

    const getUserName = (userId) => {
        if (!userId) return 'Not Assigned';
        const user = users.find(u => u.id === userId);
        return user ? user.full_name || user.name || user.email : 'Unknown User';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (err) {
            return dateString;
        }
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '-';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // --- Safe substring functions ---
    // const safeSubstring = (text, start = 0, end = 8) => {
    //     if (!text || typeof text !== 'string') return 'N/A';
    //     return text.length > end ? text.substring(start, end) + '...' : text;
    // };

    // const safeIdSubstring = (id) => {
    //     if (!id || typeof id !== 'string') return 'N/A';
    //     return id.substring(0, 8) + '...';
    // };

    // --- Component Render ---

    return (
        <Layout>
            <Container fluid>
                <Row>
                    <Col lg={5}>
                        <Card className="shadow-sm mb-4">
                            <Card.Header className="bg-white">
                                <h5 className="mb-0">👥 Create New Approver</h5>
                            </Card.Header>
                            <Card.Body>
                                {message.text && (
                                    <Alert variant={message.type}>{message.text}</Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>User <span className="text-danger">*</span></Form.Label>
                                        <Form.Select
                                            name="user_id"
                                            value={formData.user_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Pilih User</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.full_name || user.name} - {user.email}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {users.length === 0 && (
                                            <Form.Text className="text-warning">
                                                Sedang memuat data users...
                                            </Form.Text>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Judul <span className="text-danger">*</span></Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="judul" 
                                            value={formData.judul} 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="Masukkan judul approver"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Deskripsi</Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={3} 
                                            name="deskripsi" 
                                            value={formData.deskripsi} 
                                            onChange={handleChange} 
                                            placeholder="Masukkan deskripsi (opsional)"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Attachments</Form.Label>
                                        {formData.attachments.map((attachment, index) => (
                                            <div key={index} className="d-flex mb-2">
                                                <Form.Control
                                                    type="url"
                                                    value={attachment}
                                                    onChange={(e) => handleAttachmentChange(index, e.target.value)}
                                                    placeholder="https://example.com/file.pdf"
                                                    className="me-2"
                                                />
                                                {formData.attachments.length > 1 && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => removeAttachmentField(index)}
                                                    >
                                                        ✕
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={addAttachmentField}
                                            type="button"
                                        >
                                            + Tambah Attachment
                                        </Button>
                                        <Form.Text className="text-muted">
                                            Masukkan URL attachment (opsional)
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
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Creating Approver...
                                                </>
                                            ) : (
                                                'Create Approver'
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
                                        <h4 className="text-primary mb-1">{approvers.length}</h4>
                                        <p className="text-muted mb-0 small">Total Approvers</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="border-success">
                                    <Card.Body className="text-center py-3">
                                        <h4 className="text-success mb-1">{users.length}</h4>
                                        <p className="text-muted mb-0 small">Available Users</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* Approvers List */}
                    <Col lg={7}>
                        <Card className="shadow-sm">
                            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">📋 Approvers List</h5>
                                <div>
                                    {loadingApprovers ? (
                                        <Spinner animation="border" size="sm" className="text-primary" />
                                    ) : (
                                        <span className="badge bg-primary px-2 py-1">{approvers.length} approvers</span>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {loadingApprovers ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" className="mb-3" />
                                        <p className="text-muted">Loading approvers...</p>
                                    </div>
                                ) : approvers.length > 0 ? (
                                    <div className="table-responsive">
                                        <Table hover className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Judul</th>
                                                    <th>User</th>
                                                    <th>Attachments</th>
                                                    <th>Created</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {approvers.map((approver) => (
                                                    <tr key={approver.id}>
                                                        <td>
                                                            <div>
                                                                <strong>{truncateText(approver.judul, 30)}</strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {truncateText(approver.deskripsi, 40)}
                                                                </small>
                                                                <br />
                                                                <small className="text-primary">
                                                                    ID: {(approver.id)}
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <strong>
                                                                    {approver.users?.full_name || getUserName(approver.user_id)}
                                                                </strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {approver.users?.email || 'No email'}
                                                                </small>
                                                                <br />
                                                                <small className="text-info">
                                                                    User ID: {approver.name}
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge bg={approver.attachments && approver.attachments.length > 0 ? 'success' : 'secondary'}>
                                                                {approver.attachments ? approver.attachments.length : 0} files
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {formatDate(approver.created_at)}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-1">
                                                                <Button 
                                                                    variant="outline-primary" 
                                                                    size="sm" 
                                                                    onClick={() => handleShowDetailModal(approver.id)}
                                                                    title="View Detail"
                                                                >
                                                                    👁️ View
                                                                </Button>
                                                                <Button 
                                                                    variant="outline-warning" 
                                                                    size="sm"
                                                                    onClick={() => handleShowEditModal(approver)}
                                                                    title="Edit Approver"
                                                                >
                                                                    ✏️ Edit
                                                                </Button>
                                                                <Button 
                                                                    variant="outline-danger" 
                                                                    size="sm"
                                                                    onClick={() => handleShowDeleteModal(approver)}
                                                                    title="Delete Approver"
                                                                >
                                                                    🗑️ Delete
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="text-muted mb-2">👥</div>
                                        <p className="text-muted">No approvers yet. Create your first approver!</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Edit Modal */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Approver</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Judul <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                name="judul" 
                                value={editFormData.judul} 
                                onChange={handleEditChange} 
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Deskripsi</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                name="deskripsi" 
                                value={editFormData.deskripsi} 
                                onChange={handleEditChange} 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Attachments</Form.Label>
                            {editFormData.attachments.map((attachment, index) => (
                                <div key={index} className="d-flex mb-2">
                                    <Form.Control
                                        type="url"
                                        value={attachment}
                                        onChange={(e) => handleEditAttachmentChange(index, e.target.value)}
                                        placeholder="https://example.com/file.pdf"
                                        className="me-2"
                                    />
                                    {editFormData.attachments.length > 1 && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => removeEditAttachmentField(index)}
                                        >
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={addEditAttachmentField}
                                type="button"
                            >
                                + Tambah Attachment
                            </Button>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowEditModal(false)}
                            disabled={editLoading}
                        >
                            Batal
                        </Button>
                        <Button 
                            variant="primary"
                            onClick={handleEditSubmit}
                            disabled={editLoading || !editFormData.judul.trim()}
                        >
                            {editLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Updating...
                                </>
                            ) : (
                                'Update Approver'
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Detail Modal */}
                <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Approver Detail</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {detailLoading ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">Loading detail approver...</p>
                            </div>
                        ) : approverDetail ? (
                            <div>
                                <Row>
                                    <Col md={6}>
                                        <h6 className="text-muted border-bottom pb-2">Approver Information</h6>
                                        <p><strong>Judul:</strong> {approverDetail.judul}</p>
                                        <p><strong>Deskripsi:</strong> {approverDetail.deskripsi || '-'}</p>
                                        <p><strong>Created:</strong> {formatDate(approverDetail.created_at)}</p>
                                        <p><strong>Updated:</strong> {formatDate(approverDetail.updated_at)}</p>
                                    </Col>
                                    <Col md={6}>
                                        <h6 className="text-muted border-bottom pb-2">User Information</h6>
                                        <p><strong>Nama:</strong> {approverDetail.users?.full_name || approverDetail.user_detail?.full_name || getUserName(approverDetail.user_id)}</p>
                                        <p><strong>Email:</strong> {approverDetail.users?.email || approverDetail.user_detail?.email || 'No email'}</p>
                                        <p><strong>Role:</strong> 
                                            <Badge bg="info" className="ms-2">
                                                {approverDetail.users?.role || approverDetail.user_detail?.role || 'Unknown'}
                                            </Badge>
                                        </p>
                                        <p><strong>User ID:</strong> 
                                            <code className="ms-2">{approverDetail.user_id}</code>
                                        </p>
                                    </Col>
                                </Row>
                                
                                {/* Informasi Admin Creator (jika ada) */}
                                {(approverDetail.created_by || approverDetail.admin_id) && (
                                    <Row className="mt-3">
                                        <Col md={12}>
                                            <h6 className="text-muted border-bottom pb-2">Admin Information</h6>
                                            <p><strong>Dibuat oleh:</strong> 
                                                {approverDetail.created_by ? ` User ID: ${approverDetail.created_by}` : ' Tidak tersedia'}
                                            </p>
                                            {approverDetail.admin_id && (
                                                <p><strong>Admin ID:</strong> 
                                                    <code className="ms-2">{approverDetail.admin_id}</code>
                                                </p>
                                            )}
                                        </Col>
                                    </Row>
                                )}
                                
                                {approverDetail.attachments && approverDetail.attachments.length > 0 && (
                                    <div className="mt-3">
                                        <h6 className="text-muted border-bottom pb-2">Attachments ({approverDetail.attachments.length})</h6>
                                        <div className="list-group">
                                            {approverDetail.attachments.map((attachment, index) => (
                                                <div 
                                                    key={index}
                                                    className="list-group-item d-flex justify-content-between align-items-center"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2 fs-5">{getFileIcon(attachment)}</span>
                                                        <div>
                                                            <div className="fw-bold">{getFileNameFromUrl(attachment)}</div>
                                                            <small className="text-muted">{attachment}</small>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-1">
                                                        <Button 
                                                            variant="outline-primary" 
                                                            size="sm"
                                                            onClick={() => handlePreviewFile(attachment)}
                                                            title="Preview File"
                                                        >
                                                            👁️ Preview
                                                        </Button>
                                                        <Button 
                                                            variant="outline-success" 
                                                            size="sm"
                                                            href={attachment}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Download File"
                                                        >
                                                            📥 Download
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Metadata */}
                                <div className="mt-3 p-3 bg-light rounded">
                                    <h6 className="text-muted">Metadata</h6>
                                    <Row>
                                        <Col md={6}>
                                            <small><strong>Approver ID:</strong></small>
                                            <br />
                                            <code className="small">{approverDetail.id}</code>
                                        </Col>
                                        <Col md={6}>
                                            <small><strong>User ID:</strong></small>
                                            <br />
                                            <code className="small">{approverDetail.user_id}</code>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-muted">Tidak dapat memuat detail approver</p>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDetailModal}>
                            Tutup
                        </Button>
                        {approverDetail && (
                            <Button 
                                variant="outline-primary"
                                onClick={() => {
                                    // Copy approver ID to clipboard
                                    navigator.clipboard.writeText(approverDetail.id);
                                    setMessage({ type: 'success', text: 'ID Approver berhasil disalin!' });
                                }}
                            >
                                Salin ID
                            </Button>
                        )}
                    </Modal.Footer>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Konfirmasi Hapus</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Apakah Anda yakin ingin menghapus approver ini?</p>
                        {deletingApprover && (
                            <div className="alert alert-warning">
                                <strong>{deletingApprover.judul}</strong>
                                <br />
                                <small>User: {getUserName(deletingApprover.user_id)}</small>
                            </div>
                        )}
                        <p className="text-danger">
                            <small>Tindakan ini tidak dapat dibatalkan.</small>
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleteLoading}
                        >
                            Batal
                        </Button>
                        <Button 
                            variant="danger"
                            onClick={handleDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Hapus Approver'
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* File Preview Modal */}
                <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="xl" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>File Preview - {getFileNameFromUrl(previewUrl)}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        {previewType === 'image' ? (
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                        ) : previewType === 'pdf' ? (
                            <iframe
                                src={previewUrl}
                                style={{ width: '100%', height: '70vh', border: 'none' }}
                                title="PDF Preview"
                            />
                        ) : (
                            <div className="p-5">
                                <div className="display-1 text-muted mb-3">
                                    {getFileIcon(previewUrl)}
                                </div>
                                <h5>File Preview Tidak Tersedia</h5>
                                <p className="text-muted">
                                    File ini tidak dapat dipreview di browser. Silakan download untuk melihat kontennya.
                                </p>
                                <Button 
                                    variant="primary"
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    📥 Download File
                                </Button>
                            </div>
                        )}
                        
                        {/* Fallback untuk image error */}
                        {previewType === 'image' && (
                            <div style={{ display: 'none' }} className="p-5">
                                <div className="display-1 text-muted mb-3">🖼️</div>
                                <h5>Gambar Tidak Dapat Dimuat</h5>
                                <p className="text-muted">
                                    Gambar tidak dapat ditampilkan. Mungkin URL tidak valid atau gambar tidak tersedia.
                                </p>
                                <Button 
                                    variant="primary"
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    🔗 Buka Link
                                </Button>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                            Tutup
                        </Button>
                        <Button 
                            variant="primary"
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            📥 Download
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Layout>
    );
}

export default Approver;