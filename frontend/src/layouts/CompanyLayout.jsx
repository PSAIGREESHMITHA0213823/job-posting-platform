// ./layouts/CompanyLayout.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function CompanyLayout() {
  return (
    <div className="company-layout">
      {/* Sidebar or top nav */}
      <nav className="company-nav" style={{ padding: '1rem', background: '#f8f9fa' }}>
        <Link to="/company/dashboard" style={{ marginRight: '1rem' }}>Dashboard</Link>
        <Link to="/company/jobs" style={{ marginRight: '1rem' }}>Jobs</Link>
        <Link to="/company/applications" style={{ marginRight: '1rem' }}>Applications</Link>
        <Link to="/company/profile">Profile</Link>
      </nav>

      {/* Main content */}
      <main style={{ padding: '1rem' }}>
        <Outlet /> {/* Renders nested routes like CompanyDashboard, CompanyJobs, etc. */}
      </main>
    </div>
  );
}