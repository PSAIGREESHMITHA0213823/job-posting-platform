// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { getMyApplications, browseJobs } from '../services/api';
// import { useAuth } from '../contexts/AuthContext';
// import StatCard from '../components/StatCard';
// import JobCard from '../components/JobCard';
// import LoadingSpinner from '../components/LoadingSpinner';

// const statusMap = { pending: 'warning', shortlisted: 'info', hired: 'success', rejected: 'danger', reviewing: 'primary' };

// const Overview = () => {
//   const { profile } = useAuth();
//   const [apps, setApps] = useState([]);
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     Promise.all([
//       getMyApplications({ limit: 5 }),
//       browseJobs({ limit: 6 }),
//     ]).then(([appsData, jobsData]) => {
//       setApps(appsData.data || []);
//       setJobs(jobsData.data || []);
//     }).finally(() => setLoading(false));
//   }, []);

//   if (loading) return <LoadingSpinner text="Loading dashboard..." />;

//   const total = apps.length;
//   const pending = apps.filter(a => a.status === 'pending').length;
//   const shortlisted = apps.filter(a => a.status === 'shortlisted').length;
//   const hired = apps.filter(a => a.status === 'hired').length;

//   return (
//     <div className="page-content">
//       <div className="page-hero">
//         <h4 className="mb-1">Good day, {profile?.full_name?.split(' ')[0] || 'there'} 👋</h4>
//         <p className="text-muted mb-0">Here's what's happening with your job search.</p>
//       </div>

//       <div className="stats-grid">
//         <StatCard icon="bi-send-fill" label="Total Applied" value={total} color="primary" />
//         <StatCard icon="bi-hourglass-split" label="Pending" value={pending} color="warning" />
//         <StatCard icon="bi-star-fill" label="Shortlisted" value={shortlisted} color="info" />
//         <StatCard icon="bi-trophy-fill" label="Hired" value={hired} color="success" />
//       </div>

//       <div className="section-header">
//         <h5 className="section-title">Recent Applications</h5>
//         <Link to="/dashboard/applications" className="btn btn-sm btn-outline-primary rounded-pill">View all</Link>
//       </div>

//       {apps.length === 0 ? (
//         <div className="empty-state">
//           <i className="bi bi-file-earmark-x fs-1 text-muted" />
//           <p className="text-muted mt-2">No applications yet. Start applying!</p>
//           <Link to="/dashboard/jobs" className="btn btn-primary rounded-pill px-4">Browse Jobs</Link>
//         </div>
//       ) : (
//         <div className="table-card">
//           <div className="table-responsive">
//             <table className="table table-hover align-middle mb-0">
//               <thead>
//                 <tr>
//                   <th>Job</th>
//                   <th>Company</th>
//                   <th>Status</th>
//                   <th>Applied</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {apps.map(app => (
//                   <tr key={app.id}>
//                     <td className="fw-medium">{app.title}</td>
//                     <td className="text-muted">{app.company_name}</td>
//                     <td>
//                       <span className={'badge bg-' + (statusMap[app.status] || 'secondary') + '-subtle text-' + (statusMap[app.status] || 'secondary') + ' border'}>
//                         {app.status}
//                       </span>
//                     </td>
//                     <td className="text-muted small">{new Date(app.applied_at).toLocaleDateString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       <div className="section-header mt-4">
//         <h5 className="section-title">Latest Job Openings</h5>
//         <Link to="/dashboard/jobs" className="btn btn-sm btn-outline-primary rounded-pill">Browse all</Link>
//       </div>
//       <div className="jobs-grid">
//         {jobs.map(job => <JobCard key={job.id} job={job} />)}
//       </div>
//     </div>
//   );
// };

// export default Overview;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications, browseJobs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

const statusMap = {
  pending: 'warning',
  shortlisted: 'info',
  hired: 'success',
  rejected: 'danger',
  reviewing: 'primary',
};

const statusColors = {
  pending: '#f59e0b',
  shortlisted: '#06b6d4',
  hired: '#10b981',
  rejected: '#ef4444',
  reviewing: '#6366f1',
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};



const Overview = () => {
  const { profile } = useAuth();
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateStats, setAnimateStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    Promise.all([
      getMyApplications({ limit: 10 }),
      browseJobs({ limit: 6 }),
    ])
      .then(([appsData, jobsData]) => {
        setApps(appsData.data || []);
        setJobs(jobsData.data || []);
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => setAnimateStats(true), 100);
      });
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const avatarSrc = profile?.avatar_url
    ? `http://localhost:5000${profile.avatar_url}`
    : null;
  const initials =
    profile?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const theme = {
    bg: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    textMain: '#1e293b',
    textMuted: '#64748b',
    accent: '#6366f1',
  };

  const statusCounts = apps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const filteredApps = apps.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const recentActivity = apps
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      text: `Applied to ${a.title} at ${a.company_name}`,
      status: a.status,
      date: a.applied_at || a.created_at,
    }));

  const quickActions = [
    { label: 'Browse Jobs', icon: 'bi-briefcase', to: '/dashboard/jobs', color: '#6366f1' },
    { label: 'Upload Resume', icon: 'bi-file-earmark-arrow-up', to: '/dashboard/profile', color: '#06b6d4' },
    { label: 'Edit Profile', icon: 'bi-person-gear', to: '/dashboard/profile', color: '#10b981' },
    { label: 'My Applications', icon: 'bi-list-check', to: '/dashboard/applications', color: '#f59e0b' },
  ];

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '24px', color: theme.textMain }}>

      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '24px', zIndex: 9999,
          background: '#1e293b', color: '#fff', padding: '12px 20px',
          borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease',
        }}>
          <i className="bi bi-check-circle me-2" style={{ color: '#10b981' }}></i>
          {notification}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: '600', marginBottom: '2px' }}>
            {getGreeting()},
          </div>
          <h3 style={{ fontWeight: '800', margin: 0, color: theme.textMain, letterSpacing: '-0.5px' }}>
            {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h3>
        </div>

        <div style={{
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          padding: '6px 12px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div className="text-end d-none d-sm-block">
            <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{profile?.full_name}</div>
            <Link to="/dashboard/profile" style={{ fontSize: '0.75rem', color: theme.accent, textDecoration: 'none', fontWeight: '600' }}>
              Edit Profile
            </Link>
          </div>
          {avatarSrc ? (
            <img src={avatarSrc} alt="User" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${theme.accent}` }} />
          ) : (
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: theme.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {initials}
            </div>
          )}
        </div>
      </div>


      <div className="row g-3 mb-4">
        {[
          { label: 'Total Applied', value: apps.length, icon: 'bi-send', color: '#6366f1' },
          { label: 'Shortlisted', value: apps.filter((a) => a.status === 'shortlisted').length, icon: 'bi-star', color: '#06b6d4' },
          { label: 'Hired', value: apps.filter((a) => a.status === 'hired').length, icon: 'bi-trophy', color: '#10b981' },
          { label: 'Reviewing', value: apps.filter((a) => a.status === 'reviewing').length, icon: 'bi-eye', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="col-6 col-md-3">
            <div style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              transform: animateStats ? 'translateY(0)' : 'translateY(12px)',
              opacity: animateStats ? 1 : 0,
              transition: `all 0.4s ease ${i * 0.08}s`,
            }} className="d-flex align-items-center gap-3">
              <div style={{ color: s.color, backgroundColor: `${s.color}15`, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                <i className={`bi ${s.icon}`}></i>
              </div>
              <div>
                <div style={{ color: theme.textMuted, fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                <h3 style={{ margin: 0, fontWeight: '800', color: theme.textMain }}>{s.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">

        <div className="col-md-6">
          <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px', height: '100%' }}>
            <h6 style={{ fontWeight: '700', marginBottom: '16px', color: theme.textMain }}>Application Status Breakdown</h6>
            {apps.length === 0 ? (
              <div style={{ color: theme.textMuted, fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No applications yet</div>
            ) : (
              Object.entries(statusCounts).map(([status, count]) => {
                const pct = Math.round((count / apps.length) * 100);
                return (
                  <div key={status} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize', color: theme.textMain }}>{status}</span>
                      <span style={{ fontSize: '0.8rem', color: theme.textMuted }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ background: theme.border, borderRadius: '99px', height: '7px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: statusColors[status] || theme.accent,
                        borderRadius: '99px',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px', height: '100%' }}>
            <h6 style={{ fontWeight: '700', marginBottom: '16px', color: theme.textMain }}>Quick Actions</h6>
            <div className="row g-2">
              {quickActions.map((action, i) => (
                <div key={i} className="col-6">
                  <Link to={action.to} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: `${action.color}08`,
                      border: `1px solid ${action.color}25`,
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${action.color}15`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = `${action.color}08`; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ color: action.color, fontSize: '1.2rem' }}>
                        <i className={`bi ${action.icon}`}></i>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: theme.textMain }}>{action.label}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} className="mb-4">
        <div className="p-3 border-bottom">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold" style={{ color: theme.textMain }}>Recent Applications</h5>
            <Link to="/dashboard/applications" className="btn btn-sm px-3" style={{ color: theme.accent, background: `${theme.accent}10`, fontWeight: '600', borderRadius: '8px' }}>
              View all
            </Link>
          </div>
      
          <div className="d-flex gap-2 flex-wrap">
            <div style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
              <i className="bi bi-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '0.85rem' }}></i>
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', paddingLeft: '32px', paddingRight: '12px',
                  height: '36px', borderRadius: '8px', border: `1px solid ${theme.border}`,
                  fontSize: '0.82rem', outline: 'none', color: theme.textMain,
                  background: theme.surface,
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                height: '36px', borderRadius: '8px', border: `1px solid ${theme.border}`,
                fontSize: '0.82rem', padding: '0 12px', background: theme.surface,
                color: theme.textMain, cursor: 'pointer',
              }}
            >
              <option value="all">All Statuses</option>
              {Object.keys(statusColors).map((s) => (
                <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead style={{ backgroundColor: theme.surface }}>
              <tr>
                <th className="py-3 px-4 border-0" style={{ fontSize: '0.7rem', color: theme.textMuted, fontWeight: '700' }}>JOB ROLE</th>
                <th className="py-3 border-0" style={{ fontSize: '0.7rem', color: theme.textMuted, fontWeight: '700' }}>COMPANY</th>
                <th className="py-3 border-0" style={{ fontSize: '0.7rem', color: theme.textMuted, fontWeight: '700' }}>STATUS</th>
                <th className="py-3 border-0" style={{ fontSize: '0.7rem', color: theme.textMuted, fontWeight: '700' }}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    {apps.length === 0 ? 'No applications yet' : 'No results match your search.'}
                  </td>
                </tr>
              ) : (
                filteredApps.slice(0, 5).map((app) => (
                  <tr key={app.id}>
                    <td className="py-3 px-4 fw-bold" style={{ color: theme.textMain }}>{app.title}</td>
                    <td className="py-3" style={{ color: theme.textMuted }}>{app.company_name}</td>
                    <td className="py-3">
                      <span
                        className={`badge rounded-pill bg-${statusMap[app.status]} bg-opacity-10 text-${statusMap[app.status]}`}
                        style={{ padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColors[app.status] || '#888', display: 'inline-block' }}></span>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3" style={{ color: theme.textMuted, fontSize: '0.8rem' }}>
                      {app.applied_at || app.created_at
                        ? new Date(app.applied_at || app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row g-4 mb-4">

        <div className="col-md-4">
          <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px', height: '100%' }}>
            <h6 style={{ fontWeight: '700', marginBottom: '16px', color: theme.textMain }}>Recent Activity</h6>
            {recentActivity.length === 0 ? (
              <div style={{ color: theme.textMuted, fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No activity yet</div>
            ) : (
              <div style={{ position: 'relative' }}>
                {recentActivity.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: i < recentActivity.length - 1 ? '16px' : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColors[item.status] || theme.accent, flexShrink: 0, marginTop: '3px' }}></div>
                      {i < recentActivity.length - 1 && (
                        <div style={{ width: '2px', flex: 1, background: theme.border, marginTop: '4px' }}></div>
                      )}
                    </div>
                    <div style={{ paddingBottom: i < recentActivity.length - 1 ? '4px' : 0 }}>
                      <div style={{ fontSize: '0.8rem', color: theme.textMain, fontWeight: '600', lineHeight: 1.3 }}>{item.text}</div>
                      {item.date && (
                        <div style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: '2px' }}>
                          {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold" style={{ color: theme.textMain }}>Latest Job Openings</h5>
            <Link to="/dashboard/jobs" className="btn btn-sm px-3" style={{ color: '#475569', background: '#f1f5f9', fontWeight: '600', borderRadius: '8px' }}>
              Browse more
            </Link>
          </div>
          <div className="row g-3">
            {jobs.map((job) => (
              <div key={job.id} className="col-md-6">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .table-hover tbody tr:hover { background-color: #f8fafc; }
        input:focus { box-shadow: 0 0 0 3px #6366f120; border-color: #6366f1 !important; }
        select:focus { outline: none; box-shadow: 0 0 0 3px #6366f120; border-color: #6366f1 !important; }
      `}</style>
    </div>
  );
};

export default Overview;