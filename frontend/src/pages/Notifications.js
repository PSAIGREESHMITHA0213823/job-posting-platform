import React, { useEffect, useState } from 'react';
import { getNotifications } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then(d => setNotifs(d.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  return (
    <div className="page-content">
      <div className="page-hero">
        <h4 className="mb-1">Notifications</h4>
        <p className="text-muted mb-0">{notifs.length} notification{notifs.length !== 1 ? 's' : ''}</p>
      </div>
      {notifs.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bell-slash fs-1 text-muted" />
          <p className="text-muted mt-2">No notifications yet.</p>
        </div>
      ) : (
        <div className="apps-list">
          {notifs.map(n => (
            <div key={n.id} className={'app-card ' + (n.is_read ? '' : 'unread')}>
              <div className="app-card-left">
                <div className="app-status-dot bg-primary">
                  <i className="bi bi-bell-fill text-white small" />
                </div>
                <div>
                  <div className="fw-semibold">{n.title}</div>
                  <div className="text-muted small mt-1">{n.message}</div>
                </div>
              </div>
              <div className="app-card-right">
                <div className="text-muted small">{new Date(n.created_at).toLocaleString()}</div>
                {!n.is_read && <span className="badge bg-primary rounded-pill mt-1">New</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;