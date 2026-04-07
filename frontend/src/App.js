
// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import DashboardLayout from './pages/DashboardLayout';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Overview from './pages/Overview';
// import Jobs from './pages/Jobs';
// import JobDetail from './pages/JobDetail';
// import Applications from './pages/Applications';
// import SavedJobs from './pages/SavedJobs';
// import Profile from './pages/Profile';
// import Notifications from './pages/Notifications';
// import LoadingSpinner from './components/LoadingSpinner';
// import './App.css';

// const PrivateRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="d-flex align-items-center justify-content-center vh-100"><LoadingSpinner /></div>;
//   if (!user) return <Navigate to="/login" replace />;
//   if (user.role !== 'employee') return <Navigate to="/login" replace />;
//   return children;
// };

// const PublicRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="d-flex align-items-center justify-content-center vh-100"><LoadingSpinner /></div>;
//   if (user?.role === 'employee') return <Navigate to="/dashboard" replace />;
//   return children;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
//           <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
//           <Route
//             path="/dashboard"
//             element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
//           >
//             <Route index element={<Overview />} />
//             <Route path="jobs" element={<Jobs />} />
//             <Route path="jobs/:id" element={<JobDetail />} />
//             <Route path="applications" element={<Applications />} />
//             <Route path="saved" element={<SavedJobs />} />
//             <Route path="profile" element={<Profile />} />
//             <Route path="notifications" element={<Notifications />} />
//           </Route>
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Admin Pages
import AdminLayout from './layouts/AdminLayouts';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Users from './pages/Users';
import Payments from './pages/Payments';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Revenue from './pages/Revenue';
import Settings from './pages/Settings';

// Employee Pages
import DashboardLayout from './pages/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Overview from './pages/Overview';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Applications from './pages/Applications';
import SavedJobs from './pages/SavedJobs';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

// Private route for both Admin and Employee
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <LoadingSpinner />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

// Public route
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <LoadingSpinner />
      </div>
    );
  if (user) {
    // Redirect based on role
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Admin Routes */}
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
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Employee Routes */}
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
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Root & catch-all */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;