import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';

const Settings = () => {
  const [settings, setSettings] = useState({ site_name: '', contact_email: '', maintenance_mode: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSettings();
      if (response.data.success) setSettings(response.data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await adminApi.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-4">Settings</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Settings saved successfully!</div>}

      <div className="card border-0 shadow-sm" style={{ maxWidth: 600 }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Site Name</label>
              <input
                type="text" className="form-control"
                value={settings.site_name || ''}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Contact Email</label>
              <input
                type="email" className="form-control"
                value={settings.contact_email || ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              />
            </div>
            <div className="mb-4 form-check form-switch">
              <input
                className="form-check-input" type="checkbox" id="maintenance"
                checked={settings.maintenance_mode || false}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              />
              <label className="form-check-label fw-semibold" htmlFor="maintenance">
                Maintenance Mode
              </label>
            </div>
            <button type="submit" className="btn btn-primary px-4" disabled={saving}>
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
              ) : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;