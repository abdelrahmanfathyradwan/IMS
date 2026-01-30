import { useState, useEffect } from 'react';
import { reportsAPI, exportAPI, downloadBlob } from '../services/api';
import { FiDownload, FiFileText, FiUsers, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

function Reports() {
    const [activeTab, setActiveTab] = useState('summary');
    const [summary, setSummary] = useState(null);
    const [overdueReport, setOverdueReport] = useState(null);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [customersReport, setCustomersReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [activeTab]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'summary':
                    const summaryRes = await reportsAPI.getSummary();
                    setSummary(summaryRes.data.data);
                    break;
                case 'overdue':
                    const overdueRes = await reportsAPI.getOverdue();
                    setOverdueReport(overdueRes.data.data);
                    break;
                case 'monthly':
                    const monthlyRes = await reportsAPI.getMonthly({});
                    setMonthlyReport(monthlyRes.data.data);
                    break;
                case 'customers':
                    const customersRes = await reportsAPI.getCustomers();
                    setCustomersReport(customersRes.data.data);
                    break;
            }
        } catch (error) {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type, format) => {
        setExporting(true);
        try {
            let response;
            let filename;

            if (format === 'pdf') {
                switch (type) {
                    case 'installments':
                        response = await exportAPI.installmentsPDF();
                        filename = 'installments-report.pdf';
                        break;
                    case 'customers':
                        response = await exportAPI.customersPDF();
                        filename = 'customers-report.pdf';
                        break;
                    case 'overdue':
                        response = await exportAPI.overduePDF();
                        filename = 'overdue-report.pdf';
                        break;
                }
            } else {
                switch (type) {
                    case 'installments':
                        response = await exportAPI.installmentsExcel();
                        filename = 'installments-report.xlsx';
                        break;
                    case 'customers':
                        response = await exportAPI.customersExcel();
                        filename = 'customers-report.xlsx';
                        break;
                    case 'overdue':
                        response = await exportAPI.overdueExcel();
                        filename = 'overdue-report.xlsx';
                        break;
                }
            }

            downloadBlob(response.data, filename);
            toast.success(`${filename} downloaded!`);
        } catch (error) {
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const tabs = [
        { id: 'summary', label: 'Summary', icon: FiFileText },
        { id: 'overdue', label: 'Overdue', icon: FiAlertCircle },
        { id: 'monthly', label: 'Monthly', icon: FiCalendar },
        { id: 'customers', label: 'Customers', icon: FiUsers }
    ];

    return (
        <div className="reports-page">
            <div className="page-header">
                <h1 className="page-title">Reports</h1>
                <div className="page-actions">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            className="btn btn-primary"
                            disabled={exporting}
                            onClick={() => document.getElementById('export-menu').classList.toggle('show')}
                        >
                            <FiDownload /> Export
                        </button>
                        <div id="export-menu" className="export-menu">
                            <div className="export-group">
                                <span className="export-label">Installments</span>
                                <button onClick={() => handleExport('installments', 'pdf')}>PDF</button>
                                <button onClick={() => handleExport('installments', 'excel')}>Excel</button>
                            </div>
                            <div className="export-group">
                                <span className="export-label">Customers</span>
                                <button onClick={() => handleExport('customers', 'pdf')}>PDF</button>
                                <button onClick={() => handleExport('customers', 'excel')}>Excel</button>
                            </div>
                            <div className="export-group">
                                <span className="export-label">Overdue</span>
                                <button onClick={() => handleExport('overdue', 'pdf')}>PDF</button>
                                <button onClick={() => handleExport('overdue', 'excel')}>Excel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon /> {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <div className="report-content">
                    {/* Summary Tab */}
                    {activeTab === 'summary' && summary && (
                        <div>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon primary"><FiUsers /></div>
                                    <div className="stat-content">
                                        <h3>Customers</h3>
                                        <div className="value">{summary.customers?.total}</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon success"><FiFileText /></div>
                                    <div className="stat-content">
                                        <h3>Contracts</h3>
                                        <div className="value">{summary.contracts?.total}</div>
                                        <div className="subtext">{summary.contracts?.active} active</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon warning"><FiCalendar /></div>
                                    <div className="stat-content">
                                        <h3>Collection Rate</h3>
                                        <div className="value">{summary.financial?.collectionRate}%</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon danger"><FiAlertCircle /></div>
                                    <div className="stat-content">
                                        <h3>Overdue</h3>
                                        <div className="value">{summary.installments?.overdue}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ marginTop: '1.5rem' }}>
                                <h3 className="card-title">Installment Breakdown</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                                    <div className="breakdown-item">
                                        <span className="breakdown-value">{summary.installments?.total}</span>
                                        <span className="breakdown-label">Total</span>
                                    </div>
                                    <div className="breakdown-item success">
                                        <span className="breakdown-value">{summary.installments?.paid}</span>
                                        <span className="breakdown-label">Paid</span>
                                    </div>
                                    <div className="breakdown-item warning">
                                        <span className="breakdown-value">{summary.installments?.unpaid}</span>
                                        <span className="breakdown-label">Unpaid</span>
                                    </div>
                                    <div className="breakdown-item danger">
                                        <span className="breakdown-value">{summary.installments?.overdue}</span>
                                        <span className="breakdown-label">Overdue</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Overdue Tab */}
                    {activeTab === 'overdue' && overdueReport && (
                        <div>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon danger"><FiAlertCircle /></div>
                                    <div className="stat-content">
                                        <h3>Total Overdue</h3>
                                        <div className="value">${overdueReport.totalOverdueAmount?.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon warning"><FiFileText /></div>
                                    <div className="stat-content">
                                        <h3>Overdue Installments</h3>
                                        <div className="value">{overdueReport.totalOverdueCount}</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon primary"><FiUsers /></div>
                                    <div className="stat-content">
                                        <h3>Customers with Overdue</h3>
                                        <div className="value">{overdueReport.customersWithOverdue}</div>
                                    </div>
                                </div>
                            </div>

                            {overdueReport.byCustomer?.length > 0 && (
                                <div className="card" style={{ marginTop: '1.5rem' }}>
                                    <h3 className="card-title">By Customer</h3>
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Customer</th>
                                                    <th>Phone</th>
                                                    <th>Overdue Count</th>
                                                    <th>Total Overdue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {overdueReport.byCustomer.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.customer?.name}</td>
                                                        <td>{item.customer?.phone}</td>
                                                        <td><span className="badge badge-danger">{item.count}</span></td>
                                                        <td className="text-danger font-semibold">${item.totalOverdue?.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Monthly Tab */}
                    {activeTab === 'monthly' && monthlyReport && (
                        <div>
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Monthly Collection - {monthlyReport.year}</h3>
                                    <span className="font-semibold">
                                        Total: ${monthlyReport.totalYearlyCollection?.toLocaleString()}
                                    </span>
                                </div>
                                <div style={{ height: '400px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyReport.months}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="monthName" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#1e293b',
                                                    border: '1px solid #334155',
                                                    borderRadius: '8px',
                                                    color: '#f8fafc'
                                                }}
                                                formatter={(value) => [`$${value.toLocaleString()}`, 'Collected']}
                                            />
                                            <Bar dataKey="totalCollected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Customers Tab */}
                    {activeTab === 'customers' && customersReport.length > 0 && (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Contracts</th>
                                        <th>Total Value</th>
                                        <th>Installments</th>
                                        <th>Paid</th>
                                        <th>Pending</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customersReport.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div>
                                                    <strong>{item.customer.name}</strong>
                                                    <div className="text-xs text-muted">{item.customer.phone}</div>
                                                </div>
                                            </td>
                                            <td>{item.contracts}</td>
                                            <td>${item.totalValue?.toLocaleString()}</td>
                                            <td>
                                                <span className="badge badge-success">{item.installments.paid} paid</span>
                                                {item.installments.overdue > 0 && (
                                                    <span className="badge badge-danger" style={{ marginLeft: '0.25rem' }}>
                                                        {item.installments.overdue} overdue
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-success">${item.totalPaid?.toLocaleString()}</td>
                                            <td className="text-warning">${item.totalPending?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <style>{`
        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius);
          transition: var(--transition);
        }

        .tab:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .tab.active {
          background: var(--primary);
          color: white;
        }

        .export-menu {
          display: none;
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius);
          padding: 0.5rem;
          min-width: 200px;
          z-index: 100;
          margin-top: 0.5rem;
        }

        .export-menu.show {
          display: block;
        }

        .export-group {
          padding: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .export-group:last-child {
          border-bottom: none;
        }

        .export-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .export-group button {
          padding: 0.375rem 0.75rem;
          margin-right: 0.5rem;
          background: var(--bg-tertiary);
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          cursor: pointer;
          font-size: 0.8125rem;
        }

        .export-group button:hover {
          background: var(--primary);
        }

        .breakdown-item {
          text-align: center;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius);
        }

        .breakdown-item.success { border-left: 3px solid var(--success); }
        .breakdown-item.warning { border-left: 3px solid var(--warning); }
        .breakdown-item.danger { border-left: 3px solid var(--danger); }

        .breakdown-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .breakdown-label {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}

export default Reports;
