// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import {
//   LayoutDashboard,
//   Building2,
//   Users,
//   CreditCard,
//   Sparkles,
//   DollarSign,
//   Settings,
//   Menu,
//   X
// } from 'lucide-react';

// const employeeNavItems = [
//   { path: '/dashboard', icon: 'bi-grid-fill', label: 'Dashboard' },
//   { path: '/dashboard/jobs', icon: 'bi-briefcase-fill', label: 'Browse Jobs' },
//   { path: '/dashboard/applications', icon: 'bi-file-earmark-text-fill', label: 'My Applications' },
//   { path: '/dashboard/saved', icon: 'bi-bookmark-heart-fill', label: 'Saved Jobs' },
//   { path: '/dashboard/profile', icon: 'bi-person-fill', label: 'My Profile' },
//   { path: '/dashboard/notifications', icon: 'bi-bell-fill', label: 'Notifications' },
// ];

// const adminNavItems = [
//   { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
//   { path: '/admin/companies', name: 'Companies', icon: <Building2 size={20} /> },
//   { path: '/admin/users', name: 'Users', icon: <Users size={20} /> },
//   { path: '/admin/payments', name: 'Payments', icon: <CreditCard size={20} /> },
//   { path: '/admin/subscriptions', name: 'Subscription Plans', icon: <Sparkles size={20} /> },
//   { path: '/admin/revenue', name: 'Revenue', icon: <DollarSign size={20} /> },
//   { path: '/admin/settings', name: 'Settings', icon: <Settings size={20} /> },
// ];

// const Sidebar = ({ open, onClose, isOpen, toggleSidebar }) => {
//   const { user, profile, logout } = useAuth();

//   const isAdmin =
//     user?.role === 'super_admin' ||
//     user?.role === 'software_owner' ||
//     user?.role === 'company_admin';

//   const initials = profile?.full_name
//     ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
//     : 'U';

//   if (isAdmin) {
//     return (
//       <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
//         <div className="sidebar-header">
//           <h2 className="logo">{isOpen ? 'Admin Panel' : 'AP'}</h2>
//           <button className="toggle-btn" onClick={toggleSidebar}>
//             {isOpen ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>

//         <nav className="sidebar-nav">
//           {adminNavItems.map((item) => (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               className={({ isActive }) =>
//                 `nav-item ${isActive ? 'active' : ''}`
//               }
//             >
//               <span className="nav-icon">{item.icon}</span>
//               {isOpen && <span className="nav-text">{item.name}</span>}
//             </NavLink>
//           ))}
//         </nav>
//       </div>
//     );
//   }

//   return (
//     <>
//       {open && <div className="sidebar-backdrop d-lg-none" onClick={onClose} />}
//       <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
//         <div className="sidebar-header">
//           <div className="sidebar-brand">
//             <i className="bi bi-lightning-charge-fill text-warning me-2" />
//             <span>JobPortal</span>
//           </div>
//           <button className="btn-icon d-lg-none" onClick={onClose}>
//             <i className="bi bi-x-lg" />
//           </button>
//         </div>

//         <div className="sidebar-profile">
//           {profile?.avatar_url ? (
//   <img
//     src={'http://localhost:5000' + profile.avatar_url}
//     alt="avatar"
//     className="avatar-circle"
//     style={{ objectFit: 'cover' }}
//   />
// ) : (
//   <div className="avatar-circle">{initials}</div>
// )}
//           <div className="ms-2 overflow-hidden">
//             <div className="profile-name text-truncate">
//               {profile?.full_name || 'User'}
//             </div>
//             <div className="profile-email text-truncate">
//               {user?.email}
//             </div>
//           </div>
//         </div>

//         <nav className="sidebar-nav">
//           {employeeNavItems.map((item) => (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               end={item.path === '/dashboard'}
//               className={({ isActive }) =>
//                 'nav-item' + (isActive ? ' active' : '')
//               }
//               onClick={() => window.innerWidth < 992 && onClose()}
//             >
//               <i className={'bi ' + item.icon} />
//               <span>{item.label}</span>
//             </NavLink>
//           ))}
//         </nav>

//         <div className="sidebar-footer">
//           <button
//             className="nav-item logout-btn w-100 text-start border-0 bg-transparent"
//             onClick={logout}
//           >
//             <i className="bi bi-box-arrow-left" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Sparkles,
  DollarSign,
  Settings,
  Menu,
  X
} from 'lucide-react';

const employeeNavItems = [
  { path: '/dashboard', icon: 'bi-grid-fill', label: 'Dashboard' },
  { path: '/dashboard/jobs', icon: 'bi-briefcase-fill', label: 'Browse Jobs' },
  { path: '/dashboard/applications', icon: 'bi-file-earmark-text-fill', label: 'My Applications' },
  { path: '/dashboard/saved', icon: 'bi-bookmark-heart-fill', label: 'Saved Jobs' },
  { path: '/dashboard/interview', icon: 'bi-mic-fill', label: 'AI Interview' },
  { path: '/dashboard/profile', icon: 'bi-person-fill', label: 'My Profile' },
  { path: '/dashboard/notifications', icon: 'bi-bell-fill', label: 'Notifications' },
];

const adminNavItems = [
  { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/admin/companies', name: 'Companies', icon: <Building2 size={20} /> },
  { path: '/admin/users', name: 'Users', icon: <Users size={20} /> },
  { path: '/admin/payments', name: 'Payments', icon: <CreditCard size={20} /> },
  { path: '/admin/subscriptions', name: 'Subscription Plans', icon: <Sparkles size={20} /> },
  { path: '/admin/revenue', name: 'Revenue', icon: <DollarSign size={20} /> },
  { path: '/admin/settings', name: 'Settings', icon: <Settings size={20} /> },
];

const Sidebar = ({ open, onClose, isOpen, toggleSidebar }) => {
  const { user, profile, logout } = useAuth();

  const isAdmin =
    user?.role === 'super_admin' ||
    user?.role === 'software_owner' ||
    user?.role === 'company_admin';

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (isAdmin) {
    return (
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="logo">{isOpen ? 'Admin Panel' : 'AP'}</h2>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {isOpen && <span className="nav-text">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    );
  }

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
          {profile?.avatar_url ? (
            <img
              src={'http://localhost:5000' + profile.avatar_url}
              alt="avatar"
              className="avatar-circle"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="avatar-circle">{initials}</div>
          )}
          <div className="ms-2 overflow-hidden">
            <div className="profile-name text-truncate">
              {profile?.full_name || 'User'}
            </div>
            <div className="profile-email text-truncate">
              {user?.email}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {employeeNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                'nav-item' + (isActive ? ' active' : '')
              }
              onClick={() => window.innerWidth < 992 && onClose()}
            >
              <i className={'bi ' + item.icon} />
              <span>{item.label}</span>
              {item.path === '/dashboard/interview' && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  color: '#fff',
                  borderRadius: 20,
                  padding: '1px 7px',
                  letterSpacing: '0.03em'
                }}>
                  AI
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item logout-btn w-100 text-start border-0 bg-transparent"
            onClick={logout}
          >
            <i className="bi bi-box-arrow-left" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;