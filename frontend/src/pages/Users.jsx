
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../api/admin';
import { Edit2, Trash2, Plus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import DataTable from '../components/DataTable';

const defaultForm = { email: '', password: '', role: 'employee', full_name: '', is_active: true };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', role: '', active: '' });
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { fetchUsers(); }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getUsers(filters);
      if (res.data.success) {
        setUsers(res.data.data);
        setTotal(res.data.total);
      }
    } catch { setError('Failed to load users.'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async id => {
    try { await adminApi.toggleUserStatus(id); fetchUsers(); } catch { alert('Failed.'); }
  };

  const del = async id => {
    if (!window.confirm('Delete this user?')) return;
    try { await adminApi.deleteUser(id); fetchUsers(); } catch { alert('Failed.'); }
  };

  const submit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        await adminApi.updateUser(editing.id, form);
      } else {
        await adminApi.createUser(form);
      }
      closeModal();
      fetchUsers();
    } catch { alert('Operation failed.'); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...defaultForm });
    setModal(true);
  };

  const openEdit = row => {
    setEditing(row);
    setForm({ email: row.email, password: '', role: row.role, full_name: row.full_name || '', is_active: row.is_active });
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); setForm({ ...defaultForm }); };

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const columns = [
    { header: 'Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v}</span> },
    { header: 'Role', accessor: 'role', render: v => <span className="tag tag-blue">{v}</span> },
    { header: 'Status', accessor: 'is_active', render: v => <span className={`tag ${v ? 'tag-green' : 'tag-red'}`}>{v ? 'active' : 'inactive'}</span> },
    { header: 'Joined', accessor: 'created_at', render: v => new Date(v).toLocaleDateString() },
    {
      header: 'Actions', accessor: 'id',
      render: (id, row) => (
        <div className="actions">
          <button className="btn-icon blue" onClick={() => openEdit(row)}><Edit2 size={14} /></button>
          <button className="btn-icon amber" onClick={() => toggleStatus(id)}>
            {row.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
          </button>
          <button className="btn-icon red" onClick={() => del(id)}><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  const modalPortal = modal ? createPortal(
    <div
      onClick={closeModal}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#16161e', border: '1px solid #2a2a38',
          borderRadius: '14px', padding: '26px 28px',
          width: '100%', maxWidth: '500px',
          maxHeight: '90vh', overflowY: 'auto',
          position: 'relative', zIndex: 10000,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f0', marginBottom: 20 }}>
          {editing ? 'Edit User' : 'New User'}
        </div>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required autoFocus />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Password{editing ? ' (leave blank to keep)' : ''}</label>
            <input type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required={!editing} />
          </div>
          <div className="form-group">
            <div className="checkbox-row">
              <input type="checkbox" id="u-active" checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
              <label htmlFor="u-active">Active</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <div className="page-sub">{total} total</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={14} /> Add User
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn-icon red" onClick={fetchUsers}><RefreshCw size={13} /></button>
        </div>
      )}

      <div className="filters">
        <input type="text" placeholder="Search users..." value={filters.search}
          onChange={e => setF('search', e.target.value)} />
        <select value={filters.role} onChange={e => setF('role', e.target.value)}>
          <option value="">All roles</option>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <select value={filters.active} onChange={e => setF('active', e.target.value)}>
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button className="btn btn-ghost"
          onClick={() => setFilters({ page: 1, limit: 20, search: '', role: '', active: '' })}>
          Clear
        </button>
      </div>

      <div className="tbl-wrap">
        <DataTable columns={columns} data={users} loading={loading}
          currentPage={filters.page} totalPages={Math.ceil(total / filters.limit)}
          onPageChange={p => setFilters(f => ({ ...f, page: p }))} />
      </div>

      {modalPortal}
    </div>
  );
}