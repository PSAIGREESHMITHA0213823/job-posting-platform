
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatPage from "./pages/company/ChatPage";
import './App.css';
import './styles.css';


import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

import AdminLayout from './layouts/AdminLayouts';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Users from './pages/Users';
import Payments from './pages/Payments';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Revenue from './pages/Revenue';
import Settings from './pages/Settings';
import SuperAdminProfile from './pages/SuperAdminProfile';

import CompanyLayout from './layouts/CompanyLayout';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyJobs from './pages/company/CompanyJobs';
import CompanyApplications from './pages/company/CompanyApplications';
import CompanyProfile from './pages/company/CompanyProfile';


import DashboardLayout from './pages/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Overview from './pages/Overview';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Applications from './pages/Applications';
import Interview from './pages/Interview';
import SavedJobs from './pages/SavedJobs';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Home from './landing-page-componets/Home';
import { CompanyProvider } from './context/CompanyContext';
import AdminChat from './components/AdminChat';


const Spinner = () => (
  <div className="d-flex align-items-center justify-content-center vh-100">
    <LoadingSpinner />
  </div>
);

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) {
    const dest =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'company_manager'
        ? '/company/dashboard'
        : '/dashboard';
    return <Navigate to={dest} replace />;
  }
  return children;
};
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route
            path="/admin"
            element={
              <PrivateRoute role="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="users" element={<Users />} />
            <Route path="payments" element={<Payments />} />
            <Route path="subscriptions" element={<SubscriptionPlans />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="profile" element={<SuperAdminProfile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="chat" element={<AdminChat />} />
           
          </Route>
          <Route
            path="/company"
            element={
              <PrivateRoute role="company_manager">
                <CompanyProvider>
                <CompanyLayout />
                </CompanyProvider>
                
              </PrivateRoute>
            }
          >
            <Route index element={<CompanyDashboard />} />
            <Route path="dashboard" element={<CompanyDashboard />} />
            <Route path="jobs" element={<CompanyJobs />} />
            <Route path="applications" element={<CompanyApplications />} />
            <Route path="profile" element={<CompanyProfile />} />
           <Route path="chat" element={<ChatPage />} />
          </Route>
          <Route
            path="/dashboard"
            element={
              <PrivateRoute role="employee">
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="applications" element={<Applications />} />
            <Route path="saved" element={<SavedJobs />} />
             <Route path="interview" element={<Interview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

    
       
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;