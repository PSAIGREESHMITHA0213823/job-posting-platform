// import React from 'react';

// const LoadingSpinner = ({ text = 'Loading...' }) => (
//   <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
//     <div className="spinner-border text-primary" role="status" />
//     <p className="text-muted mb-0">{text}</p>
//   </div>
// );

// export default LoadingSpinner;
import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
    <div className="spinner-border text-primary" role="status" />
    <p className="text-muted mb-0">{text}</p>
  </div>
);

export default LoadingSpinner;