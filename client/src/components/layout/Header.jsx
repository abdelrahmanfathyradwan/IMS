import { useLocation } from 'react-router-dom';
import { FiBell, FiSearch, FiX, FiCheck } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const pageTitles = {
  '/': 'Dashboard',
  '/customers': 'Customers',
  '/contracts': 'Contracts',
  '/installments': 'Installments',
  '/reports': 'Reports',
  '/settings': 'Settings'
};

function Header() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  const title = pageTitles[location.pathname] || 'Dashboard';

  useEffect(() => {
    fetchNotifications();

    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter(n => n.status !== 'read').length);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleMarkAsRead = async (id, event) => {
    event.stopPropagation();
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, status: 'read' } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const deleteNotification = async (id, event) => {
    event.stopPropagation();
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter(n => n._id !== id));
      // Update unread count if we deleted an unread notification
      const notification = notifications.find(n => n._id === id);
      if (notification && notification.status !== 'read') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        <div className="header-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="notification-wrapper" ref={notificationRef}>
          <button
            className={`notification-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <span className="text-xs text-muted">{unreadCount} unread</span>
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div
                      key={notification._id}
                      className={`notification-item ${notification.status === 'read' ? 'read' : 'unread'}`}
                    >
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="notification-actions">
                        {notification.status !== 'read' && (
                          <button
                            className="action-btn check"
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            title="Mark as read"
                          >
                            <FiCheck />
                          </button>
                        )}
                        <button
                          className="action-btn delete"
                          onClick={(e) => deleteNotification(notification._id, e)}
                          title="Delete"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-notifications">
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .header {
          height: 64px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-search {
          position: relative;
          display: flex;
          align-items: center;
        }

        .header-search .search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-muted);
        }

        .header-search .form-input {
          padding-left: 2.5rem;
          width: 240px;
        }

        .notification-wrapper {
            position: relative;
        }

        .notification-btn {
          position: relative;
          width: 40px;
          height: 40px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          transition: var(--transition);
        }

        .notification-btn:hover, .notification-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          background: var(--danger);
          border-radius: 50%;
          font-size: 0.625rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .notification-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 0.5rem;
            width: 320px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            max-height: 400px;
            display: flex;
            flex-direction: column;
        }

        .notification-header {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .notification-header h3 {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .notification-list {
            overflow-y: auto;
            flex: 1;
        }

        .notification-item {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 0.75rem;
            transition: var(--transition);
        }

        .notification-item:last-child {
            border-bottom: none;
        }

        .notification-item:hover {
            background: var(--bg-tertiary);
        }

        .notification-item.unread {
            background: rgba(79, 70, 229, 0.05);
        }

        .notification-item.unread:hover {
            background: rgba(79, 70, 229, 0.1);
        }

        .notification-content {
            flex: 1;
        }

        .notification-message {
            font-size: 0.875rem;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .notification-time {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        .notification-actions {
            display: flex;
            gap: 0.25rem;
        }

        .action-btn {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-size: 0.875rem;
            transition: var(--transition);
        }

        .action-btn.check {
            background: rgba(34, 197, 94, 0.1);
            color: var(--success);
        }
        
        .action-btn.check:hover {
            background: var(--success);
            color: white;
        }

        .action-btn.delete {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
        }

        .action-btn.delete:hover {
            background: var(--danger);
            color: white;
        }

        .empty-notifications {
            padding: 2rem;
            text-align: center;
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .header {
            padding-left: 4rem;
          }

          .header-search {
            display: none;
          }

          .notification-dropdown {
            width: 280px;
            right: -50px;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;
