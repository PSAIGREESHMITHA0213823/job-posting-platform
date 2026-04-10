// // ./layouts/CompanyLayout.js
// import React from 'react';
// import { Outlet, Link } from 'react-router-dom';

// export default function CompanyLayout() {
//   return (
//     <div className="company-layout">
//       {/* Sidebar or top nav */}
//       <nav className="company-nav" style={{ padding: '1rem', background: '#f8f9fa' }}>
//         <Link to="/company/dashboard" style={{ marginRight: '1rem' }}>Dashboard</Link>
//         <Link to="/company/jobs" style={{ marginRight: '1rem' }}>Jobs</Link>
//         <Link to="/company/applications" style={{ marginRight: '1rem' }}>Applications</Link>
//         <Link to="/company/profile">Profile</Link>
//       </nav>

//       {/* Main content */}
//       <main style={{ padding: '1rem' }}>
//         <Outlet /> {/* Renders nested routes like CompanyDashboard, CompanyJobs, etc. */}
//       </main>
//     </div>
//   );
// }
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CompanyLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/company/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/company/jobs', label: 'Job Postings', icon: '💼' },
    { path: '/company/applications', label: 'Applications', icon: '📋' },
    { path: '/company/profile', label: 'Company Profile', icon: '🏢' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f4f6fb' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '60px',
        background: 'linear-gradient(180deg, #1a1f36 0%, #2d3561 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#4f6ef7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>C</div>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap' }}>Company Portal</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 4,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(79,110,247,0.3)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              })}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: 14 }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {sidebarOpen && (
            <div style={{ marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff6b6b', borderRadius: 8, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
          >
            <span>🚪</span>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e8ecf4', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setSidebarOpen(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 4 }}
          >☰</button>
          <span style={{ fontWeight: 600, color: '#1a1f36' }}>Company Manager</span>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CompanyLayout;