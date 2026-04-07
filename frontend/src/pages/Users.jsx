import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { adminApi } from '../api/admin';
import { CheckCircle, XCircle } from 'lucide-react';

// NOTE: Component must NOT be async — use useEffect for data fetching
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', role: '', active: '' });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getUsers(filters);
      if (response.data.success) {
        setUsers(response.data.data);
        setTotal(response.data.total);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminApi.toggleUserStatus(id);
      fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', render: (v) => <span className="badge bg-secondary text-capitalize">{v}</span> },
    {
      header: 'Status', accessor: 'is_active',
      render: (v) => <span className={`badge ${v ? 'bg-success' : 'bg-danger'}`}>{v ? 'Active' : 'Inactive'}</span>
    },
    {
      header: 'Joined', accessor: 'created_at',
      render: (v) => new Date(v).toLocaleDateString()
    },
    {
      header: 'Actions', accessor: 'id',
      render: (id, row) => (
        <button
          onClick={() => handleToggleStatus(id)}
          className={`btn btn-sm ${row.is_active ? 'btn-danger' : 'btn-success'}`}
          title={row.is_active ? 'Deactivate' : 'Activate'}
        >
          {row.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
        </button>
      )
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Users Management</h1>
        <span className="text-muted">Total: {total}</span>
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchUsers}>Retry</button>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text" className="form-control" placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}>
                <option value="">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filters.active}
                onChange={(e) => setFilters({ ...filters, active: e.target.value, page: 1 })}>
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ page: 1, limit: 20, search: '', role: '', active: '' })}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns} data={users} loading={loading}
            onPageChange={(page) => setFilters({ ...filters, page })}
            currentPage={filters.page}
            totalPages={Math.ceil(total / filters.limit)}
          />
        </div>
      </div>
    </div>
  );
};

export default Users;