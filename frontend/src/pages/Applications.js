
import React, { useEffect, useState } from 'react';
import { getMyApplications } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../pages/Application.css';
const statusMap = {

  pending: { color: 'warning', icon: 'bi-hourglass-split', label: 'Pending' },
  reviewing: { color: 'primary', icon: 'bi-eye', label: 'Reviewing' },
  shortlisted: { color: 'info', icon: 'bi-star-fill', label: 'Shortlisted' },
  hired: { color: 'success', icon: 'bi-trophy-fill', label: 'Hired' },
  rejected: { color: 'danger', icon: 'bi-x-circle-fill', label: 'Rejected' },
};

const Applications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = { page, limit: 10 };
    if (filter) params.status = filter;
    getMyApplications(params).then(d => setApps(d.data || [])).finally(() => setLoading(false));
  }, [page, filter]);

  if (loading) return <LoadingSpinner text="Loading applications..." />;

  return (
    <div className="app-container">
      <div className="app-header">
        <div>
          <h2 className="header-title">My Applications</h2>
          <p className="header-subtitle">Track your status and next steps</p>
        </div>
        
        <div className="filter-pills">
          {['', 'pending', 'shortlisted', 'hired', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`filter-btn ${filter === s ? 'active' : ''}`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="empty-card">
          <i className="bi bi-file-earmark-x fs-1 text-muted" />
          <p className="text-muted mt-2">No applications found.</p>
        </div>
      ) : (
        <div className="apps-list">
          {apps.map(app => {
            const s = statusMap[app.status] || { color: 'secondary', icon: 'bi-circle', label: app.status };
            return (
              <div key={app.id} className="modern-card">
                <div className={`card-accent bg-${s.color}`}></div>
                
                <div className="card-body">
                  <div className="card-main-info">
                    <div className="company-logo-placeholder">{app.company_name?.charAt(0)}</div>
                    <div className="details">
                      <h4 className="job-title">{app.title}</h4>
                      <p className="company-name">{app.company_name}</p>
                      <div className="meta-tags">
                        {app.location && <span><i className="bi bi-geo-alt me-1" />{app.location}</span>}
                        {app.employment_type && <span><i className="bi bi-briefcase me-1" />{app.employment_type.replace('_', ' ')}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="card-status-info text-end">
                    
                    <span className={`badge rounded-pill text-bg-${s.color} px-3 py-2 mb-2`}>
                      <i className={`bi ${s.icon} me-1`} /> {s.label}
                    </span>
                    <div className="applied-date">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {app.rejection_reason && (
                  <div className="rejection-note">
                    <i className="bi bi-info-circle me-1" /> <strong>Feedback:</strong> {app.rejection_reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="pagination-footer">
        <button className="pagi-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          <i className="bi bi-chevron-left me-1" /> Prev
        </button>
        <span className="page-indicator">Page <strong>{page}</strong></span>
        <button className="pagi-btn" onClick={() => setPage(p => p + 1)} disabled={apps.length < 10}>
          Next <i className="bi bi-chevron-right ms-1" />
        </button>
      </div>
    </div>
  );
};

export default Applications;
