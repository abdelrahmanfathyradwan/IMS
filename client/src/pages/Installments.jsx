import { useState, useEffect } from 'react';
import { installmentsAPI } from '../services/api';
import { FiDollarSign, FiAlertCircle, FiCheck, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

function Installments() {
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMethod: 'cash',
        notes: ''
    });

    useEffect(() => {
        fetchInstallments();
    }, [statusFilter]);

    const fetchInstallments = async () => {
        try {
            const response = await installmentsAPI.getAll({ status: statusFilter });
            setInstallments(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch installments');
        } finally {
            setLoading(false);
        }
    };

    const openPayModal = (installment) => {
        setSelectedInstallment(installment);
        setPaymentData({
            amount: installment.amount,
            paymentMethod: 'cash',
            notes: ''
        });
        setShowPayModal(true);
    };

    const handlePay = async (e) => {
        e.preventDefault();
        try {
            await installmentsAPI.pay(selectedInstallment._id, {
                amount: parseFloat(paymentData.amount),
                paymentMethod: paymentData.paymentMethod,
                notes: paymentData.notes
            });
            toast.success('Payment recorded successfully!');
            setShowPayModal(false);
            fetchInstallments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment failed');
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            paid: { class: 'badge-success', icon: FiCheck },
            unpaid: { class: 'badge-warning', icon: FiClock },
            overdue: { class: 'badge-danger', icon: FiAlertCircle },
            partial: { class: 'badge-info', icon: FiDollarSign }
        };
        const { class: className, icon: Icon } = config[status] || config.unpaid;
        return (
            <span className={`badge ${className}`}>
                <Icon style={{ marginRight: '0.25rem' }} />
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Calculate stats
    const stats = {
        total: installments.length,
        paid: installments.filter(i => i.status === 'paid').length,
        unpaid: installments.filter(i => i.status === 'unpaid').length,
        overdue: installments.filter(i => i.status === 'overdue').length
    };

    return (
        <div className="installments-page">
            <div className="page-header">
                <h1 className="page-title">Installments</h1>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card" onClick={() => setStatusFilter('')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon primary"><FiDollarSign /></div>
                    <div className="stat-content">
                        <h3>Total</h3>
                        <div className="value">{stats.total}</div>
                    </div>
                </div>
                <div className="stat-card" onClick={() => setStatusFilter('paid')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon success"><FiCheck /></div>
                    <div className="stat-content">
                        <h3>Paid</h3>
                        <div className="value">{stats.paid}</div>
                    </div>
                </div>
                <div className="stat-card" onClick={() => setStatusFilter('unpaid')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon warning"><FiClock /></div>
                    <div className="stat-content">
                        <h3>Unpaid</h3>
                        <div className="value">{stats.unpaid}</div>
                    </div>
                </div>
                <div className="stat-card" onClick={() => setStatusFilter('overdue')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon danger"><FiAlertCircle /></div>
                    <div className="stat-content">
                        <h3>Overdue</h3>
                        <div className="value">{stats.overdue}</div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="search-bar">
                <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '200px' }}
                >
                    <option value="">All Installments</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            {/* Table */}
            {installments.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Contract</th>
                                <th>#</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {installments.map((installment) => (
                                <tr key={installment._id}>
                                    <td>{installment.contractId?.customerId?.name || 'N/A'}</td>
                                    <td>{installment.contractId?.contractNumber || 'N/A'}</td>
                                    <td>#{installment.installmentNumber}</td>
                                    <td>
                                        <div>
                                            <strong>${installment.amount?.toFixed(2)}</strong>
                                            {installment.paidAmount > 0 && installment.status !== 'paid' && (
                                                <div className="text-xs text-muted">
                                                    Paid: ${installment.paidAmount?.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            {new Date(installment.dueDate).toLocaleDateString()}
                                            {installment.paidDate && (
                                                <div className="text-xs text-muted">
                                                    Paid: {new Date(installment.paidDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(installment.status)}</td>
                                    <td>
                                        {installment.status !== 'paid' && (
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => openPayModal(installment)}
                                            >
                                                <FiDollarSign /> Pay
                                            </button>
                                        )}
                                        {installment.status === 'paid' && (
                                            <span className="text-muted text-sm">{installment.paymentMethod}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <FiDollarSign className="empty-state-icon" />
                        <p className="empty-state-title">No Installments Found</p>
                        <p className="empty-state-text">
                            {statusFilter ? `No ${statusFilter} installments` : 'Create contracts to generate installments'}
                        </p>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPayModal && selectedInstallment && (
                <Modal title="Record Payment" onClose={() => setShowPayModal(false)}>
                    <form onSubmit={handlePay}>
                        <div className="card" style={{ background: 'var(--bg-tertiary)', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span className="text-muted">Customer:</span>
                                <span>{selectedInstallment.contractId?.customerId?.name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span className="text-muted">Installment:</span>
                                <span>#{selectedInstallment.installmentNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-muted">Amount Due:</span>
                                <span className="font-semibold">${selectedInstallment.amount?.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Payment Amount</label>
                            <input
                                type="number"
                                className="form-input"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Payment Method</label>
                            <select
                                className="form-select"
                                value={paymentData.paymentMethod}
                                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                            >
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="card">Card</option>
                                <option value="check">Check</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-input"
                                rows="2"
                                value={paymentData.notes}
                                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                placeholder="Optional payment notes..."
                            />
                        </div>

                        <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-success">
                                <FiCheck /> Confirm Payment
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default Installments;
