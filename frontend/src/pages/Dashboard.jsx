// import React, { useState, useEffect } from 'react';
// import {
//   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import StatsCard from '../components/StatsCard';
// import { adminApi } from '../api/admin';
// import { Building2, Users, Briefcase, FileText, DollarSign } from 'lucide-react';

// const Dashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [dashboardData, setDashboardData] = useState({
//     users: { total: 0, employees: 0, managers: 0 },
//     companies: { total: 0, verified: 0 },
//     jobs: { total: 0, active: 0 },
//     applications: { total: 0, hired: 0 },
//     revenue: { total_revenue: 0, total_payments: 0 },
//     monthly_revenue: []
//   });

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const response = await adminApi.getDashboard();
//       if (response.data.success) {
//         setDashboardData(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching dashboard:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const statsCards = [
//     { title: 'Total Users', value: dashboardData.users.total, icon: <Users size={28} />, color: '#2196F3', subtitle: `${dashboardData.users.employees} employees, ${dashboardData.users.managers} managers` },
//     { title: 'Companies', value: dashboardData.companies.total, icon: <Building2 size={28} />, color: '#4CAF50', subtitle: `${dashboardData.companies.verified} verified` },
//     { title: 'Job Postings', value: dashboardData.jobs.total, icon: <Briefcase size={28} />, color: '#FF9800', subtitle: `${dashboardData.jobs.active} active` },
//     { title: 'Applications', value: dashboardData.applications.total, icon: <FileText size={28} />, color: '#9C27B0', subtitle: `${dashboardData.applications.hired} hired` },
//     { title: 'Revenue', value: `$${parseFloat(dashboardData.revenue.total_revenue).toLocaleString()}`, icon: <DollarSign size={28} />, color: '#E91E63', subtitle: `${dashboardData.revenue.total_payments} payments` },
//   ];

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

//   if (loading) {
//     return (
//       <div className="text-center py-5">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h1 className="mb-4">Dashboard Overview</h1>
      
//       <div className="stats-grid">
//         {statsCards.map((stat, index) => (
//           <StatsCard key={index} {...stat} />
//         ))}
//       </div>

//       <div className="row mt-4">
//         <div className="col-md-8 mb-4">
//           <div className="card">
//             <div className="card-header bg-white">
//               <h5 className="mb-0">Monthly Revenue Trend</h5>
//             </div>
//             <div className="card-body">
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={dashboardData.monthly_revenue}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => `$${value}`} />
//                   <Legend />
//                   <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>
        
//         <div className="col-md-4 mb-4">
//           <div className="card">
//             <div className="card-header bg-white">
//               <h5 className="mb-0">Quick Stats</h5>
//             </div>
//             <div className="card-body">
//               <div className="mb-3">
//                 <label className="text-muted">Active Jobs Rate</label>
//                 <div className="progress">
//                   <div 
//                     className="progress-bar bg-success" 
//                     style={{ width: `${(dashboardData.jobs.active / dashboardData.jobs.total) * 100}%` }}
//                   >
//                     {Math.round((dashboardData.jobs.active / dashboardData.jobs.total) * 100)}%
//                   </div>
//                 </div>
//               </div>
//               <div className="mb-3">
//                 <label className="text-muted">Hired Rate</label>
//                 <div className="progress">
//                   <div 
//                     className="progress-bar bg-info" 
//                     style={{ width: `${(dashboardData.applications.hired / dashboardData.applications.total) * 100}%` }}
//                   >
//                     {Math.round((dashboardData.applications.hired / dashboardData.applications.total) * 100)}%
//                   </div>
//                 </div>
//               </div>
//               <div className="mb-3">
//                 <label className="text-muted">Company Verification Rate</label>
//                 <div className="progress">
//                   <div 
//                     className="progress-bar bg-warning" 
//                     style={{ width: `${(dashboardData.companies.verified / dashboardData.companies.total) * 100}%` }}
//                   >
//                     {Math.round((dashboardData.companies.verified / dashboardData.companies.total) * 100)}%
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboar
// d;
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatsCard from '../components/StatsCard';
import { adminApi } from '../api/admin';
import { Building2, Users, Briefcase, FileText, DollarSign } from 'lucide-react';

// Safe division helper — avoids NaN / Infinity when denominator is 0
const safePercent = (num, denom) =>
  denom > 0 ? Math.round((num / denom) * 100) : 0;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, employees: 0, managers: 0 },
    companies: { total: 0, verified: 0 },
    jobs: { total: 0, active: 0 },
    applications: { total: 0, hired: 0 },
    revenue: { total_revenue: 0, total_payments: 0 },
    monthly_revenue: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: dashboardData.users.total.toLocaleString(),
      icon: <Users size={28} />,
      color: '#2196F3',
      subtitle: `${dashboardData.users.employees} employees, ${dashboardData.users.managers} managers`,
    },
    {
      title: 'Companies',
      value: dashboardData.companies.total.toLocaleString(),
      icon: <Building2 size={28} />,
      color: '#4CAF50',
      subtitle: `${dashboardData.companies.verified} verified`,
    },
    {
      title: 'Job Postings',
      value: dashboardData.jobs.total.toLocaleString(),
      icon: <Briefcase size={28} />,
      color: '#FF9800',
      subtitle: `${dashboardData.jobs.active} active`,
    },
    {
      title: 'Applications',
      value: dashboardData.applications.total.toLocaleString(),
      icon: <FileText size={28} />,
      color: '#9C27B0',
      subtitle: `${dashboardData.applications.hired} hired`,
    },
    {
      title: 'Revenue',
      value: `$${parseFloat(dashboardData.revenue.total_revenue || 0).toLocaleString()}`,
      icon: <DollarSign size={28} />,
      color: '#E91E63',
      subtitle: `${dashboardData.revenue.total_payments} payments`,
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center justify-content-between" role="alert">
        <span>{error}</span>
        <button className="btn btn-sm btn-outline-danger" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Dashboard Overview</h1>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchDashboardData}>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="col-12 col-sm-6 col-xl-4">
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Monthly Revenue Chart */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pb-0">
              <h5 className="mb-0">Monthly Revenue Trend</h5>
            </div>
            <div className="card-body">
              {dashboardData.monthly_revenue.length === 0 ? (
                <div className="text-center py-5 text-muted">No revenue data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.monthly_revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pb-0">
              <h5 className="mb-0">Quick Stats</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <label className="text-muted small">Active Jobs Rate</label>
                  <span className="small fw-semibold">
                    {safePercent(dashboardData.jobs.active, dashboardData.jobs.total)}%
                  </span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${safePercent(dashboardData.jobs.active, dashboardData.jobs.total)}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <label className="text-muted small">Hired Rate</label>
                  <span className="small fw-semibold">
                    {safePercent(dashboardData.applications.hired, dashboardData.applications.total)}%
                  </span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-info"
                    style={{ width: `${safePercent(dashboardData.applications.hired, dashboardData.applications.total)}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <label className="text-muted small">Company Verification Rate</label>
                  <span className="small fw-semibold">
                    {safePercent(dashboardData.companies.verified, dashboardData.companies.total)}%
                  </span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{ width: `${safePercent(dashboardData.companies.verified, dashboardData.companies.total)}%` }}
                  />
                </div>
              </div>

              <hr />

              <div className="row text-center g-2">
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-light">
                    <div className="fs-5 fw-bold text-primary">{dashboardData.users.managers}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>Managers</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-light">
                    <div className="fs-5 fw-bold text-success">{dashboardData.users.employees}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>Employees</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;