
import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { setProfile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [resume, setResume] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [certs, setCerts] = useState([]);
  const avatarRef = useRef();

  useEffect(() => {
    getProfile().then(d => {
      setData(d.data);
      setSkillsInput((d.data.skills || []).join(', '));
      setCerts(d.data.certifications || []);
      if (d.data.avatar_url) setAvatarPreview('http://localhost:5000' + d.data.avatar_url);
    }).finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setData(prev => ({ ...prev, [k]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const addCert = () => {
    const trimmed = certInput.trim();
    if (trimmed && !certs.includes(trimmed)) {
      setCerts(prev => [...prev, trimmed]);
      setCertInput('');
    }
  };

  const removeCert = (c) => setCerts(prev => prev.filter(x => x !== c));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const fd = new FormData();
      const fields = ['full_name', 'phone', 'headline', 'summary', 'location', 'gender',
        'experience_years', 'date_of_birth', 'linkedin_url', 'github_url', 'portfolio_url'];
      fields.forEach(f => { if (data[f] !== undefined && data[f] !== null) fd.append(f, data[f]); });
      fd.append('skills', skillsInput);
      fd.append('certifications', JSON.stringify(certs));
      if (resume) fd.append('resume', resume);
      if (avatar) fd.append('avatar', avatar);
      const res = await updateProfile(fd);
      setData(res.data);
      setProfile(res.data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Update failed: ' + err.message);
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  const initials = data?.full_name
    ? data.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="page-content">
      <div className="page-hero">
        <h4 className="mb-1" style={{ color: 'black' }}>My Profile</h4>
        <p className="text-muted mb-0">Keep your profile up to date to get better matches</p>
      </div>

      {message && (
        <div className={'alert alert-' + (message.includes('success') ? 'success' : 'danger') + ' d-flex align-items-center gap-2'}>
          <i className={'bi bi-' + (message.includes('success') ? 'check-circle' : 'exclamation-circle')} />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ── Avatar + header ── */}
        <div className="profile-header-card mb-4">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {avatarPreview
              ? <img src={avatarPreview} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e7eb' }} />
              : <div className="profile-avatar-lg" style={{ width: 80, height: 80, fontSize: 28 }}>{initials}</div>}
            <button
              type="button"
              onClick={() => avatarRef.current.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                background: '#6366f1', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff', fontSize: 12
              }}
            >
              <i className="bi bi-camera-fill" style={{ fontSize: 11 }} />
            </button>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h5 className="fw-bold mb-1">{data?.full_name || 'Your Name'}</h5>
            <p className="text-muted mb-1">{data?.headline || 'Add your headline'}</p>
            <p className="text-muted small mb-2"><i className="bi bi-geo-alt me-1" />{data?.location || 'Add location'}</p>
            {data?.resume_url && (
              <a href={'http://localhost:5000' + data.resume_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill">
                <i className="btn btn-sm btn-outline-primary text-dark rounded-pill" />View Resume
              </a>
            )}
          </div>
        </div>

        <div className="row g-4">
          {/* ── Personal Info ── */}
          <div className="col-12">
            <div className="form-section">
              <h6 className="form-section-title"><i className="bi bi-person me-2" />Personal Information</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={data?.full_name || ''} onChange={set('full_name')} placeholder="Your full name" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={data?.phone || ''} onChange={set('phone')} placeholder="+91 98765 43210" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" value={data?.date_of_birth?.slice(0, 10) || ''} onChange={set('date_of_birth')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={data?.gender || ''} onChange={set('gender')}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <input className="form-control" value={data?.location || ''} onChange={set('location')} placeholder="City, Country" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Professional Info ── */}
          <div className="col-12">
            <div className="form-section">
              <h6 className="form-section-title"><i className="bi bi-briefcase me-2" />Professional Info</h6>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Headline</label>
                  <input className="form-control" value={data?.headline || ''} onChange={set('headline')} placeholder="e.g. Senior React Developer | 5 years experience" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Years of Experience</label>
                  <input type="number" className="form-control" value={data?.experience_years || ''} onChange={set('experience_years')} min={0} max={50} />
                </div>
                <div className="col-12">
                  <label className="form-label">Summary</label>
                  <textarea className="form-control" rows={4} value={data?.summary || ''} onChange={set('summary')} placeholder="Tell employers about yourself..." />
                </div>
                <div className="col-12">
                  <label className="form-label">Skills <span className="text-muted small">(comma separated)</span></label>
                  <input className="form-control" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="React, Node.js, Python..." />
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {skillsInput.split(',').filter(s => s.trim()).map(s => (
                      <span key={s} className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">{s.trim()}</span>
                    ))}
                  </div>
                </div>

                {/* ── Certifications ── */}
                <div className="col-12">
                  <label className="form-label">Certifications</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      value={certInput}
                      onChange={e => setCertInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())}
                      placeholder="e.g. AWS Certified Developer, Google UX Design..."
                    />
                    <button type="button" className="btn btn-outline-primary" onClick={addCert}>Add</button>
                  </div>
                  {certs.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {certs.map(c => (
                        <span key={c} className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 d-flex align-items-center gap-1">
                          <i className="bi bi-patch-check-fill" style={{ fontSize: 11 }} />
                          {c}
                          <button type="button" onClick={() => removeCert(c)} style={{ background: 'none', border: 'none', padding: 0, lineHeight: 1, color: 'inherit', cursor: 'pointer', marginLeft: 4 }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Social Links ── */}
          <div className="col-12">
            <div className="form-section">
              <h6 className="form-section-title"><i className="bi bi-link-45deg me-2" />Social & Portfolio Links</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label"><i className="bi bi-linkedin me-1 text-primary" />LinkedIn</label>
                  <input className="form-control" value={data?.linkedin_url || ''} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/yourname" />
                </div>
                <div className="col-md-4">
                  <label className="form-label"><i className="bi bi-github me-1" />GitHub</label>
                  <input className="form-control" value={data?.github_url || ''} onChange={set('github_url')} placeholder="https://github.com/yourname" />
                </div>
                <div className="col-md-4">
                  <label className="form-label"><i className="bi bi-globe me-1 text-success" />Portfolio</label>
                  <input className="form-control" value={data?.portfolio_url || ''} onChange={set('portfolio_url')} placeholder="https://yourportfolio.com" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Resume ── */}
          <div className="col-12">
            <div className="form-section">
              <h6 className="form-section-title"><i className="bi bi-file-earmark-pdf me-2" />Resume</h6>
              <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} />
              <div className="form-text">Upload PDF or Word document (max 5MB)</div>
            </div>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5" disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check2 me-2" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;