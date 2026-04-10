
import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Save } from 'lucide-react';

export default function Settings() {
const [settings, setSettings] = useState({ site_name: '', contact_email: '', maintenance_mode: false });
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(false);

useEffect(() => { load(); }, []);

const load = async () => {
try {
setLoading(true);
const res = await adminApi.getSettings();
if (res.data.success) setSettings(res.data.data);
} catch { setError('Failed to load settings.'); }
finally { setLoading(false); }
};

const submit = async e => {
e.preventDefault();
setSaving(true);
setSuccess(false);
try {
await adminApi.updateSettings(settings);
setSuccess(true);
setTimeout(() => setSuccess(false), 3000);
} catch { setError('Failed to save settings.'); }
finally { setSaving(false); }
};

if (loading) return <div className="center-screen"><div className="spinner" /></div>;

return (
<div className="page">
<div className="page-header">
<div>
<div className="page-title">Settings</div>
<div className="page-sub">system configuration</div>
</div>
</div>

{error && <div className="alert alert-error">{error}</div>}
{success && <div className="alert alert-success">Settings saved successfully.</div>}

<div style={{ maxWidth: 560 }}>
<form onSubmit={submit}>
<div className="card" style={{ marginBottom: 16 }}>
<div className="section-label" style={{ marginBottom: 16 }}>General</div>
<div className="form-group">
<label>Site Name</label>
<input type="text" value={settings.site_name || ''} onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))} />
</div>
<div className="form-group">
<label>Contact Email</label>
<input type="email" value={settings.contact_email || ''} onChange={e => setSettings(s => ({ ...s, contact_email: e.target.value }))} />
</div>
</div>

<div className="card" style={{ marginBottom: 20 }}>
<div className="section-label" style={{ marginBottom: 16 }}>System</div>
<div className="checkbox-row">
<input type="checkbox" id="maint" checked={settings.maintenance_mode || false} onChange={e => setSettings(s => ({ ...s, maintenance_mode: e.target.checked }))} />
<label htmlFor="maint">Maintenance Mode</label>
</div>
{settings.maintenance_mode && (
<div style={{ marginTop: 10, padding: '9px 12px', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 6, fontSize: 12, color: 'var(--amber)' }}>
⚠ Site will be unavailable to regular users while maintenance mode is on.
</div>
)}
</div>

<button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 120 }}>
<Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
</button>
</form>
</div>
</div>
);
}