import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications, browseJobs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

const statusMap = { pending: 'warning', shortlisted: 'info', hired: 'success', rejected: 'danger', reviewing: 'primary' };

const Overview = () => {
  const { profile } = useAuth();
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyApplications({ limit: 5 }),
      browseJobs({ limit: 6 }),
    ]).then(([appsData, jobsData]) => {
      setApps(appsData.data || []);
      setJobs(jobsData.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const total = apps.length;
  const pending = apps.filter(a => a.status === 'pending').length;
  const shortlisted = apps.filter(a => a.status === 'shortlisted').length;
  const hired = apps.filter(a => a.status === 'hired').length;

  return (
    <div className="page-content">
      <div className="page-hero">
        <h4 className="mb-1">Good day, {profile?.full_name?.split(' ')[0] || 'there'} 👋</h4>
        <p className="text-muted mb-0">Here's what's happening with your job search.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="bi-send-fill" label="Total Applied" value={total} color="primary" />
        <StatCard icon="bi-hourglass-split" label="Pending" value={pending} color="warning" />
        <StatCard icon="bi-star-fill" label="Shortlisted" value={shortlisted} color="info" />
        <StatCard icon="bi-trophy-fill" label="Hired" value={hired} color="success" />
      </div>

      <div className="section-header">
        <h5 className="section-title">Recent Applications</h5>
        <Link to="/dashboard/applications" className="btn btn-sm btn-outline-primary rounded-pill">View all</Link>
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-file-earmark-x fs-1 text-muted" />
          <p className="text-muted mt-2">No applications yet. Start applying!</p>
          <Link to="/dashboard/jobs" className="btn btn-primary rounded-pill px-4">Browse Jobs</Link>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.id}>
                    <td className="fw-medium">{app.title}</td>
                    <td className="text-muted">{app.company_name}</td>
                    <td>
                      <span className={'badge bg-' + (statusMap[app.status] || 'secondary') + '-subtle text-' + (statusMap[app.status] || 'secondary') + ' border'}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-muted small">{new Date(app.applied_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="section-header mt-4">
        <h5 className="section-title">Latest Job Openings</h5>
        <Link to="/dashboard/jobs" className="btn btn-sm btn-outline-primary rounded-pill">Browse all</Link>
      </div>
      <div className="jobs-grid">
        {jobs.map(job => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  );
};

export default Overview;