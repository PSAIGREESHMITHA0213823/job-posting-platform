
// // // import React from 'react';
// // // import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// // // import { AuthProvider, useAuth } from './context/AuthContext';
// // // import DashboardLayout from './pages/DashboardLayout';
// // // import Login from './pages/Login';
// // // import Register from './pages/Register';
// // // import Overview from './pages/Overview';
// // // import Jobs from './pages/Jobs';
// // // import JobDetail from './pages/JobDetail';
// // // import Applications from './pages/Applications';
// // // import SavedJobs from './pages/SavedJobs';
// // // import Profile from './pages/Profile';
// // // import Notifications from './pages/Notifications';
// // // import LoadingSpinner from './components/LoadingSpinner';
// // // import './App.css';

// // // const PrivateRoute = ({ children }) => {
// // //   const { user, loading } = useAuth();
// // //   if (loading) return <div className="d-flex align-items-center justify-content-center vh-100"><LoadingSpinner /></div>;
// // //   if (!user) return <Navigate to="/login" replace />;
// // //   if (user.role !== 'employee') return <Navigate to="/login" replace />;
// // //   return children;
// // // };

// // // const PublicRoute = ({ children }) => {
// // //   const { user, loading } = useAuth();
// // //   if (loading) return <div className="d-flex align-items-center justify-content-center vh-100"><LoadingSpinner /></div>;
// // //   if (user?.role === 'employee') return <Navigate to="/dashboard" replace />;
// // //   return children;
// // // };

// // // function App() {
// // //   return (
// // //     <AuthProvider>
// // //       <BrowserRouter>
// // //         <Routes>
// // //           <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
// // //           <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
// // //           <Route
// // //             path="/dashboard"
// // //             element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
// // //           >
// // //             <Route index element={<Overview />} />
// // //             <Route path="jobs" element={<Jobs />} />
// // //             <Route path="jobs/:id" element={<JobDetail />} />
// // //             <Route path="applications" element={<Applications />} />
// // //             <Route path="saved" element={<SavedJobs />} />
// // //             <Route path="profile" element={<Profile />} />
// // //             <Route path="notifications" element={<Notifications />} />
// // //           </Route>
// // //           <Route path="*" element={<Navigate to="/login" replace />} />
// // //         </Routes>
// // //       </BrowserRouter>
// // //     </AuthProvider>
// // //   );
// // // }

// // // export default App;

// // import React from 'react';
// // import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// // import 'bootstrap/dist/css/bootstrap.min.css';
// // import './App.css';

// // import { AuthProvider, useAuth } from './context/AuthContext';
// // import LoadingSpinner from './components/LoadingSpinner';

// // // Admin Pages
// // import AdminLayout from './layouts/AdminLayouts';
// // import Dashboard from './pages/Dashboard';
// // import Companies from './pages/Companies';
// // import Users from './pages/Users';
// // import Payments from './pages/Payments';
// // import SubscriptionPlans from './pages/SubscriptionPlans';
// // import Revenue from './pages/Revenue';
// // import Settings from './pages/Settings';

// // // Employee Pages
// // import DashboardLayout from './pages/DashboardLayout';
// // import Login from './pages/Login';
// // import Register from './pages/Register';
// // import Overview from './pages/Overview';
// // import Jobs from './pages/Jobs';
// // import JobDetail from './pages/JobDetail';
// // import Applications from './pages/Applications';
// // import SavedJobs from './pages/SavedJobs';
// // import Profile from './pages/Profile';
// // import Notifications from './pages/Notifications';

// // // Private route for both Admin and Employee
// // const PrivateRoute = ({ children, role }) => {
// //   const { user, loading } = useAuth();
// //   if (loading)
// //     return (
// //       <div className="d-flex align-items-center justify-content-center vh-100">
// //         <LoadingSpinner />
// //       </div>
// //     );
// //   if (!user) return <Navigate to="/login" replace />;
// //   if (role && user.role !== role) return <Navigate to="/login" replace />;
// //   return children;
// // };

// // // Public route
// // const PublicRoute = ({ children }) => {
// //   const { user, loading } = useAuth();
// //   if (loading)
// //     return (
// //       <div className="d-flex align-items-center justify-content-center vh-100">
// //         <LoadingSpinner />
// //       </div>
// //     );
// //   if (user) {
// //     // Redirect based on role
// //     return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
// //   }
// //   return children;
// // };

// // function App() {
// //   return (
// //     <AuthProvider>
// //       <BrowserRouter>
// //         <Routes>
// //           {/* Public Routes */}
// //           <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
// //           <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

// //           {/* Admin Routes */}
// //           <Route
// //             path="/admin"
// //             element={
// //               <PrivateRoute role="admin">
// //                 <AdminLayout />
// //               </PrivateRoute>
// //             }
// //           >
// //             <Route index element={<Dashboard />} />
// //             <Route path="dashboard" element={<Dashboard />} />
// //             <Route path="companies" element={<Companies />} />
// //             <Route path="users" element={<Users />} />
// //             <Route path="payments" element={<Payments />} />
// //             <Route path="subscriptions" element={<SubscriptionPlans />} />
// //             <Route path="revenue" element={<Revenue />} />
// //             <Route path="settings" element={<Settings />} />
// //           </Route>

// //           {/* Employee Routes */}
// //           <Route
// //             path="/dashboard"
// //             element={
// //               <PrivateRoute role="employee">
// //                 <DashboardLayout />
// //               </PrivateRoute>
// //             }
// //           >
// //             <Route index element={<Overview />} />
// //             <Route path="jobs" element={<Jobs />} />
// //             <Route path="jobs/:id" element={<JobDetail />} />
// //             <Route path="applications" element={<Applications />} />
// //             <Route path="saved" element={<SavedJobs />} />
// //             <Route path="profile" element={<Profile />} />
// //             <Route path="notifications" element={<Notifications />} />
// //           </Route>

// //           {/* Root & catch-all */}
// //           <Route path="/" element={<Navigate to="/login" replace />} />
// //           <Route path="*" element={<Navigate to="/login" replace />} />
// //         </Routes>
// //       </BrowserRouter>
// //     </AuthProvider>
// //   );
// // }

// // export default App;
// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './App.css';

// import { AuthProvider, useAuth } from './context/AuthContext';
// import LoadingSpinner from './components/LoadingSpinner';

// // Admin Pages
// import AdminLayout from './layouts/AdminLayouts';
// import Dashboard from './pages/Dashboard';
// import Companies from './pages/Companies';
// import Users from './pages/Users';
// import Payments from './pages/Payments';
// import SubscriptionPlans from './pages/SubscriptionPlans';
// import Revenue from './pages/Revenue';
// import Settings from './pages/Settings';

// // Company Pages
// import CompanyLayout from './layouts/CompanyLayout';           // create this layout
// import CompanyDashboard from './pages/company/CompanyDashboard'; // create these pages
// import CompanyJobs from './pages/company/CompanyJobs';
// import CompanyApplications from './pages/company/CompanyApplications';
// import CompanyProfile from './pages/company/CompanyProfile';

// // Employee Pages
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

// // ─── Route Guards ────────────────────────────────────────────────────────────

// const Spinner = () => (
//   <div className="d-flex align-items-center justify-content-center vh-100">
//     <LoadingSpinner />
//   </div>
// );

// /** Protect a route by required role. If no role given, any logged-in user passes. */
// const PrivateRoute = ({ children, role }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <Spinner />;
//   if (!user) return <Navigate to="/login" replace />;
//   if (role && user.role !== role) return <Navigate to="/login" replace />;
//   return children;
// };

// /** Redirect logged-in users to their dashboard immediately. */
// const PublicRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <Spinner />;
//   if (user) {
//     const dest =
//       user.role === 'admin'
//         ? '/admin/dashboard'
//         : user.role === 'company_manager'
//         ? '/company/dashboard'
//         : '/dashboard';
//     return <Navigate to={dest} replace />;
//   }
//   return children;
// };

// // ─── App ─────────────────────────────────────────────────────────────────────

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           {/* Public */}
//           <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
//           <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

//           {/* Admin Routes */}
//           <Route
//             path="/admin"
//             element={
//               <PrivateRoute role="admin">
//                 <AdminLayout />
//               </PrivateRoute>
//             }
//           >
//             <Route index element={<Dashboard />} />
//             <Route path="dashboard"     element={<Dashboard />} />
//             <Route path="companies"     element={<Companies />} />
//             <Route path="users"         element={<Users />} />
//             <Route path="payments"      element={<Payments />} />
//             <Route path="subscriptions" element={<SubscriptionPlans />} />
//             <Route path="revenue"       element={<Revenue />} />
//             <Route path="settings"      element={<Settings />} />
//           </Route>

//           {/* Company Manager Routes */}
//           <Route
//             path="/company"
//             element={
//               <PrivateRoute role="company_manager">
//                 <CompanyLayout />
//               </PrivateRoute>
//             }
//           >
//             <Route index element={<CompanyDashboard />} />
//             <Route path="dashboard"    element={<CompanyDashboard />} />
//             <Route path="jobs"         element={<CompanyJobs />} />
//             <Route path="applications" element={<CompanyApplications />} />
//             <Route path="profile"      element={<CompanyProfile />} />
//           </Route>

//           {/* Employee Routes */}
//           <Route
//             path="/dashboard"
//             element={
//               <PrivateRoute role="employee">
//                 <DashboardLayout />
//               </PrivateRoute>
//             }
//           >
//             <Route index element={<Overview />} />
//             <Route path="jobs"         element={<Jobs />} />
//             <Route path="jobs/:id"     element={<JobDetail />} />
//             <Route path="applications" element={<Applications />} />
//             <Route path="saved"        element={<SavedJobs />} />
//             <Route path="profile"      element={<Profile />} />
//             <Route path="notifications" element={<Notifications />} />
//           </Route>

//           {/* Root & catch-all */}
//           <Route path="/"  element={<Navigate to="/login" replace />} />
//           <Route path="*"  element={<Navigate to="/login" replace />} />
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

// ---------- Helper: automatically fixes wrong import/export ----------
function getComponent(module, fallbackName = 'Component') {
  // If it's already a function or class, return it
  if (typeof module === 'function' || typeof module === 'object' && module?.$$typeof) {
    return module;
  }
  // If it's an object with a 'default' property (ES module default export)
  if (module && typeof module === 'object' && module.default) {
    return module.default;
  }
  // If it's an object with a single named export (e.g., { DashboardLayout })
  const keys = Object.keys(module);
  if (keys.length === 1 && typeof module[keys[0]] === 'function') {
    return module[keys[0]];
  }
  console.error(`❌ Could not resolve component "${fallbackName}"`, module);
  return () => null; // fallback empty component
}

// Import everything – now we'll fix them on use
import * as _AdminLayout from './layouts/AdminLayouts';
import * as _Dashboard from './pages/Dashboard';
import * as _Companies from './pages/Companies';
import * as _Users from './pages/Users';
import * as _Payments from './pages/Payments';
import * as _SubscriptionPlans from './pages/SubscriptionPlans';
import * as _Revenue from './pages/Revenue';
import * as _Settings from './pages/Settings';

import * as _CompanyLayout from './layouts/CompanyLayout';
import * as _CompanyDashboard from './pages/company/CompanyDashboard';
import * as _CompanyJobs from './pages/company/CompanyJobs';
import * as _CompanyApplications from './pages/company/CompanyApplications';
import * as _CompanyProfile from './pages/company/CompanyProfile';

import * as _DashboardLayout from './pages/DashboardLayout';
import * as _Login from './pages/Login';
import * as _Register from './pages/Register';
import * as _Overview from './pages/Overview';
import * as _Jobs from './pages/Jobs';
import * as _JobDetail from './pages/JobDetail';
import * as _Applications from './pages/Applications';
import * as _SavedJobs from './pages/SavedJobs';
import * as _Profile from './pages/Profile';
import * as _Notifications from './pages/Notifications';

// Resolve all components
const AdminLayout = getComponent(_AdminLayout, 'AdminLayout');
const Dashboard = getComponent(_Dashboard, 'Dashboard');
const Companies = getComponent(_Companies, 'Companies');
const Users = getComponent(_Users, 'Users');
const Payments = getComponent(_Payments, 'Payments');
const SubscriptionPlans = getComponent(_SubscriptionPlans, 'SubscriptionPlans');
const Revenue = getComponent(_Revenue, 'Revenue');
const Settings = getComponent(_Settings, 'Settings');

const CompanyLayout = getComponent(_CompanyLayout, 'CompanyLayout');
const CompanyDashboard = getComponent(_CompanyDashboard, 'CompanyDashboard');
const CompanyJobs = getComponent(_CompanyJobs, 'CompanyJobs');
const CompanyApplications = getComponent(_CompanyApplications, 'CompanyApplications');
const CompanyProfile = getComponent(_CompanyProfile, 'CompanyProfile');

const DashboardLayout = getComponent(_DashboardLayout, 'DashboardLayout');
const Login = getComponent(_Login, 'Login');
const Register = getComponent(_Register, 'Register');
const Overview = getComponent(_Overview, 'Overview');
const Jobs = getComponent(_Jobs, 'Jobs');
const JobDetail = getComponent(_JobDetail, 'JobDetail');
const Applications = getComponent(_Applications, 'Applications');
const SavedJobs = getComponent(_SavedJobs, 'SavedJobs');
const Profile = getComponent(_Profile, 'Profile');
const Notifications = getComponent(_Notifications, 'Notifications');

// ---------- Route Guards ----------
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

// ---------- App ----------
function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="users" element={<Users />} />
            <Route path="payments" element={<Payments />} />
            <Route path="subscriptions" element={<SubscriptionPlans />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/company" element={<PrivateRoute role="company_manager"><CompanyLayout /></PrivateRoute>}>
            <Route index element={<CompanyDashboard />} />
            <Route path="dashboard" element={<CompanyDashboard />} />
            <Route path="jobs" element={<CompanyJobs />} />
            <Route path="applications" element={<CompanyApplications />} />
            <Route path="profile" element={<CompanyProfile />} />
          </Route>

          <Route path="/dashboard" element={<PrivateRoute role="employee"><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Overview />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="applications" element={<Applications />} />
            <Route path="saved" element={<SavedJobs />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;