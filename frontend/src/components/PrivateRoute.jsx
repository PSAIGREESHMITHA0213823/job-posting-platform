import { Navigate } from 'react-router-dom';

// Simply checks if a token exists in localStorage.
// No async, no API call — React renders this synchronously.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;