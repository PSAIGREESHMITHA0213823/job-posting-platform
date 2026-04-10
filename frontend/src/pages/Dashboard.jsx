
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '../api/admin';
import { RefreshCw } from 'lucide-react';
import '../styles.css';

const empty = { users: { total: 0, employees: 0, managers: 0 }, companies: { total: 0, verified: 0 }, jobs: { total: 0, active: 0 }, applications: { total: 0, hired: 0 }, revenue: { total_revenue: 0, total_payments: 0 }, monthly_revenue: [] };
const fmt = n => Number(n || 0).toLocaleString();
const pct = (a, b) => !b ? 0 : Math.round((a / b) * 100);

function StatCard({ label, value, sub, color }) {
return (
<div className={`stat-card ${color}`}>
<div className="stat-label">{label}</div>
<div className="stat-value">{value}</div>
<div className="stat-sub">{sub}</div>
</div>
);
}

function ProgressBar({ label, value, color }) {
return (
<div className="progress-row">
<div className="progress-header">
<span className="progress-label">{label}</span>
<span className="progress-value" style={{ color }}>{value}%</span>
</div>
<div className="progress-track">
<div className="progress-fill" style={{ width: `${value}%`, background: color }} />
</div>
</div>
);
}

const tStyle = {
contentStyle: { background: '#18181f', border: '1px solid #2a2a35', borderRadius: 8, fontSize: 12 },
labelStyle: { color: '#8888a0' },
itemStyle: { color: '#e8e8f0' }
};

export default function Dashboard() {
const [d, setD] = useState(empty);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const did = useRef(false);

useEffect(() => { if (!did.current) { did.current = true; load(); } }, []);

const load = async () => {
try {
setLoading(true);
setError(null);
const res = await adminApi.getDashboard();
if (res.data.success) setD(res.data.data);
} catch {
setError('Failed to load dashboard data.');
} finally {
setLoading(false);
}
};

if (loading) return <div className="center-screen"><div className="spinner" /></div>;

return (
<div className="page">
<div className="page-header">
<div>
<div className="page-title">Dashboard</div>
<div className="page-sub">system overview</div>
</div>
<button className="btn btn-ghost" onClick={load}>
<RefreshCw size={14} /> Refresh
</button>
</div>

{error && (
<div className="alert alert-error">
{error}
<button className="btn-icon red" onClick={load}><RefreshCw size={13} /></button>
</div>
)}

<div className="grid-4 dashboard-stats">
<StatCard label="Total Users"   value={fmt(d.users.total)}           sub={`${fmt(d.users.employees)} employees`}    color="purple" />
<StatCard label="Companies"     value={fmt(d.companies.total)}        sub={`${fmt(d.companies.verified)} verified`}   color="green"  />
<StatCard label="Job Postings"  value={fmt(d.jobs.total)}             sub={`${fmt(d.jobs.active)} active`}            color="amber"  />
<StatCard label="Revenue"       value={`$${fmt(d.revenue.total_revenue)}`} sub={`${fmt(d.revenue.total_payments)} payments`} color="cyan" />
</div>

<div className="dashboard-charts-row">
<div className="card dashboard-line-chart">
<div className="section-label dashboard-section-label">Revenue Trend</div>
<ResponsiveContainer width="100%" height={240}>
<LineChart data={d.monthly_revenue} margin={{ top: 4, right: 4, left: -14 }}>
<CartesianGrid stroke="#2a2a35" strokeDasharray="3 3" />
<XAxis dataKey="month" tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
<YAxis tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
<Tooltip {...tStyle} />
<Line type="monotone" dataKey="revenue" stroke="#7c6bff" strokeWidth={2} dot={{ r: 3, fill: '#7c6bff' }} />
</LineChart>
</ResponsiveContainer>
</div>

<div className="card dashboard-metrics">
<div className="section-label dashboard-section-label">Key Metrics</div>
<ProgressBar label="Active Jobs Rate"    value={pct(d.jobs.active, d.jobs.total)}                     color="var(--amber)"  />
<ProgressBar label="Hire Rate"           value={pct(d.applications.hired, d.applications.total)}      color="var(--accent)" />
<ProgressBar label="Verified Companies"  value={pct(d.companies.verified, d.companies.total)}         color="var(--green)"  />
<div className="divider" />
{[
{ l: 'Employees',    v: fmt(d.users.employees)       },
{ l: 'Managers',     v: fmt(d.users.managers)        },
{ l: 'Applications', v: fmt(d.applications.total)    },
].map(({ l, v }) => (
<div key={l} className="quick-number-row">
<span className="quick-number-label">{l}</span>
<span className="quick-number-value">{v}</span>
</div>
))}
</div>
</div>

{d.monthly_revenue?.length > 0 && (
<div className="card">
<div className="section-label dashboard-section-label">Monthly Applications</div>
<ResponsiveContainer width="100%" height={200}>
<BarChart data={d.monthly_revenue} margin={{ top: 4, right: 4, left: -14 }}>
<CartesianGrid stroke="#2a2a35" strokeDasharray="3 3" />
<XAxis dataKey="month" tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
<YAxis tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
<Tooltip {...tStyle} />
<Bar dataKey="applications" fill="#7c6bff" radius={[4, 4, 0, 0]} maxBarSize={36} opacity={0.85} />
</BarChart>
</ResponsiveContainer>
</div>
)}
</div>
);
}