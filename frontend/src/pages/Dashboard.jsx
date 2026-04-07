import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { adminApi } from '../api/admin';
import { Building2, Users, Briefcase, FileText, DollarSign, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';

const defaultData = {
  users:           { total: 0, employees: 0, managers: 0 },
  companies:       { total: 0, verified: 0 },
  jobs:            { total: 0, active: 0 },
  applications:    { total: 0, hired: 0 },
  revenue:         { total_revenue: 0, total_payments: 0 },
  monthly_revenue: []
};

// ─── tiny helpers ──────────────────────────────────────────────────────────────
const pct = (part, total) =>
  !total || isNaN(part / total) ? 0 : Math.round((part / total) * 100);

const fmt = (n) => Number(n || 0).toLocaleString();

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, accent, sub }) => (
  <div style={{
    background: '#fff',
    borderRadius: 16,
    padding: '24px 28px',
    boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    borderTop: `3px solid ${accent}`,
    transition: 'box-shadow .2s',
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,.10)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase' }}>{title}</p>
        <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      </div>
      <div style={{ background: `${accent}18`, borderRadius: 12, padding: 10, color: accent }}>{icon}</div>
    </div>
    <p style={{ margin: 0, fontSize: 12.5, color: '#64748b' }}>{sub}</p>
  </div>
);

// ─── Progress row ───────────────────────────────────────────────────────────────
const ProgressRow = ({ label, value, color }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}%</span>
    </div>
    <div style={{ height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${value}%`, background: color,
        borderRadius: 99, transition: 'width 1s ease',
      }} />
    </div>
  </div>
);

// ─── Custom tooltip for charts ──────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b', color: '#f8fafc', padding: '10px 14px',
      borderRadius: 10, fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,.2)'
    }}>
      <p style={{ margin: '0 0 4px', color: '#94a3b8', fontSize: 11 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, fontWeight: 600 }}>
          {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [loading, setLoading]       = useState(true);
  const [data, setData]             = useState(defaultData);
  const [error, setError]           = useState(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getDashboard();
      if (res.data.success) setData(res.data.data);
    } catch {
      setError('Could not load dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Users',    value: fmt(data.users.total),        icon: <Users size={20} />,     accent: '#3b82f6', sub: `${fmt(data.users.employees)} employees · ${fmt(data.users.managers)} managers` },
    { title: 'Companies',      value: fmt(data.companies.total),    icon: <Building2 size={20} />, accent: '#10b981', sub: `${fmt(data.companies.verified)} verified` },
    { title: 'Job Postings',   value: fmt(data.jobs.total),         icon: <Briefcase size={20} />, accent: '#f59e0b', sub: `${fmt(data.jobs.active)} active` },
    { title: 'Applications',   value: fmt(data.applications.total), icon: <FileText size={20} />,  accent: '#8b5cf6', sub: `${fmt(data.applications.hired)} hired` },
    { title: 'Revenue',        value: `$${fmt(data.revenue.total_revenue)}`, icon: <DollarSign size={20} />, accent: '#ec4899', sub: `${fmt(data.revenue.total_payments)} payments` },
  ];

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #e2e8f0', borderTopColor: '#3b82f6',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Loading dashboard…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{
      margin: 32, padding: '20px 24px', borderRadius: 12,
      background: '#fef2f2', border: '1px solid #fecaca',
      display: 'flex', alignItems: 'center', gap: 14
    }}>
      <AlertCircle size={20} color="#ef4444" />
      <span style={{ color: '#b91c1c', fontSize: 14, flex: 1 }}>{error}</span>
      <button onClick={load} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 8, border: 'none',
        background: '#ef4444', color: '#fff', fontSize: 13,
        fontWeight: 600, cursor: 'pointer'
      }}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );

  // ── Dashboard ──
  return (
    <div style={{ padding: '32px 36px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={load} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 16px', borderRadius: 10, border: '1px solid #e2e8f0',
          background: '#fff', color: '#475569', fontSize: 13,
          fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,.05)'
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20, marginBottom: 28
      }}>
        {cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 28 }}>

        {/* Revenue chart */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Revenue Trend</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>Monthly overview</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', padding: '5px 10px', borderRadius: 20 }}>
              <TrendingUp size={13} color="#10b981" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>This year</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.monthly_revenue} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip prefix="$" />} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Performance</h2>
          <ProgressRow label="Active Jobs Rate"            value={pct(data.jobs.active, data.jobs.total)}                     color="#f59e0b" />
          <ProgressRow label="Application Hire Rate"       value={pct(data.applications.hired, data.applications.total)}      color="#3b82f6" />
          <ProgressRow label="Company Verification Rate"   value={pct(data.companies.verified, data.companies.total)}         color="#10b981" />

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase' }}>Quick Numbers</p>
            {[
              { label: 'Employees', val: fmt(data.users.employees) },
              { label: 'Managers',  val: fmt(data.users.managers) },
              { label: 'Payments',  val: fmt(data.revenue.total_payments) },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applications bar chart */}
      {data.monthly_revenue?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Monthly Applications</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthly_revenue} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="applications" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;