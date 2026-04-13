
import React from 'react';
import { Link } from 'react-router-dom';

const Topbar = ({ onToggle, title }) => (
  <header className="topbar">
    <div className="d-flex align-items-center gap-3">
      <button className="btn-icon" onClick={onToggle}>
        <i className="bi bi-list fs-4" />
      </button>
      {title && <h5 className="mb-0 fw-semibold text-dark">{title}</h5>}
    </div>
    <div className="topbar-right">
      <Link to="/dashboard/notifications" className="btn-icon position-relative">
        <i className="bi bi-bell fs-5" />
      </Link>
      <Link to="/dashboard/profile" className="btn-icon">
        <i className="bi bi-person-circle fs-5" />
      </Link>
    </div>
  </header>
);

export default Topbar;