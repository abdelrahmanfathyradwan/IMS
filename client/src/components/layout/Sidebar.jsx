import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome,
    FiUsers,
    FiFileText,
    FiDollarSign,
    FiBarChart2,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiX
} from 'react-icons/fi';
import { useState } from 'react';

const menuItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/customers', icon: FiUsers, label: 'Customers' },
    { path: '/contracts', icon: FiFileText, label: 'Contracts' },
    { path: '/installments', icon: FiDollarSign, label: 'Installments' },
    { path: '/reports', icon: FiBarChart2, label: 'Reports' },
    { path: '/settings', icon: FiSettings, label: 'Settings', adminOnly: true },
];

function Sidebar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredMenu = menuItems.filter(item => !item.adminOnly || isAdmin);

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="sidebar-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">IMS</div>
                        <span className="logo-text">Installment MS</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {filteredMenu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setMobileOpen(false)}
                        >
                            <item.icon className="nav-icon" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.username}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut />
                    </button>
                </div>
            </aside>

            <style>{`
        .sidebar-toggle {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 1001;
          width: 40px;
          height: 40px;
          border-radius: var(--radius);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }

        .sidebar {
          width: 260px;
          height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          z-index: 999;
        }

        .sidebar-header {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          color: white;
        }

        .logo-text {
          font-weight: 600;
          font-size: 1.125rem;
          color: var(--text-primary);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 0.25rem;
          transition: var(--transition);
        }

        .nav-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--primary);
          color: white;
        }

        .nav-icon {
          font-size: 1.25rem;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: var(--primary);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .logout-btn {
          width: 36px;
          height: 36px;
          background: var(--bg-tertiary);
          border: none;
          border-radius: var(--radius);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .logout-btn:hover {
          background: var(--danger);
          color: white;
        }

        @media (max-width: 768px) {
          .sidebar-toggle {
            display: flex;
          }

          .sidebar-overlay {
            display: block;
          }

          .sidebar {
            position: fixed;
            left: -260px;
            transition: left 0.3s ease;
          }

          .sidebar.open {
            left: 0;
          }
        }
      `}</style>
        </>
    );
}

export default Sidebar;
