// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const initialForm = {
//   title: '',
//   description: '',
//   requirements: '',
//   responsibilities: '',
//   employment_type: 'full_time',
//   location: '',
//   is_remote: false,
//   salary_min: '',
//   salary_max: '',
//   salary_currency: 'USD',
//   experience_required: 0,
//   skills_required: '',
//   category: '',
//   openings: 1,
//   status: 'draft',
//   application_deadline: '',
// };

// const CompanyJobs = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editJob, setEditJob] = useState(null);
//   const [form, setForm] = useState(initialForm);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [filterStatus, setFilterStatus] = useState('');

//   const getAuthConfig = () => {
//     const token = localStorage.getItem("token");
//     return { headers: { Authorization: `Bearer ${token}` } };
//   };

//   const fetchJobs = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${API}/company/jobs`, {
//         ...getAuthConfig(),
//         params: filterStatus ? { status: filterStatus } : {}
//       });
//       setJobs(res.data.data || []);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch jobs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchJobs(); }, [filterStatus]);

//   const openCreate = () => {
//     setEditJob(null);
//     setForm(initialForm);
//     setShowModal(true);
//   };

//   const openEdit = (job) => {
//     setEditJob(job);
//     setForm({
//       ...job,
//       skills_required: Array.isArray(job.skills_required)
//         ? job.skills_required.join(', ')
//         : ''
//     });
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setError('');
//     try {
//       const payload = {
//         ...form,
//         skills_required: form.skills_required
//           ? form.skills_required.split(',').map(s => s.trim())
//           : [],
//       };

//       if (editJob) {
//         await axios.put(`${API}/company/jobs/${editJob.id}`, payload, getAuthConfig());
//       } else {
//         await axios.post(`${API}/company/jobs`, payload, getAuthConfig());
//       }

//       setShowModal(false);
//       fetchJobs();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Save failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this job?')) return;
//     await axios.delete(`${API}/company/jobs/${id}`, getAuthConfig());
//     fetchJobs();
//   };

//   const inp = (field, type = 'text') => ({
//     value: form[field],
//     type,
//     onChange: e =>
//       setForm(p => ({
//         ...p,
//         [field]: type === 'checkbox' ? e.target.checked : e.target.value
//       })),
//     style: inputStyle,
//   });

//   return (
//     <div style={container}>
//       <div style={header}>
//         <div>
//           <h2 style={title}>Job Postings</h2>
//           <p style={subtitle}>Manage your open positions</p>
//         </div>
//         <button onClick={openCreate} style={btnPrimary}>+ Post New Job</button>
//       </div>

//       <div style={{ marginBottom: 16 }}>
//         {['', 'active', 'draft', 'closed'].map(s => (
//           <button
//             key={s}
//             onClick={() => setFilterStatus(s)}
//             style={{
//               ...filterBtn,
//               background: filterStatus === s ? '#4f6ef7' : '#fff',
//               color: filterStatus === s ? '#fff' : '#6b7280',
//             }}
//           >
//             {s || 'All'}
//           </button>
//         ))}
//       </div>

//       {error && <div style={errorBox}>{error}</div>}

//       {loading ? (
//         <div style={center}>Loading…</div>
//       ) : (
//         <div style={card}>
//           <table style={table}>
//             <thead>
//               <tr>
//                 {['Title', 'Status', 'Applications', 'Location', 'Deadline', 'Actions'].map(h => (
//                   <th key={h} style={th}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {jobs.map(job => (
//                 <tr key={job.id}>
//                   <td style={td}>{job.title}</td>
//                   <td style={td}><span style={badge(job.status)}>{job.status}</span></td>
//                   <td style={td}>{job.application_count || 0}</td>
//                   <td style={td}>{job.location || '—'}</td>
//                   <td style={td}>
//                     {job.application_deadline
//                       ? new Date(job.application_deadline).toLocaleDateString()
//                       : '—'}
//                   </td>
//                   <td style={td}>
//                     <button style={btnEdit} onClick={() => openEdit(job)}>Edit</button>
//                     <button style={btnDelete} onClick={() => handleDelete(job.id)}>Delete</button>
//                   </td>
//                 </tr>
//               ))}
//               {!jobs.length && (
//                 <tr><td colSpan={6} style={center}>No jobs found</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//       {showModal && (
//         <div style={overlay}>
//           <div style={modal}>
//             <h3>{editJob ? 'Edit Job' : 'Post New Job'}</h3>

//             <input {...inp('title')} placeholder="Title" />
//             <textarea
//   {...inp('description')}
//   placeholder="Description"
//   style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
// />

// <textarea
//   {...inp('requirements')}
//   placeholder="Requirements"
//   style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
// />

// <textarea
//   {...inp('responsibilities')}
//   placeholder="Responsibilities"
//   style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
// />
//             <select {...inp('employment_type')}>
//               <option value="full_time">Full Time</option>
//               <option value="part_time">Part Time</option>
//               <option value="contract">Contract</option>
//               <option value="internship">Internship</option>
//               <option value="freelance">Freelance</option>
//             </select>

//             <input {...inp('location')} placeholder="Location" />

//            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <input type="checkbox"
//                 checked={form.is_remote}
//                 onChange={e => setForm(p => ({ ...p, is_remote: e.target.checked }))} />
//               Remote Job
//             </label>

//             <input {...inp('salary_min', 'number')} placeholder="Min Salary" />
//             <input {...inp('salary_max', 'number')} placeholder="Max Salary" />

//             <select {...inp('salary_currency')}>
//               <option value="USD">USD</option>
//               <option value="INR">INR</option>
//               <option value="EUR">EUR</option>
//             </select>

//             <input {...inp('experience_required', 'number')} placeholder="Experience" />
//             <input {...inp('skills_required')} placeholder="Skills (React, Node)" />
//             <input {...inp('category')} placeholder="Category" />
//             <input {...inp('openings', 'number')} placeholder="Openings" />

//             <select {...inp('status')}>
//               <option value="draft">Draft</option>
//               <option value="active">Active</option>
//               <option value="closed">Closed</option>
//               <option value="paused">Paused</option>
//             </select>

//             <input {...inp('application_deadline', 'date')} />

//             <div style={{ display: 'flex', gap: 10 }}>
//               <button onClick={handleSave} style={btnPrimary}>
//                 {saving ? 'Saving…' : 'Save'}
//               </button>
//               <button onClick={() => setShowModal(false)} style={btnSecondary}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CompanyJobs;

// const container = { padding: 24 };

// const header = { display: 'flex', justifyContent: 'space-between', marginBottom: 20 };

// const title = { fontSize: 22, fontWeight: 700 };
// const subtitle = { color: '#6b7280' };

// const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };

// const table = { width: '100%', borderCollapse: 'collapse' };

// const th = { padding: 12, background: '#f9fafb', fontSize: 12 };

// const td = { padding: 12 };

// const btnPrimary = { background: '#4f6ef7', color: '#fff', padding: '8px 16px', borderRadius: 8, border: 'none' };
// const btnSecondary = { background: '#e5e7eb', padding: '8px 16px', borderRadius: 8 };

// const btnEdit = { background: '#3b82f6', color: '#fff', marginRight: 6 };
// const btnDelete = { background: '#ef4444', color: '#fff' };

// const badge = (status) => ({
//   padding: '4px 10px',
//   borderRadius: 20,
//   background: status === 'active' ? '#d1fae5' : '#fef3c7'
// });

// const overlay = {
//   position: 'fixed',
//   inset: 0,
//   background: 'rgba(0,0,0,0.5)',
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
//   padding: 20
// };

// const modal = {
//   background: '#fff',
//   padding: 20,
//   borderRadius: 12,
//   width: '100%',
//   maxWidth: 600,
//   maxHeight: '90vh',
//   overflowY: 'auto',

//   display: 'flex',
//   flexDirection: 'column',
//   gap: 16
// };

// const inputStyle = {
//   width: '100%',              
//   padding: '10px 12px',
//   border: '1px solid #e5e7eb',
//   borderRadius: 6,
//   fontSize: 14,
//   boxSizing: 'border-box',    
//   outline: 'none',
//   background: '#fff'
// };

// const filterBtn = { marginRight: 8, padding: '6px 14px', borderRadius: 20 };

// const errorBox = { background: '#fee2e2', padding: 10, marginBottom: 10 };

// const center = { textAlign: 'center', padding: 20 };
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthConfig = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const initialForm = {
  title: '', description: '', requirements: '', responsibilities: '',
  employment_type: 'full_time', location: '', is_remote: false,
  salary_min: '', salary_max: '', salary_currency: 'USD',
  experience_required: 0, skills_required: '', category: '',
  openings: 1, status: 'draft', application_deadline: '',
};

// ── Status badge ──────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    active:  { bg: '#d1fae5', color: '#065f46' },
    draft:   { bg: '#fef3c7', color: '#92400e' },
    closed:  { bg: '#fee2e2', color: '#991b1b' },
    paused:  { bg: '#e0e7ff', color: '#3730a3' },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color, textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
};

// ── Label ─────────────────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  }}>
    {children}
  </div>
);

// ── Field ─────────────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
  borderRadius: 8, fontSize: 14, color: '#1a1f36',
  boxSizing: 'border-box', outline: 'none', background: '#fafafa',
};

// ── Main ──────────────────────────────────────────────────────────────────────
const CompanyJobs = () => {
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editJob, setEditJob]       = useState(null);
  const [form, setForm]             = useState(initialForm);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/company/jobs`, {
        ...getAuthConfig(),
        params: filterStatus ? { status: filterStatus } : {},
      });
      setJobs(res.data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [filterStatus]);

  const openCreate = () => { setEditJob(null); setForm(initialForm); setShowModal(true); };
  const openEdit   = (job) => {
    setEditJob(job);
    setForm({ ...job, skills_required: Array.isArray(job.skills_required) ? job.skills_required.join(', ') : '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        skills_required: form.skills_required
          ? form.skills_required.split(',').map(s => s.trim()).filter(Boolean)
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
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await axios.delete(`${API}/company/jobs/${id}`, getAuthConfig());
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const inp = (field, type = 'text') => ({
    value: form[field],
    type,
    onChange: e => setForm(p => ({ ...p, [field]: type === 'checkbox' ? e.target.checked : e.target.value })),
    style: inputStyle,
  });

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1f36', margin: 0 }}>Job Postings</h2>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Manage your open positions</p>
        </div>
        <button onClick={openCreate} style={{
          background: '#4f6ef7', color: '#fff', padding: '10px 20px',
          borderRadius: 10, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 14, boxShadow: '0 2px 8px rgba(79,110,247,0.3)',
        }}>
          + Post New Job
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['', 'All'], ['active', 'Active'], ['draft', 'Draft'], ['closed', 'Closed']].map(([val, label]) => (
          <button key={val} onClick={() => setFilterStatus(val)} style={{
            padding: '6px 16px', borderRadius: 20, border: '1.5px solid',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
            borderColor: filterStatus === val ? '#4f6ef7' : '#e5e7eb',
            background: filterStatus === val ? '#4f6ef7' : '#fff',
            color: filterStatus === val ? '#fff' : '#6b7280',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: '#fee2e2', color: '#991b1b', padding: '10px 14px',
          borderRadius: 8, marginBottom: 12, fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Loading…</div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Title', 'Status', 'Applications', 'Location', 'Deadline', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: 11, color: '#6b7280', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <tr
                  key={job.id}
                  style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '13px 16px', fontWeight: 600, color: '#1a1f36' }}>
                    {job.title}
                    {job.is_remote && (
                      <span style={{
                        marginLeft: 6, fontSize: 10, fontWeight: 700,
                        background: '#ede9fe', color: '#5b21b6',
                        padding: '1px 7px', borderRadius: 10,
                      }}>Remote</span>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <Badge status={job.status} />
                  </td>
                  <td style={{ padding: '13px 16px', color: '#374151' }}>
                    {job.application_count || 0}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 13 }}>
                    {job.location || '—'}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 13 }}>
                    {job.application_deadline
                      ? new Date(job.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <button
                      onClick={() => openEdit(job)}
                      style={{
                        padding: '5px 14px', borderRadius: 7, border: '1.5px solid #3b82f6',
                        background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, marginRight: 8,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      style={{
                        padding: '5px 14px', borderRadius: 7, border: '1.5px solid #ef4444',
                        background: '#fff0f0', color: '#dc2626', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600,
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!jobs.length && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                    No jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: 20, zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, width: '100%', maxWidth: 620,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1,
            }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1a1f36' }}>
                {editJob ? 'Edit Job Posting' : 'Post New Job'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
                color: '#9ca3af', lineHeight: 1, padding: '0 4px',
              }}>×</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  ⚠️ {error}
                </div>
              )}

              <Field label="Job Title *">
                <input {...inp('title')} placeholder="e.g. Senior React Developer" />
              </Field>

              <Field label="Description">
                <textarea {...inp('description')} placeholder="Job overview and responsibilities…"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Requirements">
                  <textarea {...inp('requirements')} placeholder="Required skills…"
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} />
                </Field>
                <Field label="Responsibilities">
                  <textarea {...inp('responsibilities')} placeholder="Day to day tasks…"
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Employment Type">
                  <select {...inp('employment_type')}>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select {...inp('status')}>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="paused">Paused</option>
                  </select>
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Location">
                  <input {...inp('location')} placeholder="City or Remote" />
                </Field>
                <Field label="Category">
                  <input {...inp('category')} placeholder="e.g. Engineering" />
                </Field>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                <input type="checkbox" checked={form.is_remote}
                  onChange={e => setForm(p => ({ ...p, is_remote: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: '#4f6ef7' }} />
                Remote position
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <Field label="Min Salary">
                  <input {...inp('salary_min', 'number')} placeholder="0" />
                </Field>
                <Field label="Max Salary">
                  <input {...inp('salary_max', 'number')} placeholder="0" />
                </Field>
                <Field label="Currency">
                  <select {...inp('salary_currency')}>
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Experience (years)">
                  <input {...inp('experience_required', 'number')} placeholder="0" />
                </Field>
                <Field label="Openings">
                  <input {...inp('openings', 'number')} placeholder="1" />
                </Field>
              </div>

              <Field label="Skills (comma separated)">
                <input {...inp('skills_required')} placeholder="React, Node.js, PostgreSQL" />
              </Field>

              <Field label="Application Deadline">
                <input {...inp('application_deadline', 'date')} />
              </Field>
            </div>

            {/* Modal footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: 10, justifyContent: 'flex-end',
              position: 'sticky', bottom: 0, background: '#fff',
            }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e5e7eb',
                background: '#fff', color: '#374151', cursor: 'pointer',
                fontWeight: 600, fontSize: 14,
              }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '9px 24px', borderRadius: 9, border: 'none',
                background: saving ? '#818cf8' : '#4f6ef7', color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700,
                fontSize: 14, boxShadow: '0 2px 8px rgba(79,110,247,0.3)',
              }}>
                {saving ? 'Saving…' : editJob ? 'Update Job' : 'Post Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyJobs;