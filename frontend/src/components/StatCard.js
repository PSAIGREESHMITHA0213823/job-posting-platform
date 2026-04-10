// import React from 'react';

// const StatCard = ({ icon, label, value, color = 'primary', sub }) => (
//   <div className="stat-card">
//     <div className={'stat-icon stat-icon-' + color}>
//       <i className={'bi ' + icon + ' fs-4'} />
//     </div>
//     <div className="stat-body">
//       <div className="stat-value">{value ?? '—'}</div>
//       <div className="stat-label">{label}</div>
//       {sub && <div className="stat-sub">{sub}</div>}
//     </div>
//   </div>
// );

// export default StatCard;
import React from 'react';

const StatCard = ({ icon, label, value, color = 'primary', sub }) => (
  <div className="stat-card">
    <div className={'stat-icon stat-icon-' + color}>
      <i className={'bi ' + icon + ' fs-4'} />
    </div>
    <div className="stat-body">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

export default StatCard;