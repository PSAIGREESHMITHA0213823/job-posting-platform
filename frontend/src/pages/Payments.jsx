import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { adminApi } from '../api/admin';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' });
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchPayments(); }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getPayments(filters);
      if (response.data.success) {
        setPayments(response.data.data);
        setTotal(response.data.total);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Company', accessor: 'company_name' },
    { header: 'Plan', accessor: 'plan_name' },
    {
      header: 'Amount', accessor: 'amount',
      render: (v) => `$${parseFloat(v || 0).toLocaleString()}`
    },
    {
      header: 'Status', accessor: 'status',
      render: (v) => (
        <span className={`badge ${v === 'completed' ? 'bg-success' : v === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
          {v}
        </span>
      )
    },
    {
      header: 'Date', accessor: 'created_at',
      render: (v) => new Date(v).toLocaleDateString()
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Payments</h1>
        <span className="text-muted">Total: {total}</span>
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchPayments}>Retry</button>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <input
            type="text" className="form-control" style={{ maxWidth: 300 }}
            placeholder="Search payments..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns} data={payments} loading={loading}
            onPageChange={(page) => setFilters({ ...filters, page })}
            currentPage={filters.page}
            totalPages={Math.ceil(total / filters.limit)}
          />
        </div>
      </div>
    </div>
  );
};

export default Payments;