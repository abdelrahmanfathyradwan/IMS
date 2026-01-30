import { useState, useEffect } from 'react';
import { settingsAPI, authAPI } from '../services/api';
import { FiSave, FiRefreshCw, FiUsers, FiSettings as FiSettingsIcon } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';

function Settings() {
    const [settings, setSettings] = useState({});
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [showUserModal, setShowUserModal] = useState(false);
    const [userForm, setUserForm] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });
    const { isAdmin } = useAuth();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'general') {
                const response = await settingsAPI.getAll();
                setSettings(response.data.data);
            } else if (activeTab === 'users') {
                const response = await authAPI.getUsers();
                setUsers(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await settingsAPI.update(settings);
            toast.success('Settings saved!');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleResetSettings = async () => {
        if (!window.confirm('Reset all settings to defaults?')) return;
        try {
            const response = await settingsAPI.reset();
            setSettings(response.data.data);
            toast.success('Settings reset to defaults');
        } catch (error) {
            toast.error('Failed to reset settings');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await authAPI.register(userForm);
            toast.success('User created!');
            setShowUserModal(false);
            setUserForm({ username: '', email: '', password: '', role: 'user' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleToggleUserStatus = async (user) => {
        try {
            await authAPI.updateUser(user._id, { isActive: !user.isActive });
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await authAPI.deleteUser(id);
            toast.success('User deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
            </div>

            <div className="settings-layout">
                <div className="settings-sidebar">
                    <button
                        className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <FiSettingsIcon /> General Settings
                    </button>
                    {isAdmin && (
                        <button
                            className={`settings-tab ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <FiUsers /> User Management
                        </button>
                    )}
                </div>

                <div className="settings-content">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <>
                            {/* General Settings */}
                            {activeTab === 'general' && (
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">General Settings</h3>
                                        <div className="flex gap-2">
                                            <button className="btn btn-secondary" onClick={handleResetSettings}>
                                                <FiRefreshCw /> Reset
                                            </button>
                                            <button className="btn btn-primary" onClick={handleSaveSettings} disabled={saving}>
                                                <FiSave /> {saving ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label className="form-label">Company Name</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={settings.companyName || ''}
                                                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group">
                                                <label className="form-label">Currency</label>
                                                <select
                                                    className="form-select"
                                                    value={settings.currency || 'USD'}
                                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                                >
                                                    <option value="USD">USD - US Dollar</option>
                                                    <option value="EUR">EUR - Euro</option>
                                                    <option value="GBP">GBP - British Pound</option>
                                                    <option value="SAR">SAR - Saudi Riyal</option>
                                                    <option value="AED">AED - UAE Dirham</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Currency Symbol</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={settings.currencySymbol || '$'}
                                                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                                                    maxLength={3}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Reminder Days Before Due</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={settings.reminderDaysBefore || 7}
                                                onChange={(e) => setSettings({ ...settings, reminderDaysBefore: parseInt(e.target.value) })}
                                                min="1"
                                                max="30"
                                            />
                                            <span className="text-xs text-muted">Days before due date to send reminder</span>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Default Payment Method</label>
                                            <select
                                                className="form-select"
                                                value={settings.defaultPaymentMethod || 'cash'}
                                                onChange={(e) => setSettings({ ...settings, defaultPaymentMethod: e.target.value })}
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="card">Card</option>
                                                <option value="check">Check</option>
                                            </select>
                                        </div>

                                        <div className="settings-toggles">
                                            <label className="toggle-item">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.enableEmailNotifications || false}
                                                    onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                                                />
                                                <span>Enable Email Notifications</span>
                                            </label>

                                            <label className="toggle-item">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.enableWhatsAppNotifications || false}
                                                    onChange={(e) => setSettings({ ...settings, enableWhatsAppNotifications: e.target.checked })}
                                                />
                                                <span>Enable WhatsApp Notifications</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Management */}
                            {activeTab === 'users' && (
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">User Management</h3>
                                        <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>
                                            Add User
                                        </button>
                                    </div>

                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Username</th>
                                                    <th>Email</th>
                                                    <th>Role</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user) => (
                                                    <tr key={user._id}>
                                                        <td>{user.username}</td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <span className={`badge ${user.role === 'admin' ? 'badge-danger' :
                                                                    user.role === 'manager' ? 'badge-warning' : 'badge-info'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${user.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                                                {user.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className={`btn btn-sm ${user.isActive ? 'btn-secondary' : 'btn-success'}`}
                                                                    onClick={() => handleToggleUserStatus(user)}
                                                                >
                                                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDeleteUser(user._id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {showUserModal && (
                <Modal title="Create User" onClose={() => setShowUserModal(false)}>
                    <form onSubmit={handleCreateUser}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-input"
                                value={userForm.username}
                                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={userForm.email}
                                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={userForm.password}
                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select
                                className="form-select"
                                value={userForm.role}
                                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                            >
                                <option value="user">User</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">Create User</button>
                        </div>
                    </form>
                </Modal>
            )}

            <style>{`
        .settings-layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 1.5rem;
        }

        .settings-sidebar {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .settings-tab {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius);
          color: var(--text-secondary);
          cursor: pointer;
          text-align: left;
          transition: var(--transition);
        }

        .settings-tab:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .settings-tab.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .settings-toggles {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .toggle-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .toggle-item input {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
        }

        @media (max-width: 768px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            flex-direction: row;
            overflow-x: auto;
          }
        }
      `}</style>
        </div>
    );
}

export default Settings;
