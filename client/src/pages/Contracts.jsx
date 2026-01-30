import { useState, useEffect } from 'react';
import { contractsAPI, customersAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

function Contracts() {
    const [contracts, setContracts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [formData, setFormData] = useState({
        customerId: '',
        totalAmount: '',
        downPayment: '',
        numberOfInstallments: '',
        startDate: '',
        description: ''
    });
    const { isAdmin, isManager } = useAuth();

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            const [contractsRes, customersRes] = await Promise.all([
                contractsAPI.getAll({ status: statusFilter }),
                customersAPI.getAll({ limit: 100 })
            ]);
            setContracts(contractsRes.data.data);
            setCustomers(customersRes.data.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await contractsAPI.create({
                ...formData,
                totalAmount: parseFloat(formData.totalAmount),
                downPayment: parseFloat(formData.downPayment) || 0,
                numberOfInstallments: parseInt(formData.numberOfInstallments)
            });
            toast.success('Contract created with installments!');
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create contract');
        }
    };

    const handleView = async (contract) => {
        try {
            const response = await contractsAPI.getOne(contract._id);
            setSelectedContract(response.data.data);
            setShowViewModal(true);
        } catch (error) {
            toast.error('Failed to load contract details');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will delete the contract and all its installments.')) return;
        try {
            await contractsAPI.delete(id);
            toast.success('Contract deleted');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const resetForm = () => {
        setFormData({
            customerId: '',
            totalAmount: '',
            downPayment: '',
            numberOfInstallments: '',
            startDate: '',
            description: ''
        });
    };

    const getStatusBadge = (status) => {
        const classes = {
            active: 'badge-success',
            completed: 'badge-info',
            cancelled: 'badge-danger'
        };
        return <span className={`badge ${classes[status] || 'badge-secondary'}`}>{status}</span>;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="contracts-page">
            <div className="page-header">
                <h1 className="page-title">Contracts</h1>
                {isManager && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <FiPlus /> New Contract
                    </button>
                )}
            </div>

            <div className="search-bar">
                <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '200px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {contracts.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Contract #</th>
                                <th>Customer</th>
                                <th>Total Amount</th>
                                <th>Down Payment</th>
                                <th>Installments</th>
                                <th>Start Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map((contract) => (
                                <tr key={contract._id}>
                                    <td><strong>{contract.contractNumber}</strong></td>
                                    <td>{contract.customerId?.name || 'N/A'}</td>
                                    <td>${contract.totalAmount?.toLocaleString()}</td>
                                    <td>${contract.downPayment?.toLocaleString()}</td>
                                    <td>{contract.numberOfInstallments}</td>
                                    <td>{new Date(contract.startDate).toLocaleDateString()}</td>
                                    <td>{getStatusBadge(contract.status)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-sm btn-outline" onClick={() => handleView(contract)}>
                                                <FiEye />
                                            </button>
                                            {isAdmin && (
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(contract._id)}>
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
                        <FiFileText className="empty-state-icon" />
                        <p className="empty-state-title">No Contracts Found</p>
                        <p className="empty-state-text">Create your first contract to get started</p>
                    </div>
                </div>
            )}

            {/* Create Contract Modal */}
            {showModal && (
                <Modal title="Create New Contract" onClose={() => setShowModal(false)}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Customer *</label>
                            <select
                                className="form-select"
                                value={formData.customerId}
                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                required
                            >
                                <option value="">Select Customer</option>
                                {customers.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Total Amount *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.totalAmount}
                                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Down Payment</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.downPayment}
                                    onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Number of Installments *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.numberOfInstallments}
                                    onChange={(e) => setFormData({ ...formData, numberOfInstallments: e.target.value })}
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Start Date *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-input"
                                rows="2"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        {formData.totalAmount && formData.numberOfInstallments && (
                            <div className="card" style={{ background: 'var(--bg-tertiary)', marginBottom: '1rem' }}>
                                <p className="text-sm text-muted">Installment Amount:</p>
                                <p className="font-semibold" style={{ fontSize: '1.25rem' }}>
                                    ${((parseFloat(formData.totalAmount) - (parseFloat(formData.downPayment) || 0)) / parseInt(formData.numberOfInstallments)).toFixed(2)} / month
                                </p>
                            </div>
                        )}
                        <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Create Contract</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* View Contract Modal */}
            {showViewModal && selectedContract && (
                <Modal title={`Contract ${selectedContract.contractNumber}`} onClose={() => setShowViewModal(false)}>
                    <div className="contract-details">
                        <div className="detail-row">
                            <span>Customer:</span>
                            <span>{selectedContract.customerId?.name}</span>
                        </div>
                        <div className="detail-row">
                            <span>Total Amount:</span>
                            <span>${selectedContract.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                            <span>Down Payment:</span>
                            <span>${selectedContract.downPayment?.toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                            <span>Status:</span>
                            <span>{getStatusBadge(selectedContract.status)}</span>
                        </div>
                        <div className="detail-row">
                            <span>Description:</span>
                            <span>{selectedContract.description || 'N/A'}</span>
                        </div>

                        <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Installments</h4>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Amount</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedContract.installments?.map((inst) => (
                                        <tr key={inst._id}>
                                            <td>{inst.installmentNumber}</td>
                                            <td>${inst.amount?.toFixed(2)}</td>
                                            <td>{new Date(inst.dueDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${inst.status === 'paid' ? 'badge-success' :
                                                        inst.status === 'overdue' ? 'badge-danger' : 'badge-warning'
                                                    }`}>
                                                    {inst.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <style>{`
            .contract-details .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 0.75rem 0;
              border-bottom: 1px solid var(--border-color);
            }
            .contract-details .detail-row span:first-child {
              color: var(--text-muted);
            }
          `}</style>
                </Modal>
            )}
        </div>
    );
}

export default Contracts;
