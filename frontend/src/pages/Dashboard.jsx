import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatsCard from '../components/StatsCard';
import { adminApi } from '../api/admin';
import { Building2, Users, Briefcase, FileText, DollarSign } from 'lucide-react';

const defaultData = {
  users:         { total: 0, employees: 0, managers: 0 },
  companies:     { total: 0, verified: 0 },
  jobs:          { total: 0, active: 0 },
  applications:  { total: 0, hired: 0 },
  revenue:       { total_revenue: 0, total_payments: 0 },
  monthly_revenue: []
};

const Dashboard = () => {
  const [dataLoading, setDataLoading]     = useState(true); // renamed to avoid clash
  const [dashboardData, setDashboardData] = useState(defaultData);
  const [error, setError]                 = useState(null);
  const hasFetched = useRef(false); // prevent double-fetch in StrictMode

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      setError(null);
      const response = await adminApi.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setDataLoading(false); // always stop, never leave loading=true
    }
  };

  const safePercent = (part, total) => {
    if (!total || isNaN(part / total)) return 0;
    return Math.round((part / total) * 100);
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: dashboardData.users.total,
      icon: <Users size={28} />,
      color: '#2196F3',
      subtitle: `${dashboardData.users.employees} employees, ${dashboardData.users.managers} managers`
    },
    {
      title: 'Companies',
      value: dashboardData.companies.total,
      icon: <Building2 size={28} />,
      color: '#4CAF50',
      subtitle: `${dashboardData.companies.verified} verified`
    },
    {
      title: 'Job Postings',
      value: dashboardData.jobs.total,
      icon: <Briefcase size={28} />,
      color: '#FF9800',
      subtitle: `${dashboardData.jobs.active} active`
    },
    {
      title: 'Applications',
      value: dashboardData.applications.total,
      icon: <FileText size={28} />,
      color: '#9C27B0',
      subtitle: `${dashboardData.applications.hired} hired`
    },
    {
      title: 'Revenue',
      value: `$${parseFloat(dashboardData.revenue.total_revenue || 0).toLocaleString()}`,
      icon: <DollarSign size={28} />,
      color: '#E91E63',
      subtitle: `${dashboardData.revenue.total_payments} payments`
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  // Show skeleton/spinner only for data, NOT for auth
  if (dataLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Dashboard Overview</h1>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">Monthly Revenue Trend</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">Quick Stats</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="text-muted">Active Jobs Rate</label>
                <div className="progress">
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${safePercent(dashboardData.jobs.active, dashboardData.jobs.total)}%` }}
                  >
                    {safePercent(dashboardData.jobs.active, dashboardData.jobs.total)}%
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-muted">Hired Rate</label>
                <div className="progress">
                  <div
                    className="progress-bar bg-info"
                    style={{ width: `${safePercent(dashboardData.applications.hired, dashboardData.applications.total)}%` }}
                  >
                    {safePercent(dashboardData.applications.hired, dashboardData.applications.total)}%
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-muted">Company Verification Rate</label>
                <div className="progress">
                  <div
                    className="progress-bar bg-warning"
                    style={{ width: `${safePercent(dashboardData.companies.verified, dashboardData.companies.total)}%` }}
                  >
                    {safePercent(dashboardData.companies.verified, dashboardData.companies.total)}%
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
