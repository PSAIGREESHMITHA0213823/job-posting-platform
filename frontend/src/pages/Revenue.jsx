
import React, { useState, useEffect } from 'react';
import {
BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { adminApi } from '../api/admin';
import { RefreshCw } from 'lucide-react';

const PIE_COLORS = ['#7c6bff', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

const tooltipStyle = {
contentStyle: {
background: '#16161e',
border: '1px solid #2a2a38',
borderRadius: 8,
fontSize: 12,
color: '#e8e8f0',
},
labelStyle: { color: '#a0a0b8' },
cursor: { fill: 'rgba(124,107,255,0.08)' },
};

const normalizeMonthly = (arr = []) =>
arr.map(item => ({
...item,
revenue: parseFloat(item.revenue ?? item.total ?? item.amount ?? 0),
}));

const normalizePlans = (arr = []) =>
arr.map(item => ({
...item,
plan: item.plan ?? item.plan_name ?? item.name ?? 'Unknown',
revenue: parseFloat(item.revenue ?? item.total ?? item.amount ?? 0),
}));

export default function Revenue() {
const [data, setData] = useState({ summary: {}, monthly: [], by_plan: [] });
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => { load(); }, []);

const load = async () => {
try {
setLoading(true);
setError(null);
const res = await adminApi.getRevenue();
if (res.data.success) {
const raw = res.data.data;
setData({
summary: raw.summary || {},
monthly: normalizeMonthly(raw.monthly || []),
by_plan: normalizePlans(raw.by_plan || []),
});
} else {
setError('Failed to load revenue data.');
}
} catch (err) {
console.error('Revenue fetch error:', err);
setError('Failed to load revenue data.');
} finally {
setLoading(false);
}
};

const fmt = v => `$${parseFloat(v || 0).toLocaleString()}`;

if (loading) return <div className="center-screen"><div className="spinner" /></div>;

const hasMonthly = data.monthly.length > 0;
const hasByPlan = data.by_plan.length > 0;

return (
<div className="page">
<div className="page-header">
<div>
<div className="page-title">Revenue</div>
<div className="page-sub">financial overview</div>
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

<div className="grid-3" style={{ marginBottom: 24 }}>
<div className="stat-card purple">
<div className="stat-label">Total Revenue</div>
<div className="stat-value">{fmt(data.summary?.total_revenue)}</div>
<div className="stat-sub">all time</div>
</div>
<div className="stat-card green">
<div className="stat-label">This Month</div>
<div className="stat-value">{fmt(data.summary?.monthly_revenue)}</div>
<div className="stat-sub">current period</div>
</div>
<div className="stat-card amber">
<div className="stat-label">Total Payments</div>
<div className="stat-value">{data.summary?.total_payments || 0}</div>
<div className="stat-sub">transactions</div>
</div>
</div>

<div style={{
display: 'grid',
gridTemplateColumns: hasByPlan ? '1fr 360px' : '1fr',
gap: 16,
}}>
<div className="card">
<div className="section-label" style={{ marginBottom: 16 }}>
Monthly Revenue — Last 6 Months
</div>
{hasMonthly ? (
<ResponsiveContainer width="100%" height={260}>
<BarChart data={data.monthly} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
<CartesianGrid stroke="#2a2a38" strokeDasharray="3 3" vertical={false} />
<XAxis
dataKey="month"
tick={{ fill: '#55556a', fontSize: 11 }}
axisLine={false}
tickLine={false}
/>
<YAxis
tick={{ fill: '#55556a', fontSize: 11 }}
axisLine={false}
tickLine={false}
tickFormatter={v => `$${Number(v).toLocaleString()}`}
width={70}
/>
<Tooltip
{...tooltipStyle}
formatter={v => [`$${Number(v).toLocaleString()}`, 'Revenue']}
/>
<Bar
dataKey="revenue"
fill="#7c6bff"
radius={[4, 4, 0, 0]}
maxBarSize={44}
opacity={0.9}
/>
</BarChart>
</ResponsiveContainer>
) : (
<div style={{
padding: '60px 0', textAlign: 'center',
color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 13,
}}>
no payment data yet
</div>
)}
</div>

{hasByPlan && (
<div className="card">
<div className="section-label" style={{ marginBottom: 16 }}>Revenue by Plan</div>
<ResponsiveContainer width="100%" height={260}>
<PieChart>
<Pie
data={data.by_plan}
dataKey="revenue"
nameKey="plan"
cx="50%"
cy="44%"
outerRadius={88}
label={({ plan, percent }) =>
percent > 0.04 ? `${plan} ${(percent * 100).toFixed(0)}%` : ''
}
labelLine={false}
>
{data.by_plan.map((_, i) => (
<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
))}
</Pie>
<Tooltip
{...tooltipStyle}
formatter={v => [`$${Number(v).toLocaleString()}`, 'Revenue']}
/>
<Legend
wrapperStyle={{ color: '#a0a0b8', fontSize: 12, paddingTop: 8 }}
formatter={value => value}
/>
</PieChart>
</ResponsiveContainer>
</div>
)}
</div>
</div>
);
}