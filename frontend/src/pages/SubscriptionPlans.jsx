
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../api/admin';
import { Pencil, Trash2, Plus, Check, RefreshCw } from 'lucide-react';

const defaultForm = {
name: '',
price: '',
duration_days: '',
features: '',
max_job_postings: '',
max_applications_per_job: '',
};

const featuresObjToStr = (features) => {
if (!features) return '';
try {
const parsed = typeof features === 'string' ? JSON.parse(features) : features;
if (typeof parsed === 'object' && !Array.isArray(parsed)) {
return Object.entries(parsed)
.filter(([, v]) => v)
.map(([k]) => k.replace(/_/g, ' '))
.join('\n');
}
} catch {
}
return typeof features === 'string' ? features : '';
};

const featuresObjToList = (features) => {
if (!features) return [];
try {
const parsed = typeof features === 'string' ? JSON.parse(features) : features;
if (typeof parsed === 'object' && !Array.isArray(parsed)) {
return Object.entries(parsed)
.filter(([, v]) => v)
.map(([k]) => k.replace(/_/g, ' '));
}
} catch {
}
return String(features).split('\n').filter(Boolean);
};

export default function SubscriptionPlans() {
const [plans, setPlans] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [modal, setModal] = useState(false);
const [editing, setEditing] = useState(null);
const [form, setForm] = useState(defaultForm);
const [submitting, setSubmitting] = useState(false);

useEffect(() => { load(); }, []);

const load = async () => {
try {
setLoading(true);
setError(null);
const res = await adminApi.getPlans();
if (res.data.success) {
setPlans(res.data.data);
} else {
setError('Failed to load plans.');
}
} catch (err) {
console.error('Load error:', err);
setError('Failed to load plans.');
} finally {
setLoading(false);
}
};

const submit = async e => {
e.preventDefault();
try {
setSubmitting(true);
const payload = {
name: form.name.trim(),
price: parseFloat(form.price),
duration_days: parseInt(form.duration_days, 10),
features: form.features.trim(),
max_job_postings: form.max_job_postings ? parseInt(form.max_job_postings, 10) : undefined,
max_applications_per_job: form.max_applications_per_job ? parseInt(form.max_applications_per_job, 10) : undefined,
};

if (editing) {
const res = await adminApi.updatePlan(editing.id, payload);
if (!res.data.success) throw new Error(res.data.message || 'Update failed.');
} else {
const res = await adminApi.createPlan(payload);
if (!res.data.success) throw new Error(res.data.message || 'Create failed.');
}

closeModal();
load();
} catch (err) {
console.error('Submit error:', err);
alert(err.message || (editing ? 'Update failed.' : 'Failed to create plan.'));
} finally {
setSubmitting(false);
}
};

const openAdd = () => {
setEditing(null);
setForm({ ...defaultForm });
setModal(true);
};

const openEdit = plan => {
setEditing(plan);
setForm({
name: plan.name || '',
price: plan.price || '',
duration_days: plan.duration_days || '',
features: featuresObjToStr(plan.features),
max_job_postings: plan.max_job_postings || '',
max_applications_per_job: plan.max_applications_per_job || '',
});
setModal(true);
};

const closeModal = () => {
setModal(false);
setEditing(null);
setForm({ ...defaultForm });
};

const del = async id => {
if (!window.confirm('Delete this plan?')) return;
try {
const res = await adminApi.deletePlan(id);
if (!res.data.success) throw new Error(res.data.message || 'Delete failed.');
load();
} catch (err) {
alert(err.message || 'Failed to delete plan.');
}
};

if (loading) return <div className="center-screen"><div className="spinner" /></div>;

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
width: '100%', maxWidth: '480px',
maxHeight: '90vh', overflowY: 'auto',
position: 'relative', zIndex: 10000,
}}
>
<div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f0', marginBottom: 20 }}>
{editing ? 'Edit Plan' : 'New Plan'}
</div>

<form onSubmit={submit}>
<div className="form-group">
<label>Plan Name</label>
<input
type="text"
value={form.name}
onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
required
autoFocus
placeholder="e.g. Pro, Enterprise..."
/>
</div>

<div className="form-row">
<div className="form-group">
<label>Price ($)</label>
<input
type="number"
min="0"
step="0.01"
value={form.price}
onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
required
placeholder="29.99"
/>
</div>
<div className="form-group">
<label>Duration (days)</label>
<input
type="number"
min="1"
value={form.duration_days}
onChange={e => setForm(f => ({ ...f, duration_days: e.target.value }))}
required
placeholder="30"
/>
</div>
</div>

<div className="form-row">
<div className="form-group">
<label>Max Job Postings</label>
<input
type="number"
min="1"
value={form.max_job_postings}
onChange={e => setForm(f => ({ ...f, max_job_postings: e.target.value }))}
placeholder="10"
/>
</div>
<div className="form-group">
<label>Max Applications/Job</label>
<input
type="number"
min="1"
value={form.max_applications_per_job}
onChange={e => setForm(f => ({ ...f, max_applications_per_job: e.target.value }))}
placeholder="100"
/>
</div>
</div>

<div className="form-group">
<label>Features (one per line)</label>
<textarea
rows={4}
value={form.features}
onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
placeholder={"analytics\nfeatured jobs\npriority support"}
style={{ resize: 'vertical' }}
/>
</div>

<div className="modal-footer">
<button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
<button type="submit" className="btn btn-primary" disabled={submitting}>
{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
</button>
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
<div className="page-title">Subscription Plans</div>
<div className="page-sub">{plans.length} plan{plans.length !== 1 ? 's' : ''}</div>
</div>
<button className="btn btn-primary" onClick={openAdd}>
<Plus size={14} /> New Plan
</button>
</div>

{error && (
<div className="alert alert-error">
{error}
<button className="btn-icon red" onClick={load}><RefreshCw size={13} /></button>
</div>
)}

{plans.length === 0 && !error ? (
<div className="center-screen" style={{ flexDirection: 'column', gap: 12 }}>
<div style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 13 }}>no plans yet</div>
<button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Create First Plan</button>
</div>
) : (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
{plans.map(plan => {
const featureList = featuresObjToList(plan.features);
return (
<div key={plan.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
<div>
<div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{plan.name}</div>
<div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 2 }}>
{plan.duration_days}d · {plan.max_job_postings} jobs · {plan.max_applications_per_job} apps/job
</div>
</div>
<div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>
${parseFloat(plan.price || 0).toFixed(2)}
</div>
</div>

{featureList.length > 0 && (
<ul style={{ listStyle: 'none', marginBottom: 16, flex: 1, padding: 0 }}>
{featureList.map((f, i) => (
<li key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text2)', marginBottom: 5 }}>
<Check size={12} color="var(--green)" style={{ flexShrink: 0 }} /> {f}
</li>
))}
</ul>
)}

<div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
<button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(plan)}>
<Pencil size={13} /> Edit
</button>
<button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => del(plan.id)}>
<Trash2 size={13} /> Delete
</button>
</div>
</div>
);
})}
</div>
)}

{modalPortal}
</div>
);
}