import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CreditCard,
  Package, TrendingUp, Settings, LogOut, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard',     icon: <LayoutDashboard size={18} /> },
  { to: '/admin/companies', label: 'Companies',      icon: <Building2 size={18} /> },
  { to: '/admin/users',     label: 'Users',          icon: <Users size={18} /> },
  { to: '/admin/payments',  label: 'Payments',       icon: <CreditCard size={18} /> },
  { to: '/admin/subscriptions', label: 'Plans',      icon: <Package size={18} /> },
  { to: '/admin/revenue',   label: 'Revenue',        icon: <TrendingUp size={18} /> },
  { to: '/admin/settings',  label: 'Settings',       icon: <Settings size={18} /> },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login', { replace: true });
  };

  const SidebarContent = () => (
    <div className="d-flex flex-column h-100">
      {/* Brand */}
      <div className="px-4 py-4 border-bottom">
        <span className="fw-bold fs-5">Admin Panel</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-grow-1 py-3">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 px-4 py-2 text-decoration-none mb-1 rounded mx-2 ${
                isActive
                  ? 'bg-primary text-white fw-semibold'
                  : 'text-secondary'
              }`
            }
            style={{ fontSize: 14, transition: 'background 0.15s' }}
            onClick={() => setSidebarOpen(false)}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-top">
        <button
          className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar — desktop */}
      <aside
        className="d-none d-md-flex flex-column bg-white border-end"
        style={{ width: 240, minHeight: '100vh', position: 'sticky', top: 0 }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-md-none"
          style={{ zIndex: 1040, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`position-fixed top-0 start-0 bg-white border-end d-md-none`}
        style={{
          width: 240,
          height: '100vh',
          zIndex: 1050,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        {/* Top bar */}
        <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center gap-3 d-md-none">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <span className="fw-bold">Admin Panel</span>
        </header>

        <main className="flex-grow-1 p-4" style={{ background: '#f4f6fb' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;