// src/pages/SuperAdminProfile.jsx
import React, { useState, useEffect, useCallback } from 'react';

import {
  User, Mail, Lock, Eye, EyeOff, Camera, Save,
  RefreshCw, Shield, Clock, CheckCircle, AlertCircle, Loader, Phone,
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:5000';

const ACTIVITY_LOG = [
  { action: 'Logged in',                     time: '2 minutes ago',      icon: '🔐' },
  { action: 'Updated company settings',      time: '1 hour ago',         icon: '🏢' },
  { action: 'Created new user',              time: '3 hours ago',        icon: '👤' },
  { action: 'Reviewed subscription plans',   time: 'Yesterday, 4:30 PM', icon: '📋' },
  { action: 'Approved company verification', time: 'Yesterday, 2:15 PM', icon: '✅' },
  { action: 'Password changed',              time: '3 days ago',         icon: '🔑' },
];

// function toDisplayUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http')) return url;
//   return `${BASE_URL}${url}`;
// }
function toDisplayUrl(url) {
  if (!url) return null;
  return url; // always a full URL from Supabase
}

function broadcastUser(updatedUser) {
  window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
}

export default function SuperAdminProfile() {
  const { user, setUser } = useAuth();
console.log('setUser type:', typeof setUser, '| user:', user?.email);
  const [profile, setProfile] = useState({
    full_name:  '',
    email:      user?.email || '',
    phone:      '',
    bio:        '',
    avatar_url: '',
  });

  const [passwords,       setPasswords]       = useState({ current: '', newPass: '', confirm: '' });
  const [showPw,          setShowPw]          = useState({ current: false, newPass: false, confirm: false });
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [savingPw,        setSavingPw]        = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarDisplay,   setAvatarDisplay]   = useState(null);
  const [toast,           setToast]           = useState(null);
  const [activeTab,       setActiveTab]       = useState('profile');

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProfile();
      if (res.data.success) {
        const d = res.data.data;
        setProfile({
          full_name:  d.full_name  || '',
          email:      d.email      || user?.email || '',
          phone:      d.phone      || '',
          bio:        d.bio        || '',
          avatar_url: d.avatar_url || '',
        });
        setAvatarDisplay(toDisplayUrl(d.avatar_url));
      }
    } catch {
      setProfile(p => ({ ...p, email: user?.email || '' }));
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2 MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarDisplay(ev.target.result);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/admin/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAvatarDisplay(toDisplayUrl(profile.avatar_url));
        showToast(data.message || 'Avatar upload failed', 'error');
        return;
      }
      const fullUrl = toDisplayUrl(data.avatar_url);
      const updatedUser = { ...user, avatar_url: data.avatar_url };
      setAvatarDisplay(fullUrl);
      setProfile(p => ({ ...p, avatar_url: data.avatar_url }));
      setUser(updatedUser);
      broadcastUser(updatedUser);
      showToast('Avatar updated!');
    } catch (err) {
      console.error('[Avatar upload]', err);
      setAvatarDisplay(toDisplayUrl(profile.avatar_url));
      showToast('Avatar upload failed', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    const trimmedName = profile.full_name.trim();
    if (!trimmedName) {
      showToast('Name is required', 'error');
      return;
    }
    if (trimmedName.includes('@')) {
      showToast('Full Name must be a name, not an email address', 'error');
      return;
    }
    try {
      setSaving(true);
      const res = await adminApi.updateProfile({
        full_name: trimmedName,
        email:     profile.email.trim(),
        phone:     profile.phone.trim(),
        bio:       profile.bio.trim(),
      });
      if (res.data.success) {
        const updatedUser = { ...user, full_name: trimmedName, email: profile.email.trim() };
        setUser(updatedUser);
        broadcastUser(updatedUser);
        showToast('Profile updated successfully!');
      } else {
        showToast(res.data.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      showToast('All password fields are required', 'error');
      return;
    }
    if (passwords.newPass.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    try {
      setSavingPw(true);
      const res = await adminApi.changePassword({
        current_password: passwords.current,
        new_password:     passwords.newPass,
      });
      if (res.data.success) {
        setPasswords({ current: '', newPass: '', confirm: '' });
        showToast('Password changed successfully!');
      } else {
        showToast(res.data.message || 'Failed to change password', 'error');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : (profile.email?.[0] || 'A').toUpperCase();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? 'var(--green)' : 'var(--red)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 24px rgba(0,0,0,.4)', fontSize: 13.5, fontWeight: 500,
          animation: 'slideIn .25s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-sub">Superadmin account settings</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(124,107,255,.1)', border: '1px solid rgba(124,107,255,.25)',
          padding: '6px 14px', borderRadius: 20, fontSize: 12, color: 'var(--accent)', fontWeight: 600,
        }}>
          <Shield size={13} /> SUPERADMIN
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: avatarDisplay ? 'transparent' : 'linear-gradient(135deg,var(--accent),#a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: '#fff',
            border: '3px solid var(--border)', overflow: 'hidden',
          }}>
            {avatarDisplay
              ? <img src={avatarDisplay} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <button
            onClick={() => { if (!uploadingAvatar) document.getElementById('avatar-file-input').click(); }}
            disabled={uploadingAvatar}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: '50%',
              background: uploadingAvatar ? 'var(--text3)' : 'var(--accent)',
              border: '2px solid var(--bg1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: uploadingAvatar ? 'not-allowed' : 'pointer', color: '#fff',
            }}
          >
            {uploadingAvatar
              ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
              : <Camera size={13} />}
          </button>
          <input
            id="avatar-file-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            {profile.full_name || 'Superadmin'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>{profile.email}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            {uploadingAvatar ? 'Uploading photo…' : 'Click the camera icon to update your photo'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg1)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
        {[
          { id: 'profile',  label: 'Edit Profile',    icon: User  },
          { id: 'security', label: 'Change Password', icon: Lock  },
          { id: 'activity', label: 'Activity Log',    icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, padding: '9px 16px', border: 'none', borderRadius: 7, cursor: 'pointer',
            background: activeTab === id ? 'var(--accent)' : 'transparent',
            color:      activeTab === id ? '#fff' : 'var(--text2)',
            fontWeight: activeTab === id ? 600 : 400,
            fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all .15s',
          }}>
            <Icon size={14} />
            <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card">
          <div className="section-label" style={{ marginBottom: 20 }}>Basic Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <Field label="Full Name" icon={<User size={14} />}>
              <input className="form-input" placeholder="Enter your full name"
                value={profile.full_name}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
            </Field>
            <Field label="Email Address" icon={<Mail size={14} />}>
              <input className="form-input" type="email" placeholder="admin@example.com"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </Field>
            <Field label="Phone Number" icon={<Phone size={14} />}>
              <input className="form-input" placeholder="e.g. +91 9876543210"
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </Field>
          </div>
          <Field label="Bio" icon={<User size={14} />} style={{ marginTop: 16 }}>
            <textarea className="form-input" rows={3} placeholder="A short bio about yourself…"
              value={profile.bio}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </Field>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn-ghost" onClick={loadProfile} disabled={saving}>
              <RefreshCw size={13} /> Reset
            </button>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 13, height: 13 }} /> Saving…</> : <><Save size={13} /> Save Changes</>}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <div className="section-label" style={{ marginBottom: 20 }}>Change Password</div>
          <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'current', label: 'Current Password' },
              { key: 'newPass', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <Field key={key} label={label} icon={<Lock size={14} />}>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showPw[key] ? 'text' : 'password'}
                    placeholder={label}
                    value={passwords[key]}
                    onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex' }}
                  >
                    {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>
            ))}
            {passwords.newPass && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>Password strength</div>
                <PasswordStrength password={passwords.newPass} />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button className="btn btn-ghost" onClick={() => setPasswords({ current: '', newPass: '', confirm: '' })}>
                Clear
              </button>
              <button className="btn btn-primary" onClick={handleChangePassword} disabled={savingPw}>
                {savingPw ? <><div className="spinner" style={{ width: 13, height: 13 }} /> Updating…</> : <><Lock size={13} /> Update Password</>}
              </button>
            </div>
          </div>
          <div style={{ marginTop: 28, padding: 16, background: 'rgba(124,107,255,.06)', borderRadius: 10, border: '1px solid rgba(124,107,255,.15)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>Password Tips</div>
            {['At least 8 characters long', 'Mix uppercase & lowercase', 'Include numbers and symbols', 'Avoid using personal info'].map(tip => (
              <div key={tip} style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ color: 'var(--green)' }}>✓</span> {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card">
          <div className="section-label" style={{ marginBottom: 20 }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ACTIVITY_LOG.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', borderRadius: 8,
                background: i === 0 ? 'rgba(124,107,255,.06)' : 'transparent',
                border: i === 0 ? '1px solid rgba(124,107,255,.12)' : '1px solid transparent',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
                onMouseLeave={e => e.currentTarget.style.background = i === 0 ? 'rgba(124,107,255,.06)' : 'transparent'}
              >
                <div style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: i === 0 ? 600 : 400 }}>{item.action}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{item.time}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>
            Showing last 6 activities
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        .form-input {
          width:100%; padding:9px 12px; background:var(--bg3);
          border:1px solid var(--border); border-radius:8px;
          color:var(--text); font-size:13.5px; outline:none;
          transition:border .15s; box-sizing:border-box; font-family:inherit;
        }
        .form-input:focus { border-color:var(--accent); }
        .form-label {
          display:flex; align-items:center; gap:6px;
          font-size:11.5px; font-weight:600; color:var(--text3);
          text-transform:uppercase; letter-spacing:.6px; margin-bottom:6px;
          font-family:var(--mono);
        }
        .btn-primary {
          background:var(--accent); color:#fff; border:none; cursor:pointer;
          padding:9px 18px; border-radius:8px; font-size:13px; font-weight:600;
          display:inline-flex; align-items:center; gap:6px; transition:opacity .15s;
        }
        .btn-primary:hover    { opacity:.85; }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
        .btn-ghost:disabled   { opacity:.5; cursor:not-allowed; }
      `}</style>
    </div>
  );
}

function Field({ label, icon, children, style }) {
  return (
    <div style={style}>
      <label className="form-label">{icon} {label}</label>
      {children}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const colors = ['var(--red)', 'var(--red)', 'var(--amber)', 'var(--green)'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 99,
          background: i < score ? colors[score-1] : 'var(--bg3)',
          transition: 'background .3s',
        }} />
      ))}
      <span style={{ fontSize: 11, color: colors[score-1] || 'var(--text3)', marginLeft: 8, minWidth: 40 }}>
        {score > 0 ? labels[score-1] : ''}
      </span>
    </div>
  );
}
