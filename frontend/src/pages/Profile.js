import React, { useState, useEffect } from 'react';
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
  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    getProfile().then(d => {
      setData(d.data);
      setSkillsInput((d.data.skills || []).join(', '));
    }).finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setData(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const fd = new FormData();
      const fields = ['full_name', 'phone', 'headline', 'summary', 'location', 'gender', 'experience_years'];
      fields.forEach(f => { if (data[f] !== undefined) fd.append(f, data[f]); });
      fd.append('skills', skillsInput);
      if (resume) fd.append('resume', resume);
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

  const initials = data?.full_name ? data.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U';

  return (
    <div className="page-content">
      <div className="page-hero">
        <h4 className="mb-1">My Profile</h4>
        <p className="text-muted mb-0">Keep your profile up to date to get better matches</p>
      </div>

      {message && (
        <div className={'alert alert-' + (message.includes('success') ? 'success' : 'danger') + ' d-flex align-items-center gap-2'}>
          <i className={'bi bi-' + (message.includes('success') ? 'check-circle' : 'exclamation-circle')} />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="profile-header-card mb-4">
          <div className="profile-avatar-lg">{initials}</div>
          <div>
            <h5 className="fw-bold mb-1">{data?.full_name || 'Your Name'}</h5>
            <p className="text-muted mb-2">{data?.headline || 'Add your headline'}</p>
            {data?.resume_url && (
              <a href={'http://localhost:5000' + data.resume_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill">
                <i className="bi bi-file-earmark-pdf me-1" />View Resume
              </a>
            )}
          </div>
        </div>

        <div className="row g-4">
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
                  <label className="form-label">Location</label>
                  <input className="form-control" value={data?.location || ''} onChange={set('location')} placeholder="City, Country" />
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
              </div>
            </div>
          </div>

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
                  <label className="form-label">Skills <span className="text-muted small">(comma separated)</span></label>
                  <input className="form-control" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="React, Node.js, Python..." />
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {skillsInput.split(',').filter(s => s.trim()).map(s => (
                      <span key={s} className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">{s.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Summary</label>
                  <textarea className="form-control" rows={4} value={data?.summary || ''} onChange={set('summary')} placeholder="Tell employers about yourself..." />
                </div>
              </div>
            </div>
          </div>

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