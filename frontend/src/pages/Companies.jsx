
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../api/admin';
import { CheckCircle, XCircle, Edit2, Trash2, Plus, RefreshCw } from 'lucide-react';
import DataTable from '../components/DataTable';

const defaultForm = { name: '', email: '', plan_name: 'free', is_verified: false, is_active: true };

export default function Companies() {
const [companies, setCompanies] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', verified: '', active: '' });
const [total, setTotal] = useState(0);
const [modal, setModal] = useState(false);
const [editing, setEditing] = useState(null);
const [form, setForm] = useState(defaultForm);

useEffect(() => { fetchCompanies(); }, [filters]);

const fetchCompanies = async () => {
try {
setLoading(true);
setError(null);
const res = await adminApi.getCompanies(filters);
if (res.data.success) {
setCompanies(res.data.data);
setTotal(res.data.total);
}
} catch {
setError('Failed to load companies.');
} finally {
setLoading(false);
}
};

const toggleStatus = async id => {
try { await adminApi.toggleCompanyStatus(id); fetchCompanies(); } catch { alert('Failed.'); }
};

const verify = async id => {
try { await adminApi.verifyCompany(id); fetchCompanies(); } catch { alert('Failed.'); }
};

const del = async id => {
if (!window.confirm('Delete this company?')) return;
try { await adminApi.deleteCompany(id); fetchCompanies(); } catch { alert('Failed.'); }
};

const submit = async e => {
e.preventDefault();
try {
editing
? await adminApi.updateCompany(editing.id, form)
: await adminApi.createCompany(form);
closeModal();
fetchCompanies();
} catch {
alert('Operation failed.');
}
};

const openAdd = () => {
setEditing(null);
setForm({ ...defaultForm });
setModal(true);
};

const openEdit = row => {
setEditing(row);
setForm({
name: row.name,
email: row.email || '',
plan_name: row.plan_name || 'free',
is_verified: row.is_verified,
is_active: row.is_active,
});
setModal(true);
};

const closeModal = () => {
setModal(false);
setEditing(null);
setForm({ ...defaultForm });
};

const setF = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

const columns = [
{ header: 'Name', accessor: 'name' },
{ header: 'Email', accessor: 'email' },
{ header: 'Plan', accessor: 'plan_name', render: v => <span className="tag tag-gray">{v || 'free'}</span> },
{ header: 'Jobs', accessor: 'job_count' },
{
header: 'Verified', accessor: 'is_verified',
render: v => <span className={`tag ${v ? 'tag-green' : 'tag-amber'}`}>{v ? 'verified' : 'pending'}</span>
},
{
header: 'Status', accessor: 'is_active',
render: v => <span className={`tag ${v ? 'tag-green' : 'tag-red'}`}>{v ? 'active' : 'inactive'}</span>
},
{ header: 'Created', accessor: 'created_at', render: v => new Date(v).toLocaleDateString() },
{
header: 'Actions', accessor: 'id',
render: (id, row) => (
<div className="actions">
{!row.is_verified && (
<button className="btn-icon green" title="Verify" onClick={() => verify(id)}>
<CheckCircle size={14} />
</button>
)}
<button className="btn-icon blue" title="Edit" onClick={() => openEdit(row)}>
<Edit2 size={14} />
</button>
<button
className="btn-icon amber"
title={row.is_active ? 'Deactivate' : 'Activate'}
onClick={() => toggleStatus(id)}
>
{row.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
</button>
<button className="btn-icon red" title="Delete" onClick={() => del(id)}>
<Trash2 size={14} />
</button>
</div>
)
}
];

const modalPortal = modal ? createPortal(
<div
onClick={closeModal}
style={{
position: 'fixed',
inset: 0,
background: 'rgba(0,0,0,0.65)',
backdropFilter: 'blur(3px)',
zIndex: 9999,
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
padding: '20px',
}}
>
<div
onClick={e => e.stopPropagation()}
style={{
background: '#16161e',
border: '1px solid #2a2a38',
borderRadius: '14px',
padding: '26px 28px',
width: '100%',
maxWidth: '500px',
maxHeight: '90vh',
overflowY: 'auto',
position: 'relative',
zIndex: 10000,
}}
>
<div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f0', marginBottom: 20 }}>
{editing ? 'Edit Company' : 'New Company'}
</div>
<form onSubmit={submit}>
<div className="form-group">
<label>Company Name</label>
<input
type="text"
value={form.name}
onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
required
autoFocus
/>
</div>
<div className="form-group">
<label>Email</label>
<input
type="email"
value={form.email}
onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
/>
</div>
<div className="form-group">
<label>Plan</label>
<select
value={form.plan_name}
onChange={e => setForm(f => ({ ...f, plan_name: e.target.value }))}
>
<option value="free">Free</option>
<option value="basic">Basic</option>
<option value="pro">Pro</option>
<option value="enterprise">Enterprise</option>
</select>
</div>
<div className="form-group">
<div className="checkbox-row">
<input
type="checkbox"
id="c-verified"
checked={form.is_verified}
onChange={e => setForm(f => ({ ...f, is_verified: e.target.checked }))}
/>
<label htmlFor="c-verified">Verified</label>
</div>
</div>
<div className="form-group">
<div className="checkbox-row">
<input
type="checkbox"
id="c-active"
checked={form.is_active}
onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
/>
<label htmlFor="c-active">Active</label>
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
<div className="page-title">Companies</div>
<div className="page-sub">{total} total</div>
</div>
<button className="btn btn-primary" onClick={openAdd}>
<Plus size={14} /> Add Company
</button>
</div>

{error && (
<div className="alert alert-error">
{error}
<button className="btn-icon red" onClick={fetchCompanies}>
<RefreshCw size={13} />
</button>
</div>
)}

<div className="filters">
<input
type="text"
placeholder="Search companies..."
value={filters.search}
onChange={e => setF('search', e.target.value)}
/>
<select value={filters.verified} onChange={e => setF('verified', e.target.value)}>
<option value="">All verification</option>
<option value="true">Verified</option>
<option value="false">Pending</option>
</select>
<select value={filters.active} onChange={e => setF('active', e.target.value)}>
<option value="">All status</option>
<option value="true">Active</option>
<option value="false">Inactive</option>
</select>
<button
className="btn btn-ghost"
onClick={() => setFilters({ page: 1, limit: 20, search: '', verified: '', active: '' })}
>
Clear
</button>
</div>

<div className="tbl-wrap">
<DataTable
columns={columns}
data={companies}
loading={loading}
currentPage={filters.page}
totalPages={Math.ceil(total / filters.limit)}
onPageChange={p => setFilters(f => ({ ...f, page: p }))}
/>
</div>

{modalPortal}
</div>
);
}