import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const initialForm = {
  title: '',
  description: '',
  requirements: '',
  responsibilities: '',
  employment_type: 'full_time',
  location: '',
  is_remote: false,
  salary_min: '',
  salary_max: '',
  salary_currency: 'USD',
  experience_required: 0,
  skills_required: '',
  category: '',
  openings: 1,
  status: 'draft',
  application_deadline: '',
};

const CompanyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/company/jobs`, {
        ...getAuthConfig(),
        params: filterStatus ? { status: filterStatus } : {}
      });
      setJobs(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [filterStatus]);

  const openCreate = () => {
    setEditJob(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (job) => {
    setEditJob(job);
    setForm({
      ...job,
      skills_required: Array.isArray(job.skills_required)
        ? job.skills_required.join(', ')
        : ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        skills_required: form.skills_required
          ? form.skills_required.split(',').map(s => s.trim())
          : [],
      };

      if (editJob) {
        await axios.put(`${API}/company/jobs/${editJob.id}`, payload, getAuthConfig());
      } else {
        await axios.post(`${API}/company/jobs`, payload, getAuthConfig());
      }

      setShowModal(false);
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await axios.delete(`${API}/company/jobs/${id}`, getAuthConfig());
    fetchJobs();
  };

  const inp = (field, type = 'text') => ({
    value: form[field],
    type,
    onChange: e =>
      setForm(p => ({
        ...p,
        [field]: type === 'checkbox' ? e.target.checked : e.target.value
      })),
    style: inputStyle,
  });

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h2 style={title}>Job Postings</h2>
          <p style={subtitle}>Manage your open positions</p>
        </div>
        <button onClick={openCreate} style={btnPrimary}>+ Post New Job</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        {['', 'active', 'draft', 'closed'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              ...filterBtn,
              background: filterStatus === s ? '#4f6ef7' : '#fff',
              color: filterStatus === s ? '#fff' : '#6b7280',
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {error && <div style={errorBox}>{error}</div>}

      {loading ? (
        <div style={center}>Loading…</div>
      ) : (
        <div style={card}>
          <table style={table}>
            <thead>
              <tr>
                {['Title', 'Status', 'Applications', 'Location', 'Deadline', 'Actions'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td style={td}>{job.title}</td>
                  <td style={td}><span style={badge(job.status)}>{job.status}</span></td>
                  <td style={td}>{job.application_count || 0}</td>
                  <td style={td}>{job.location || '—'}</td>
                  <td style={td}>
                    {job.application_deadline
                      ? new Date(job.application_deadline).toLocaleDateString()
                      : '—'}
                  </td>
                  <td style={td}>
                    <button style={btnEdit} onClick={() => openEdit(job)}>Edit</button>
                    <button style={btnDelete} onClick={() => handleDelete(job.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!jobs.length && (
                <tr><td colSpan={6} style={center}>No jobs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h3>{editJob ? 'Edit Job' : 'Post New Job'}</h3>

            <input {...inp('title')} placeholder="Title" />
            <textarea
  {...inp('description')}
  placeholder="Description"
  style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
/>

<textarea
  {...inp('requirements')}
  placeholder="Requirements"
  style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
/>

<textarea
  {...inp('responsibilities')}
  placeholder="Responsibilities"
  style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
/>
            <select {...inp('employment_type')}>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>

            <input {...inp('location')} placeholder="Location" />

           <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox"
                checked={form.is_remote}
                onChange={e => setForm(p => ({ ...p, is_remote: e.target.checked }))} />
              Remote Job
            </label>

            <input {...inp('salary_min', 'number')} placeholder="Min Salary" />
            <input {...inp('salary_max', 'number')} placeholder="Max Salary" />

            <select {...inp('salary_currency')}>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="EUR">EUR</option>
            </select>

            <input {...inp('experience_required', 'number')} placeholder="Experience" />
            <input {...inp('skills_required')} placeholder="Skills (React, Node)" />
            <input {...inp('category')} placeholder="Category" />
            <input {...inp('openings', 'number')} placeholder="Openings" />

            <select {...inp('status')}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="paused">Paused</option>
            </select>

            <input {...inp('application_deadline', 'date')} />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave} style={btnPrimary}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setShowModal(false)} style={btnSecondary}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyJobs;

const container = { padding: 24 };

const header = { display: 'flex', justifyContent: 'space-between', marginBottom: 20 };

const title = { fontSize: 22, fontWeight: 700 };
const subtitle = { color: '#6b7280' };

const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };

const table = { width: '100%', borderCollapse: 'collapse' };

const th = { padding: 12, background: '#f9fafb', fontSize: 12 };

const td = { padding: 12 };

const btnPrimary = { background: '#4f6ef7', color: '#fff', padding: '8px 16px', borderRadius: 8, border: 'none' };
const btnSecondary = { background: '#e5e7eb', padding: '8px 16px', borderRadius: 8 };

const btnEdit = { background: '#3b82f6', color: '#fff', marginRight: 6 };
const btnDelete = { background: '#ef4444', color: '#fff' };

const badge = (status) => ({
  padding: '4px 10px',
  borderRadius: 20,
  background: status === 'active' ? '#d1fae5' : '#fef3c7'
});

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20
};

const modal = {
  background: '#fff',
  padding: 20,
  borderRadius: 12,
  width: '100%',
  maxWidth: 600,
  maxHeight: '90vh',
  overflowY: 'auto',

  display: 'flex',
  flexDirection: 'column',
  gap: 16
};

const inputStyle = {
  width: '100%',              
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  fontSize: 14,
  boxSizing: 'border-box',    
  outline: 'none',
  background: '#fff'
};

const filterBtn = { marginRight: 8, padding: '6px 14px', borderRadius: 20 };

const errorBox = { background: '#fee2e2', padding: 10, marginBottom: 10 };

const center = { textAlign: 'center', padding: 20 };