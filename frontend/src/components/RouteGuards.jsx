import React from 'react';
import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const Spinner = () => (
  <div className="d-flex align-items-center justify-content-center vh-100">
    <LoadingSpinner />
  </div>
);

export const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) {
    const dest =
      user.role === 'admin'        ? '/admin/dashboard'    :
      user.role === 'company_manager' ? '/company/dashboard' :
      '/dashboard';
    return <Navigate to={dest} replace />;
  }
  return children;
};
