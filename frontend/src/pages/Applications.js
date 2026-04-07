import React, { useEffect, useState } from 'react';
import { getMyApplications } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const statusMap = {
  pending: { color: 'warning', icon: 'bi-hourglass-split' },
  reviewing: { color: 'primary', icon: 'bi-eye' },
  shortlisted: { color: 'info', icon: 'bi-star-fill' },
  hired: { color: 'success', icon: 'bi-trophy-fill' },
  rejected: { color: 'danger', icon: 'bi-x-circle-fill' },
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
    <div className="page-content">
      <div className="page-hero">
        <h4 className="mb-1">My Applications</h4>
        <p className="text-muted mb-0">Track your job application status</p>
      </div>

      <div className="d-flex gap-2 flex-wrap mb-4">
        {['', 'pending', 'reviewing', 'shortlisted', 'hired', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            className={'btn btn-sm rounded-pill ' + (filter === s ? 'btn-primary' : 'btn-outline-secondary')}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-file-earmark-x fs-1 text-muted" />
          <p className="text-muted mt-2">No applications found.</p>
        </div>
      ) : (
        <div className="apps-list">
          {apps.map(app => {
            const s = statusMap[app.status] || { color: 'secondary', icon: 'bi-circle' };
            return (
              <div key={app.id} className="app-card">
                <div className="app-card-left">
                  <div className={'app-status-dot bg-' + s.color}>
                    <i className={'bi ' + s.icon + ' text-white small'} />
                  </div>
                  <div>
                    <div className="fw-semibold">{app.title}</div>
                    <div className="text-muted small">{app.company_name}</div>
                    <div className="d-flex gap-2 mt-1 flex-wrap">
                      {app.location && <span className="text-muted small"><i className="bi bi-geo-alt me-1" />{app.location}</span>}
                      {app.employment_type && <span className="text-muted small"><i className="bi bi-briefcase me-1" />{app.employment_type.replace('_', ' ')}</span>}
                      {app.salary_min && <span className="text-muted small"><i className="bi bi-currency-dollar me-1" />{Number(app.salary_min).toLocaleString()}</span>}
                    </div>
                    {app.rejection_reason && (
                      <div className="alert alert-danger py-1 px-2 small mt-2 mb-0">
                        <i className="bi bi-info-circle me-1" />{app.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="app-card-right">
                  <span className={'badge bg-' + s.color + '-subtle text-' + s.color + ' border border-' + s.color + '-subtle px-3 py-2'}>
                    {app.status}
                  </span>
                  <div className="text-muted small mt-1">{new Date(app.applied_at).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pagination-wrap">
        <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          <i className="bi bi-chevron-left me-1" />Prev
        </button>
        <span className="text-muted small px-3">Page {page}</span>
        <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => setPage(p => p + 1)} disabled={apps.length < 10}>
          Next<i className="bi bi-chevron-right ms-1" />
        </button>
      </div>
    </div>
  );
};

export default Applications;