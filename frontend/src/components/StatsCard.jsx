import React from 'react';

const StatsCard = ({ title, value, icon, color, subtitle }) => (
  <div className="card h-100 shadow-sm border-0">
    <div className="card-body d-flex align-items-center gap-3 p-4">
      <div
        className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
        style={{ width: 56, height: 56, background: color + '1a', color }}
      >
        {icon}
      </div>
      <div>
        <div className="text-muted small mb-1">{title}</div>
        <div className="fs-4 fw-bold lh-1 mb-1">{value}</div>
        <div className="text-muted" style={{ fontSize: 12 }}>{subtitle}</div>
      </div>
    </div>
  </div>
);

export default StatsCard;