import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { adminApi } from '../api/admin';
import { CheckCircle, XCircle } from 'lucide-react';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    verified: '',
    active: '',
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getCompanies(filters);
      if (response.data.success) {
        setCompanies(response.data.data);
        setTotal(response.data.total);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminApi.toggleCompanyStatus(id);
      fetchCompanies();
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Failed to update company status.');
    }
  };

  const handleVerify = async (id) => {
    try {
      await adminApi.verifyCompany(id);
      fetchCompanies();
    } catch (err) {
      console.error('Error verifying company:', err);
      alert('Failed to verify company.');
    }
  };

  const columns = [
    { header: 'Company Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Plan', accessor: 'plan_name' },
    { header: 'Job Count', accessor: 'job_count' },
    {
      header: 'Verified',
      accessor: 'is_verified',
      render: (value) => (
        <span className={`badge ${value ? 'bg-success' : 'bg-warning text-dark'}`}>
          {value ? 'Verified' : 'Pending'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (value) => (
        <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (value, row) => (
        <div className="btn-group btn-group-sm">
          {!row.is_verified && (
            <button
              onClick={() => handleVerify(value)}
              className="btn btn-success"
              title="Verify Company"
            >
              <CheckCircle size={16} />
            </button>
          )}
          <button
            onClick={() => handleToggleStatus(value)}
            className={`btn ${row.is_active ? 'btn-danger' : 'btn-success'}`}
            title={row.is_active ? 'Deactivate' : 'Activate'}
          >
            {row.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Companies Management</h1>
        <span className="text-muted">Total: {total}</span>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchCompanies}>
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search companies..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.verified}
                onChange={(e) =>
                  setFilters({ ...filters, verified: e.target.value, page: 1 })
                }
              >
                <option value="">All Verification Status</option>
                <option value="true">Verified</option>
                <option value="false">Pending</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.active}
                onChange={(e) =>
                  setFilters({ ...filters, active: e.target.value, page: 1 })
                }
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() =>
                  setFilters({ page: 1, limit: 20, search: '', verified: '', active: '' })
                }
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={companies}
            loading={loading}
            onPageChange={(page) => setFilters({ ...filters, page })}
            currentPage={filters.page}
            totalPages={Math.ceil(total / filters.limit)}
          />
        </div>
      </div>
    </div>
  );
};

export default Companies;