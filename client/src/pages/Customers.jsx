import { useState, useEffect } from 'react';
import { customersAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        nationalId: '',
        address: '',
        notes: ''
    });
    const { isAdmin, isManager } = useAuth();

    useEffect(() => {
        fetchCustomers();
    }, [search]);

    const fetchCustomers = async () => {
        try {
            const response = await customersAPI.getAll({ search });
            setCustomers(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await customersAPI.update(editingCustomer._id, formData);
                toast.success('Customer updated successfully');
            } else {
                await customersAPI.create(formData);
                toast.success('Customer created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            nationalId: customer.nationalId || '',
            address: customer.address || '',
            notes: customer.notes || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;
        try {
            await customersAPI.delete(id);
            toast.success('Customer deleted successfully');
            fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const resetForm = () => {
        setEditingCustomer(null);
        setFormData({
            name: '',
            phone: '',
            email: '',
            nationalId: '',
            address: '',
            notes: ''
        });
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="customers-page">
            <div className="page-header">
                <h1 className="page-title">Customers</h1>
                {isManager && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <FiPlus /> Add Customer
                    </button>
                )}
            </div>

            <div className="search-bar">
                <div className="search-input" style={{ position: 'relative' }}>
                    <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
            </div>

            {customers.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>National ID</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                background: 'var(--primary)',
                                                borderRadius: 'var(--radius)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '600'
                                            }}>
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            {customer.name}
                                        </div>
                                    </td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.email || '-'}</td>
                                    <td>{customer.nationalId || '-'}</td>
                                    <td>{customer.address?.substring(0, 30) || '-'}{customer.address?.length > 30 ? '...' : ''}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {isManager && (
                                                <button className="btn btn-sm btn-outline" onClick={() => handleEdit(customer)}>
                                                    <FiEdit2 />
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(customer._id)}>
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <FiUser className="empty-state-icon" />
                        <p className="empty-state-title">No Customers Found</p>
                        <p className="empty-state-text">
                            {search ? 'No customers match your search' : 'Start by adding your first customer'}
                        </p>
                        {isManager && !search && (
                            <button className="btn btn-primary" onClick={openAddModal}>
                                <FiPlus /> Add Customer
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <Modal
                    title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
                    onClose={() => setShowModal(false)}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">National ID</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.nationalId}
                                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <textarea
                                className="form-input"
                                rows="2"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-input"
                                rows="2"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                        <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '1.5rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingCustomer ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default Customers;
