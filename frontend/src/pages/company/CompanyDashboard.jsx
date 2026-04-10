import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderLeft: `4px solid ${color}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1f36' }}>
      {value ?? '—'}
    </div>
    {sub && <div style={{ fontSize: 12, color: '#9ca3af' }}>{sub}</div>}
  </div>
);

const CompanyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token"); 

        const response = await axios.get(`${API}/company/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}` 
          }
        });

 console.log("Dashboard Data:", response.data); 

        setData(response.data.data);
      } catch (err) {
        console.log("Dashboard Error:", err.response); 

        setError(
          err.response?.data?.message || 'Failed to load dashboard'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  const { jobs, applications, views, recent_jobs } = data || {};

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1f36', marginBottom: 6 }}>
        Dashboard
      </h2>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Overview of your company's hiring activity
      </p>

  <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
    <StatCard
          label="Total Jobs"
          value={jobs?.total}
          sub={`${jobs?.active} active · ${jobs?.closed} closed`}
          color="#4f6ef7"
          icon="💼"
        />
        <StatCard
         label="Total Applications"
          value={applications?.total}
          sub={`${applications?.pending} pending`}
          color="#10b981"
     icon="📋"
        />
        <StatCard
          label="Shortlisted"
          value={applications?.shortlisted}
          color="#f59e0b"
          icon="⭐"
    />
        <StatCard
          label="Hired"
          value={applications?.hired}
          color="#8b5cf6"
          icon="🎉"
        />
        <StatCard
          label="Total Views"
          value={views?.total_views}
          color="#06b6d4"
          icon="👁️"
        />
      </div>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f3f4f6',
          fontWeight: 600,
          color: '#1a1f36'
        }}>
          Recent Job Postings
        </div>

  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Title', 'Status', 'Applications', 'Views', 'Posted'].map(h => (
                <th key={h} style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: 12,
                  color: '#6b7280',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {(recent_jobs || []).map((job, i) => (
              <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                  {job.title}
                </td>

       <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background:
                      job.status === 'active' ? '#d1fae5'
                        : job.status === 'draft' ? '#fef3c7'
                          : '#fee2e2',
                    color:
                      job.status === 'active' ? '#065f46'
                        : job.status === 'draft' ? '#92400e'
                          : '#991b1b',
                  }}>
                    {job.status}
                  </span>
                </td>

       <td style={{ padding: '12px 16px' }}>
                  {job.applications}
                </td>

                <td style={{ padding: '12px 16px' }}>
                  {job.views}
                </td>

                <td style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>
                  {new Date(job.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}

      {!recent_jobs?.length && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>
                  No jobs yet
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