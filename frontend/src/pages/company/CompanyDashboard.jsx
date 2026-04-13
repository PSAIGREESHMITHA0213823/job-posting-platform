
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const getAuthHeaders = () => {
//   const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// const StatCard = ({ label, value, sub, color, icon }) => (
//   <div style={{
//     background: '#fff', borderRadius: 12, padding: '20px 24px',
//     boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`,
//     display: 'flex', flexDirection: 'column', gap: 8,
//   }}>
//     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//       <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</span>
//       <span style={{ fontSize: 20 }}>{icon}</span>
//     </div>
//     <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1f36' }}>{value ?? '—'}</div>
//     {sub && <div style={{ fontSize: 12, color: '#9ca3af' }}>{sub}</div>}
//   </div>
// );

// const Chip = ({ icon, text }) => text ? (
//   <span style={{
//     display: 'inline-flex', alignItems: 'center', gap: 5,
//     background: '#f3f4f6', borderRadius: 20, padding: '4px 12px',
//     fontSize: 13, color: '#374151',
//   }}>
//     <span>{icon}</span>{text}
//   </span>
// ) : null;

// const statusStyle = (s) => ({
//   padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
//   background: s === 'active' ? '#d1fae5' : s === 'draft' ? '#fef3c7' : '#fee2e2',
//   color: s === 'active' ? '#065f46' : s === 'draft' ? '#92400e' : '#991b1b',
// });
// const CompanyDashboard = () => {
//   const [dashboard, setDashboard] = useState(null);
//   const [profile, setProfile]     = useState(null);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState('');

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const headers = getAuthHeaders();
//         const [dashRes, profRes] = await Promise.all([
//           axios.get(`${API}/company/dashboard`, { headers }),
//           axios.get(`${API}/company/profile`,   { headers }),
//         ]);
//         setDashboard(dashRes.data.data);
//         setProfile(profRes.data.data || profRes.data);
//       } catch (err) {
//         console.error('Dashboard load error:', err.response || err);
//         setError(err.response?.data?.message || 'Failed to load dashboard');
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   if (loading) return (
//     <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
//       Loading dashboard…
//     </div>
//   );

//   if (error) return (
//     <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>{error}</div>
//   );

//   const { jobs, applications, views, recent_jobs } = dashboard || {};

//   return (
//     <div>
//       {profile && (
//         <div style={{
//           background: '#fff', borderRadius: 14, padding: 24,
//           boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24,
//           display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
//         }}>
//           <div style={{
//             width: 72, height: 72, borderRadius: 12, flexShrink: 0,
//             border: '2px solid #e5e7eb', overflow: 'hidden',
//             background: '#f9fafb', display: 'flex',
//             alignItems: 'center', justifyContent: 'center',
//           }}>
//             {profile.logo_url
//               ? <img
//                   src={profile.logo_url.startsWith('http')
//                     ? profile.logo_url
//                     : `http://localhost:5000${profile.logo_url}`}
//                   alt="logo"
//                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                 />
//               : <span style={{ fontSize: 28 }}>🏢</span>}
//           </div>

//           {/* Company info */}
//           <div style={{ flex: 1, minWidth: 220 }}>
//             <div style={{
//               display: 'flex', alignItems: 'center', gap: 10,
//               marginBottom: 6, flexWrap: 'wrap',
//             }}>
//               <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1f36', margin: 0 }}>
//                 {profile.name || 'Your Company'}
//               </h2>
//               {profile.industry && (
//                 <span style={{
//                   background: '#ede9fe', color: '#5b21b6', fontSize: 11,
//                   fontWeight: 700, padding: '2px 10px', borderRadius: 20,
//                   textTransform: 'uppercase', letterSpacing: 0.5,
//                 }}>
//                   {profile.industry}
//                 </span>
//               )}
//             </div>

//             {profile.description && (
//               <p style={{
//                 fontSize: 13, color: '#6b7280', marginBottom: 12,
//                 lineHeight: 1.6, maxWidth: 600,
//                 display: '-webkit-box', WebkitLineClamp: 2,
//                 WebkitBoxOrient: 'vertical', overflow: 'hidden',
//               }}>
//                 {profile.description}
//               </p>
//             )}

//             <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//               <Chip icon="👥" text={profile.company_size ? `${profile.company_size} employees` : null} />
//               <Chip icon="📍" text={[profile.city, profile.country].filter(Boolean).join(', ') || null} />
//               <Chip icon="🌐" text={profile.website || null} />
//               <Chip icon="🏠" text={profile.address || null} />
//             </div>
//           </div>
//           <div style={{
//             display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap',
//           }}>
//             <div style={{
//               background: '#f0fdf4', border: '1px solid #bbf7d0',
//               borderRadius: 10, padding: '10px 18px', textAlign: 'center', minWidth: 80,
//             }}>
//               <div style={{ fontSize: 24, fontWeight: 800, color: '#065f46' }}>
//                 {jobs?.active ?? 0}
//               </div>
//               <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Active Jobs</div>
//             </div>
//             <div style={{
//               background: '#eff6ff', border: '1px solid #bfdbfe',
//               borderRadius: 10, padding: '10px 18px', textAlign: 'center', minWidth: 80,
//             }}>
//               <div style={{ fontSize: 24, fontWeight: 800, color: '#1d4ed8' }}>
//                 {applications?.total ?? 0}
//               </div>
//               <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Applications</div>
//             </div>
//             <div style={{
//               background: '#fdf4ff', border: '1px solid #e9d5ff',
//               borderRadius: 10, padding: '10px 18px', textAlign: 'center', minWidth: 80,
//             }}>
//               <div style={{ fontSize: 24, fontWeight: 800, color: '#7e22ce' }}>
//                 {applications?.hired ?? 0}
//               </div>
//               <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Hired</div>
//             </div>
//           </div>
//         </div>
//       )}
//       <div style={{ marginBottom: 20 }}>
//         <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1f36', margin: 0 }}>
//           Hiring Overview
//         </h3>
//         <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
//           Overview of your company's hiring activity
//         </p>
//       </div>
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
//         gap: 16, marginBottom: 28,
//       }}>
//         <StatCard
//           label="Total Jobs"
//           value={jobs?.total}
//           sub={`${jobs?.active ?? 0} active · ${jobs?.closed ?? 0} closed`}
//           color="#4f6ef7" icon="💼"
//         />
//         <StatCard
//           label="Total Applications"
//           value={applications?.total}
//           sub={`${applications?.pending ?? 0} pending`}
//           color="#10b981" icon="📋"
//         />
//         <StatCard
//           label="Shortlisted"
//           value={applications?.shortlisted}
//           color="#f59e0b" icon="⭐"
//         />
//         <StatCard
//           label="Hired"
//           value={applications?.hired}
//           color="#8b5cf6" icon="🎉"
//         />
//       </div>
//       <div style={{
//         background: '#fff', borderRadius: 12,
//         boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden',
//       }}>
//         <div style={{
//           padding: '16px 24px', borderBottom: '1px solid #f3f4f6',
//           fontWeight: 700, color: '#1a1f36', fontSize: 15,
//         }}>
//           Recent Job Postings
//         </div>

//         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr style={{ background: '#f9fafb' }}>
//               {['Title', 'Status', 'Applications',  'Posted'].map(h => (
//                 <th key={h} style={{
//                   padding: '10px 16px', textAlign: 'left',
//                   fontSize: 11, color: '#6b7280', fontWeight: 700,
//                   textTransform: 'uppercase', letterSpacing: 0.6,
//                 }}>
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {(recent_jobs || []).map((job, i) => (
//               <tr
//                 key={i}
//                 style={{ borderTop: '1px solid #f3f4f6', cursor: 'default' }}
//                 onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
//                 onMouseLeave={e => e.currentTarget.style.background = ''}
//               >
//                 <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a1f36' }}>
//                   {job.title}
//                 </td>
//                 <td style={{ padding: '12px 16px' }}>
//                   <span style={statusStyle(job.status)}>{job.status}</span>
//                 </td>
//                 <td style={{ padding: '12px 16px', color: '#374151' }}>
//                   {job.applications}
//                 </td>
//                 <td style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>
//                   {new Date(job.created_at).toLocaleDateString('en-US', {
//                     month: 'short', day: 'numeric', year: 'numeric',
//                   })}
//                 </td>
//               </tr>
//             ))}
//             {!recent_jobs?.length && (
//               <tr>
//                 <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
//                   No jobs posted yet
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// };

// export default CompanyDashboard;
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const icons = {
  jobs: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="5" width="12" height="9" rx="1.5" stroke="#185FA5" strokeWidth="1.4" />
      <path d="M5 5V4a3 3 0 016 0v1" stroke="#185FA5" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  apps: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="#3B6D11" strokeWidth="1.4" />
      <path d="M5 6h6M5 9h4" stroke="#3B6D11" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 2l1.6 3.3 3.6.5-2.6 2.5.6 3.6L8 10.3l-3.2 1.6.6-3.6L2.8 5.8l3.6-.5z" stroke="#854F0B" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  person: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="2.5" stroke="#534AB7" strokeWidth="1.4" />
      <path d="M3 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#534AB7" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  eye: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="8" rx="6" ry="4" stroke="#0F6E56" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2" stroke="#0F6E56" strokeWidth="1.4" />
    </svg>
  ),
};

const StatCard = ({ label, value, sub, iconBg, icon }) => {
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 12,
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 500, color: '#111827', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>}
    </div>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    active: { background: '#EAF3DE', color: '#3B6D11' },
    draft:  { background: '#FAEEDA', color: '#854F0B' },
    closed: { background: '#FCEBEB', color: '#A32D2D' },
  };
  const s = styles[status] || styles.closed;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 9px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 500,
      ...s,
    }}>
      {status}
    </span>
  );
};

const MiniBar = ({ value }) => (
  <div style={{ display: 'flex', alignItems: 'center',justifyItems:'center' }}>
    <span style={{ fontSize: 13, color: '#111827', minWidth: 24 }}>{value}</span>
  </div>
);

const CompanyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/company/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: 20, margin: '1rem 0',
        background: '#FCEBEB', border: '0.5px solid #F09595',
        borderRadius: 10, color: '#A32D2D', fontSize: 14,
      }}>
        {error}
      </div>
    );
  }

  const { jobs, applications, views, recent_jobs } = data || {};
  const maxViews = Math.max(...(recent_jobs || []).map(j => j.views), 1);
  const maxApps  = Math.max(...(recent_jobs || []).map(j => j.applications), 1);
  const shortPct = applications?.total
    ? Math.round((applications.shortlisted / applications.total) * 100)
    : 0;

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, color: '#111827', margin: 0 }}>Dashboard</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          Overview of your company's hiring activity
        </p>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10,
        marginBottom: '1.5rem',
      }}>
        <StatCard
          label="Total jobs"
          value={jobs?.total}
          sub={`${jobs?.active ?? '—'} active · ${jobs?.closed ?? '—'} closed`}
          iconBg="#E6F1FB"
          icon={icons.jobs}
          accentColor="#85B7EB"
        />
        <StatCard
          label="Applications"
          value={applications?.total}
          sub={`${applications?.pending ?? '—'} pending`}
          iconBg="#EAF3DE"
          icon={icons.apps}
          accentColor="#97C459"
        />
        <StatCard
          label="Shortlisted"
          value={applications?.shortlisted}
          sub={`${shortPct}% of total applicants`}
          iconBg="#FAEEDA"
          icon={icons.star}
          accentColor="#EF9F27"
        />
        <StatCard
          label="Hired"
          value={applications?.hired}
          sub={`${applications?.hired ?? '—'} successful placements`}
          iconBg="#EEEDFE"
          icon={icons.person}
          accentColor="#AFA9EC"
        />
        <StatCard
          label="Profile views"
          value={views?.total_views}
          sub="total impressions"
          iconBg="#E1F5EE"
          icon={icons.eye}
          accentColor="#5DCAA5"
        />
      </div>

      <div style={{
        background: '#fff',
        border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 16px',
          borderBottom: '0.5px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
            Recent job postings
          </span>
          <span style={{
            fontSize: 11, fontWeight: 500,
            background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)',
            color: '#6b7280', padding: '2px 8px', borderRadius: 20,
          }}>
            {(recent_jobs || []).length} jobs
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Title', 'Status', 'Applications', 'Views', 'Posted'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#6b7280',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recent_jobs || []).map((job, i) => (
                <tr
                  key={i}
                  style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 500, color: '#111827' }}>
                    {job.title}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <StatusPill status={job.status} />
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <MiniBar value={job.applications}  />
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <MiniBar value={job.views}  />
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#6b7280' }}>
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}

              {!recent_jobs?.length && (
                <tr>
                  <td colSpan={5} style={{
                    padding: '2rem', textAlign: 'center',
                    fontSize: 14, color: '#9ca3af',
                  }}>
                    No jobs posted yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default CompanyDashboard;