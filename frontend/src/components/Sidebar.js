import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: 'bi-grid-fill', label: 'Dashboard' },
  { path: '/dashboard/jobs', icon: 'bi-briefcase-fill', label: 'Browse Jobs' },
  { path: '/dashboard/applications', icon: 'bi-file-earmark-text-fill', label: 'My Applications' },
  { path: '/dashboard/saved', icon: 'bi-bookmark-heart-fill', label: 'Saved Jobs' },
  { path: '/dashboard/profile', icon: 'bi-person-fill', label: 'My Profile' },
  { path: '/dashboard/notifications', icon: 'bi-bell-fill', label: 'Notifications' },
];

const Sidebar = ({ open, onClose }) => {
  const { user, profile, logout } = useAuth();
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : 'U';

  return (
    <>
      {open && <div className="sidebar-backdrop d-lg-none" onClick={onClose} />}
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <i className="bi bi-lightning-charge-fill text-warning me-2" />
            <span>JobPortal</span>
          </div>
          <button className="btn-icon d-lg-none" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="sidebar-profile">
          <div className="avatar-circle">{initials}</div>
          <div className="ms-2 overflow-hidden">
            <div className="profile-name text-truncate">{profile?.full_name || 'User'}</div>
            <div className="profile-email text-truncate">{user?.email}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              onClick={() => window.innerWidth < 992 && onClose()}
            >
              <i className={'bi ' + item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn w-100 text-start border-0 bg-transparent" onClick={logout}>
            <i className="bi bi-box-arrow-left" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;