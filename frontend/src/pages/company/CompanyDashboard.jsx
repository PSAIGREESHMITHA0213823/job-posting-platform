// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const StatCard = ({ label, value, sub, color, icon }) => (
//   <div style={{
//     background: '#fff',
//     borderRadius: 12,
//     padding: '20px 24px',
//     boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
//     borderLeft: `4px solid ${color}`,
//     display: 'flex',
//     flexDirection: 'column',
//     gap: 8,
//   }}>
//     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//       <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</span>
//       <span style={{ fontSize: 22 }}>{icon}</span>
//     </div>
//     <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1f36' }}>
//       {value ?? '—'}
//     </div>
//     {sub && <div style={{ fontSize: 12, color: '#9ca3af' }}>{sub}</div>}
//   </div>
// );

// const CompanyDashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const token = localStorage.getItem("token"); 

//         const response = await axios.get(`${API}/company/dashboard`, {
//           headers: {
//             Authorization: `Bearer ${token}` 
//           }
//         });

//  console.log("Dashboard Data:", response.data); 

//         setData(response.data.data);
//       } catch (err) {
//         console.log("Dashboard Error:", err.response); 

//         setError(
//           err.response?.data?.message || 'Failed to load dashboard'
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   if (loading) {
//     return (
//       <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
//         Loading dashboard…
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
//         {error}
//       </div>
//     );
//   }

//   const { jobs, applications, views, recent_jobs } = data || {};

//   return (
//     <div>
//       <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1f36', marginBottom: 6 }}>
//         Dashboard
//       </h2>
//       <p style={{ color: '#6b7280', marginBottom: 24 }}>
//         Overview of your company's hiring activity
//       </p>

//   <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//         gap: 16,
//         marginBottom: 32
//       }}>
//     <StatCard
//           label="Total Jobs"
//           value={jobs?.total}
//           sub={`${jobs?.active} active · ${jobs?.closed} closed`}
//           color="#4f6ef7"
//           icon="💼"
//         />
//         <StatCard
//          label="Total Applications"
//           value={applications?.total}
//           sub={`${applications?.pending} pending`}
//           color="#10b981"
//      icon="📋"
//         />
//         <StatCard
//           label="Shortlisted"
//           value={applications?.shortlisted}
//           color="#f59e0b"
//           icon="⭐"
//     />
//         <StatCard
//           label="Hired"
//           value={applications?.hired}
//           color="#8b5cf6"
//           icon="🎉"
//         />
//         <StatCard
//           label="Total Views"
//           value={views?.total_views}
//           color="#06b6d4"
//           icon="👁️"
//         />
//       </div>
//       <div style={{
//         background: '#fff',
//         borderRadius: 12,
//         boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
//         overflow: 'hidden'
//       }}>
//         <div style={{
//           padding: '16px 24px',
//           borderBottom: '1px solid #f3f4f6',
//           fontWeight: 600,
//           color: '#1a1f36'
//         }}>
//           Recent Job Postings
//         </div>

//   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr style={{ background: '#f9fafb' }}>
//               {['Title', 'Status', 'Applications', 'Views', 'Posted'].map(h => (
//                 <th key={h} style={{
//                   padding: '10px 16px',
//                   textAlign: 'left',
//                   fontSize: 12,
//                   color: '#6b7280',
//                   fontWeight: 600,
//                   textTransform: 'uppercase',
//                   letterSpacing: 0.5
//                 }}>
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             {(recent_jobs || []).map((job, i) => (
//               <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
//                 <td style={{ padding: '12px 16px', fontWeight: 500 }}>
//                   {job.title}
//                 </td>

//        <td style={{ padding: '12px 16px' }}>
//                   <span style={{
//                     padding: '3px 10px',
//                     borderRadius: 20,
//                     fontSize: 12,
//                     fontWeight: 600,
//                     background:
//                       job.status === 'active' ? '#d1fae5'
//                         : job.status === 'draft' ? '#fef3c7'
//                           : '#fee2e2',
//                     color:
//                       job.status === 'active' ? '#065f46'
//                         : job.status === 'draft' ? '#92400e'
//                           : '#991b1b',
//                   }}>
//                     {job.status}
//                   </span>
//                 </td>

//        <td style={{ padding: '12px 16px' }}>
//                   {job.applications}
//                 </td>

//                 <td style={{ padding: '12px 16px' }}>
//                   {job.views}
//                 </td>

//                 <td style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>
//                   {new Date(job.created_at).toLocaleDateString()}
//                 </td>
//               </tr>
//             ))}

//       {!recent_jobs?.length && (
//               <tr>
//                 <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>
//                   No jobs yet
//                 </td>
//               </tr>
//             )}
//           </tbody>
//        </table>
//       </div>
//     </div>
//   );
// };

// export default CompanyDashboard;
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`,
    display: 'flex', flexDirection: 'column', gap: 8,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1f36' }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 12, color: '#9ca3af' }}>{sub}</div>}
  </div>
);

// ── Info Chip ─────────────────────────────────────────────────────────────────
const Chip = ({ icon, text }) => text ? (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: '#f3f4f6', borderRadius: 20, padding: '4px 12px',
    fontSize: 13, color: '#374151',
  }}>
    <span>{icon}</span>{text}
  </span>
) : null;

// ── Status pill ───────────────────────────────────────────────────────────────
const statusStyle = (s) => ({
  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
  background: s === 'active' ? '#d1fae5' : s === 'draft' ? '#fef3c7' : '#fee2e2',
  color: s === 'active' ? '#065f46' : s === 'draft' ? '#92400e' : '#991b1b',
});

// ── Main Component ────────────────────────────────────────────────────────────
const CompanyDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const headers = getAuthHeaders();
        const [dashRes, profRes] = await Promise.all([
          axios.get(`${API}/company/dashboard`, { headers }),
          axios.get(`${API}/company/profile`,   { headers }),
        ]);
        setDashboard(dashRes.data.data);
        setProfile(profRes.data.data || profRes.data);
      } catch (err) {
        console.error('Dashboard load error:', err.response || err);
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
      Loading dashboard…
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>{error}</div>
  );

  const { jobs, applications, views, recent_jobs } = dashboard || {};

  return (
    <div>

      {/* ── Company Profile Card ── */}
      {profile && (
        <div style={{
          background: '#fff', borderRadius: 14, padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24,
          display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
        }}>
          {/* Logo */}
          <div style={{
            width: 72, height: 72, borderRadius: 12, flexShrink: 0,
            border: '2px solid #e5e7eb', overflow: 'hidden',
            background: '#f9fafb', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {profile.logo_url
              ? <img
                  src={profile.logo_url.startsWith('http')
                    ? profile.logo_url
                    : `http://localhost:5000${profile.logo_url}`}
                  alt="logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              : <span style={{ fontSize: 28 }}>🏢</span>}
          </div>

          {/* Company info */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 6, flexWrap: 'wrap',
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1f36', margin: 0 }}>
                {profile.name || 'Your Company'}
              </h2>
              {profile.industry && (
                <span style={{
                  background: '#ede9fe', color: '#5b21b6', fontSize: 11,
                  fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {profile.industry}
                </span>
              )}
            </div>

            {profile.description && (
              <p style={{
                fontSize: 13, color: '#6b7280', marginBottom: 12,
                lineHeight: 1.6, maxWidth: 600,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {profile.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Chip icon="👥" text={profile.company_size ? `${profile.company_size} employees` : null} />
              <Chip icon="📍" text={[profile.city, profile.country].filter(Boolean).join(', ') || null} />
              <Chip icon="🌐" text={profile.website || null} />
              <Chip icon="🏠" text={profile.address || null} />
            </div>
          </div>

          {/* Quick badge stats */}
          <div style={{
            display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap',
          }}>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 10, padding: '10px 18px', textAlign: 'center', minWidth: 80,
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#065f46' }}>
                {jobs?.active ?? 0}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Active Jobs</div>
            </div>
            <div style={{
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 10, padding: '10px 18px', textAlign: 'center', minWidth: 80,
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1d4ed8' }}>
                {applications?.total ?? 0}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Applications</div>
            </div>
            <div style={{
              background: '#fdf4ff', border: '1px solid #e9d5ff',
              borderRadius: 10, padding: '10px 18px', textAlign: 'center', minWidth: 80,
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#7e22ce' }}>
                {applications?.hired ?? 0}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Hired</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Section header ── */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1f36', margin: 0 }}>
          Hiring Overview
        </h3>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
          Overview of your company's hiring activity
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        <StatCard
          label="Total Jobs"
          value={jobs?.total}
          sub={`${jobs?.active ?? 0} active · ${jobs?.closed ?? 0} closed`}
          color="#4f6ef7" icon="💼"
        />
        <StatCard
          label="Total Applications"
          value={applications?.total}
          sub={`${applications?.pending ?? 0} pending`}
          color="#10b981" icon="📋"
        />
        <StatCard
          label="Shortlisted"
          value={applications?.shortlisted}
          color="#f59e0b" icon="⭐"
        />
        <StatCard
          label="Hired"
          value={applications?.hired}
          color="#8b5cf6" icon="🎉"
        />
        {/* <StatCard
          label="Total Views"
          value={views?.total_views}
          color="#06b6d4" icon="👁️"
        /> */}
      </div>

      {/* ── Recent Jobs Table ── */}
      <div style={{
        background: '#fff', borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid #f3f4f6',
          fontWeight: 700, color: '#1a1f36', fontSize: 15,
        }}>
          Recent Job Postings
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Title', 'Status', 'Applications',  'Posted'].map(h => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontSize: 11, color: '#6b7280', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: 0.6,
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
                style={{ borderTop: '1px solid #f3f4f6', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a1f36' }}>
                  {job.title}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={statusStyle(job.status)}>{job.status}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#374151' }}>
                  {job.applications}
                </td>
                {/* <td style={{ padding: '12px 16px', color: '#374151' }}>
                  {job. ?? 0}
                </td> */}
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>
                  {new Date(job.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
            {!recent_jobs?.length && (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
                  No jobs posted yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default CompanyDashboard;