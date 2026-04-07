
// import './App.css';
// import { BrowserRouter } from "react-router-dom";
// import Home from './landing-page-componets/Home';

// function App() {
//   return (
//  <BrowserRouter>
//       <Home/>
// </BrowserRouter>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import LoadingSpinner from './components/LoadingSpinner';
import Home from './landing-page-componets/Home';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex align-items-center justify-content-center vh-100"><LoadingSpinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'employee') return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex align-items-center justify-content-center vh-100"><LoadingSpinner /></div>;
  if (user?.role === 'employee') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route
            path="/dashboard"
            element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
          >
            <Route index element={<Overview />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="applications" element={<Applications />} />
            <Route path="saved" element={<SavedJobs />} />
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