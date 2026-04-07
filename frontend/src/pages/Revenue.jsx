import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { adminApi } from '../api/admin';

const Revenue = () => {
  const [data, setData] = useState({ summary: {}, monthly: [], by_plan: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchRevenue(); }, []);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getRevenue();
      if (response.data.success) setData(response.data.data);
    } catch (err) {
      console.error('Error fetching revenue:', err);
      setError('Failed to load revenue data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Revenue</h1>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchRevenue}>Refresh</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Revenue', value: `$${parseFloat(data.summary?.total_revenue || 0).toLocaleString()}`, color: '#4CAF50' },
          { label: 'This Month', value: `$${parseFloat(data.summary?.monthly_revenue || 0).toLocaleString()}`, color: '#2196F3' },
          { label: 'Total Payments', value: data.summary?.total_payments || 0, color: '#FF9800' },
        ].map((item, i) => (
          <div key={i} className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="text-muted small mb-1">{item.label}</div>
                <div className="fs-3 fw-bold" style={{ color: item.color }}>{item.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.monthly && data.monthly.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-0">
            <h5 className="mb-0">Monthly Revenue</h5>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#4CAF50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Revenue;