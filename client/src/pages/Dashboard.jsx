import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI, installmentsAPI } from '../services/api';
import { FiUsers, FiFileText, FiDollarSign, FiAlertCircle, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [summaryRes, upcomingRes] = await Promise.all([
                reportsAPI.getSummary(),
                installmentsAPI.getUpcoming()
            ]);
            setSummary(summaryRes.data.data);
            setUpcoming(upcomingRes.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const installmentChartData = [
        { name: 'Paid', value: summary?.installments?.paid || 0, color: '#22c55e' },
        { name: 'Unpaid', value: summary?.installments?.unpaid || 0, color: '#3b82f6' },
        { name: 'Overdue', value: summary?.installments?.overdue || 0, color: '#ef4444' }
    ];

    return (
        <div className="dashboard">
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <FiUsers />
                    </div>
                    <div className="stat-content">
                        <h3>Total Customers</h3>
                        <div className="value">{summary?.customers?.total || 0}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <FiFileText />
                    </div>
                    <div className="stat-content">
                        <h3>Active Contracts</h3>
                        <div className="value">{summary?.contracts?.active || 0}</div>
                        <div className="subtext">{summary?.contracts?.total || 0} total</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <FiDollarSign />
                    </div>
                    <div className="stat-content">
                        <h3>Total Collected</h3>
                        <div className="value">${(summary?.financial?.totalCollected || 0).toLocaleString()}</div>
                        <div className="subtext">{summary?.financial?.collectionRate || 0}% rate</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon danger">
                        <FiAlertCircle />
                    </div>
                    <div className="stat-content">
                        <h3>Overdue</h3>
                        <div className="value">{summary?.installments?.overdue || 0}</div>
                        <div className="subtext">installments</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="dashboard-grid">
                <div className="card chart-card">
                    <div className="card-header">
                        <h3 className="card-title">Installment Status</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={installmentChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {installmentChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f8fafc'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-legend">
                            {installmentChartData.map((item) => (
                                <div key={item.name} className="legend-item">
                                    <span className="legend-color" style={{ background: item.color }}></span>
                                    <span>{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Financial Summary</h3>
                    </div>
                    <div className="financial-summary">
                        <div className="summary-item">
                            <FiTrendingUp className="summary-icon success" />
                            <div>
                                <span className="summary-label">Total Contract Value</span>
                                <span className="summary-value">${(summary?.financial?.totalContractValue || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="summary-item">
                            <FiDollarSign className="summary-icon primary" />
                            <div>
                                <span className="summary-label">Down Payments</span>
                                <span className="summary-value">${(summary?.financial?.totalDownPayments || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="summary-item">
                            <FiCalendar className="summary-icon warning" />
                            <div>
                                <span className="summary-label">Pending Collection</span>
                                <span className="summary-value">${(summary?.financial?.totalPending || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Installments */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Upcoming Installments (Next 7 Days)</h3>
                    <Link to="/installments" className="btn btn-sm btn-outline">View All</Link>
                </div>
                {upcoming.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Contract</th>
                                    <th>Installment #</th>
                                    <th>Amount</th>
                                    <th>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcoming.slice(0, 5).map((installment) => (
                                    <tr key={installment._id}>
                                        <td>{installment.contractId?.customerId?.name || 'N/A'}</td>
                                        <td>{installment.contractId?.contractNumber || 'N/A'}</td>
                                        <td>#{installment.installmentNumber}</td>
                                        <td>${installment.amount?.toFixed(2)}</td>
                                        <td>{new Date(installment.dueDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <FiCalendar className="empty-state-icon" />
                        <p className="empty-state-title">No Upcoming Installments</p>
                        <p className="empty-state-text">No installments due in the next 7 days</p>
                    </div>
                )}
            </div>

            <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .chart-card {
          min-height: 350px;
        }

        .chart-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .chart-legend {
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .financial-summary {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius);
        }

        .summary-icon {
          font-size: 1.5rem;
        }

        .summary-icon.success { color: var(--success); }
        .summary-icon.primary { color: var(--primary); }
        .summary-icon.warning { color: var(--warning); }

        .summary-item > div {
          display: flex;
          flex-direction: column;
        }

        .summary-label {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .summary-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}

export default Dashboard;
