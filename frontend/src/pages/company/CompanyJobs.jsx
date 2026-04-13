
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const getAuthConfig = () => {
//   const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//   return { headers: { Authorization: `Bearer ${token}` } };
// };

// const initialForm = {
//   title: '', description: '', requirements: '', responsibilities: '',
//   employment_type: 'full_time', location: '', is_remote: false,
//   salary_min: '', salary_max: '', salary_currency: 'USD',
//   experience_required: 0, skills_required: '', category: '',
//   openings: 1, status: 'draft', application_deadline: '',
// };

// const Badge = ({ status }) => {
//   const map = {
//     active:  { bg: '#d1fae5', color: '#065f46' },
//     draft:   { bg: '#fef3c7', color: '#92400e' },
//     closed:  { bg: '#fee2e2', color: '#991b1b' },
//     paused:  { bg: '#e0e7ff', color: '#3730a3' },
//   };
//   const s = map[status] || { bg: '#f3f4f6', color: '#374151' };
//   return (
//     <span style={{
//       padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
//       background: s.bg, color: s.color, textTransform: 'capitalize',
//     }}>
//       {status}
//     </span>
//   );
// };
// const Label = ({ children }) => (
//   <div style={{
//     fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4,
//     textTransform: 'uppercase', letterSpacing: '0.5px',
//   }}>
//     {children}
//   </div>
// );
// const Field = ({ label, children }) => (
//   <div>
//     <Label>{label}</Label>
//     {children}
//   </div>
// );

// const inputStyle = {
//   width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
//   borderRadius: 8, fontSize: 14, color: '#1a1f36',
//   boxSizing: 'border-box', outline: 'none', background: '#fafafa',
// };

// const CompanyJobs = () => {
//   const [jobs, setJobs]             = useState([]);
//   const [loading, setLoading]       = useState(true);
//   const [showModal, setShowModal]   = useState(false);
//   const [editJob, setEditJob]       = useState(null);
//   const [form, setForm]             = useState(initialForm);
//   const [saving, setSaving]         = useState(false);
//   const [error, setError]           = useState('');
//   const [filterStatus, setFilterStatus] = useState('');

//   const fetchJobs = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${API}/company/jobs`, {
//         ...getAuthConfig(),
//         params: filterStatus ? { status: filterStatus } : {},
//       });
//       setJobs(res.data.data || []);
//       setError('');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch jobs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchJobs(); }, [filterStatus]);

//   const openCreate = () => { setEditJob(null); setForm(initialForm); setShowModal(true); };
//   const openEdit   = (job) => {
//     setEditJob(job);
//     setForm({ ...job, skills_required: Array.isArray(job.skills_required) ? job.skills_required.join(', ') : '' });
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     if (!form.title.trim()) { setError('Title is required'); return; }
//     setSaving(true); setError('');
//     try {
//       const payload = {
//         ...form,
//         skills_required: form.skills_required
//           ? form.skills_required.split(',').map(s => s.trim()).filter(Boolean)
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
//     if (!window.confirm('Delete this job posting?')) return;
//     try {
//       await axios.delete(`${API}/company/jobs/${id}`, getAuthConfig());
//       fetchJobs();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Delete failed');
//     }
//   };

//   const inp = (field, type = 'text') => ({
//     value: form[field],
//     type,
//     onChange: e => setForm(p => ({ ...p, [field]: type === 'checkbox' ? e.target.checked : e.target.value })),
//     style: inputStyle,
//   });

//   return (
//     <div>
     
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
//         <div>
//           <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1f36', margin: 0 }}>Job Postings</h2>
//           <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Manage your open positions</p>
//         </div>
//         <button onClick={openCreate} style={{
//           background: '#4f6ef7', color: '#fff', padding: '10px 20px',
//           borderRadius: 10, border: 'none', cursor: 'pointer',
//           fontWeight: 700, fontSize: 14, boxShadow: '0 2px 8px rgba(79,110,247,0.3)',
//         }}>
//           + Post New Job
//         </button>
//       </div>

//       {/* ── Filter tabs ── */}
//       <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
//         {[['', 'All'], ['active', 'Active'], ['draft', 'Draft'], ['closed', 'Closed']].map(([val, label]) => (
//           <button key={val} onClick={() => setFilterStatus(val)} style={{
//             padding: '6px 16px', borderRadius: 20, border: '1.5px solid',
//             cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
//             borderColor: filterStatus === val ? '#4f6ef7' : '#e5e7eb',
//             background: filterStatus === val ? '#4f6ef7' : '#fff',
//             color: filterStatus === val ? '#fff' : '#6b7280',
//           }}>
//             {label}
//           </button>
//         ))}
//       </div>

//       {/* ── Error ── */}
//       {error && (
//         <div style={{
//           background: '#fee2e2', color: '#991b1b', padding: '10px 14px',
//           borderRadius: 8, marginBottom: 12, fontSize: 13,
//         }}>
//           ⚠️ {error}
//         </div>
//       )}

//       {/* ── Table ── */}
//       {loading ? (
//         <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Loading…</div>
//       ) : (
//         <div style={{
//           background: '#fff', borderRadius: 12,
//           boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden',
//         }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <thead>
//               <tr style={{ background: '#f9fafb' }}>
//                 {['Title', 'Status', 'Applications', 'Location', 'Deadline', 'Actions'].map(h => (
//                   <th key={h} style={{
//                     padding: '11px 16px', textAlign: 'left',
//                     fontSize: 11, color: '#6b7280', fontWeight: 700,
//                     textTransform: 'uppercase', letterSpacing: '0.5px',
//                     borderBottom: '1px solid #f3f4f6',
//                   }}>
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {jobs.map((job, i) => (
//                 <tr
//                   key={job.id}
//                   style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}
//                   onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
//                   onMouseLeave={e => e.currentTarget.style.background = ''}
//                 >
//                   <td style={{ padding: '13px 16px', fontWeight: 600, color: '#1a1f36' }}>
//                     {job.title}
//                     {job.is_remote && (
//                       <span style={{
//                         marginLeft: 6, fontSize: 10, fontWeight: 700,
//                         background: '#ede9fe', color: '#5b21b6',
//                         padding: '1px 7px', borderRadius: 10,
//                       }}>Remote</span>
//                     )}
//                   </td>
//                   <td style={{ padding: '13px 16px' }}>
//                     <Badge status={job.status} />
//                   </td>
//                   <td style={{ padding: '13px 16px', color: '#374151' }}>
//                     {job.application_count || 0}
//                   </td>
//                   <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 13 }}>
//                     {job.location || '—'}
//                   </td>
//                   <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 13 }}>
//                     {job.application_deadline
//                       ? new Date(job.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
//                       : '—'}
//                   </td>
//                   <td style={{ padding: '13px 16px' }}>
//                     <button
//                       onClick={() => openEdit(job)}
//                       style={{
//                         padding: '5px 14px', borderRadius: 7, border: '1.5px solid #3b82f6',
//                         background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer',
//                         fontSize: 13, fontWeight: 600, marginRight: 8,
//                       }}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(job.id)}
//                       style={{
//                         padding: '5px 14px', borderRadius: 7, border: '1.5px solid #ef4444',
//                         background: '#fff0f0', color: '#dc2626', cursor: 'pointer',
//                         fontSize: 13, fontWeight: 600,
//                       }}
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {!jobs.length && (
//                 <tr>
//                   <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
//                     No jobs found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

    
//       {showModal && (
//         <div style={{
//           position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
//           display: 'flex', justifyContent: 'center', alignItems: 'center',
//           padding: 20, zIndex: 1000,
//         }}>
//           <div style={{
//             background: '#fff', borderRadius: 14, width: '100%', maxWidth: 620,
//             maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
//           }}>
          
//             <div style={{
//               padding: '18px 24px', borderBottom: '1px solid #f3f4f6',
//               display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//               position: 'sticky', top: 0, background: '#fff', zIndex: 1,
//             }}>
//               <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1a1f36' }}>
//                 {editJob ? 'Edit Job Posting' : 'Post New Job'}
//               </h3>
//               <button onClick={() => setShowModal(false)} style={{
//                 background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
//                 color: '#9ca3af', lineHeight: 1, padding: '0 4px',
//               }}>×</button>
//             </div>
//             <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
//               {error && (
//                 <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
//                   ⚠️ {error}
//                 </div>
//               )}

//               <Field label="Job Title *">
//                 <input {...inp('title')} placeholder="e.g. Senior React Developer" />
//               </Field>

//               <Field label="Description">
//                 <textarea {...inp('description')} placeholder="Job overview and responsibilities…"
//                   style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
//               </Field>

//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//                 <Field label="Requirements">
//                   <textarea {...inp('requirements')} placeholder="Required skills…"
//                     style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} />
//                 </Field>
//                 <Field label="Responsibilities">
//                   <textarea {...inp('responsibilities')} placeholder="Day to day tasks…"
//                     style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} />
//                 </Field>
//               </div>

//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//                 <Field label="Employment Type">
//                   <select {...inp('employment_type')}>
//                     <option value="full_time">Full Time</option>
//                     <option value="part_time">Part Time</option>
//                     <option value="contract">Contract</option>
//                     <option value="internship">Internship</option>
//                     <option value="freelance">Freelance</option>
//                   </select>
//                 </Field>
//                 <Field label="Status">
//                   <select {...inp('status')}>
//                     <option value="draft">Draft</option>
//                     <option value="active">Active</option>
//                     <option value="closed">Closed</option>
//                     <option value="paused">Paused</option>
//                   </select>
//                 </Field>
//               </div>

//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//                 <Field label="Location">
//                   <input {...inp('location')} placeholder="City or Remote" />
//                 </Field>
//                 <Field label="Category">
//                   <input {...inp('category')} placeholder="e.g. Engineering" />
//                 </Field>
//               </div>

//               <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
//                 <input type="checkbox" checked={form.is_remote}
//                   onChange={e => setForm(p => ({ ...p, is_remote: e.target.checked }))}
//                   style={{ width: 16, height: 16, accentColor: '#4f6ef7' }} />
//                 Remote position
//               </label>

//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
//                 <Field label="Min Salary">
//                   <input {...inp('salary_min', 'number')} placeholder="0" />
//                 </Field>
//                 <Field label="Max Salary">
//                   <input {...inp('salary_max', 'number')} placeholder="0" />
//                 </Field>
//                 <Field label="Currency">
//                   <select {...inp('salary_currency')}>
//                     <option value="USD">USD</option>
//                     <option value="INR">INR</option>
//                     <option value="EUR">EUR</option>
//                     <option value="GBP">GBP</option>
//                   </select>
//                 </Field>
//               </div>

//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//                 <Field label="Experience (years)">
//                   <input {...inp('experience_required', 'number')} placeholder="0" />
//                 </Field>
//                 <Field label="Openings">
//                   <input {...inp('openings', 'number')} placeholder="1" />
//                 </Field>
//               </div>

//               <Field label="Skills (comma separated)">
//                 <input {...inp('skills_required')} placeholder="React, Node.js, PostgreSQL" />
//               </Field>

//               <Field label="Application Deadline">
//                 <input {...inp('application_deadline', 'date')} />
//               </Field>
//             </div>

           
//             <div style={{
//               padding: '16px 24px', borderTop: '1px solid #f3f4f6',
//               display: 'flex', gap: 10, justifyContent: 'flex-end',
//               position: 'sticky', bottom: 0, background: '#fff',
//             }}>
//               <button onClick={() => setShowModal(false)} style={{
//                 padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e5e7eb',
//                 background: '#fff', color: '#374151', cursor: 'pointer',
//                 fontWeight: 600, fontSize: 14,
//               }}>
//                 Cancel
//               </button>
//               <button onClick={handleSave} disabled={saving} style={{
//                 padding: '9px 24px', borderRadius: 9, border: 'none',
//                 background: saving ? '#818cf8' : '#4f6ef7', color: '#fff',
//                 cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700,
//                 fontSize: 14, boxShadow: '0 2px 8px rgba(79,110,247,0.3)',
//               }}>
//                 {saving ? 'Saving…' : editJob ? 'Update Job' : 'Post Job'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CompanyJobs;
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

/* ─── Tokens ─────────────────────────────────────────────── */
const color = {
  primary:   '#4f6ef7',
  primaryBg: '#eef1fe',
  text:      '#111827',
  muted:     '#6b7280',
  hint:      '#9ca3af',
  border:    'rgba(0,0,0,0.07)',
  surface:   '#ffffff',
  page:      '#f7f8fc',
};

const radius = { sm: 8, md: 10, lg: 14, pill: 99 };

/* ─── StatusPill ─────────────────────────────────────────── */
const STATUS = {
  active: { bg: '#EAF3DE', text: '#3B6D11' },
  draft:  { bg: '#FAEEDA', text: '#854F0B' },
  closed: { bg: '#FCEBEB', text: '#A32D2D' },
};

const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.closed;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px',
      borderRadius: radius.pill, fontSize: 11, fontWeight: 500,
      background: s.bg, color: s.text,
    }}>
      {status}
    </span>
  );
};

/* ─── FormField ──────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: color.muted }}>{label}</label>
    {children}
  </div>
);

const inputSx = {
  width: '100%', padding: '9px 12px',
  border: `0.5px solid rgba(0,0,0,0.15)`,
  borderRadius: radius.sm, fontSize: 13,
  color: color.text, background: '#fff',
  outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const Inp = ({ field, form, setForm, type = 'text', placeholder }) => (
  <input
    type={type}
    value={form[field]}
    placeholder={placeholder}
    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
    style={inputSx}
  />
);

const Txa = ({ field, form, setForm, placeholder, rows = 3 }) => (
  <textarea
    rows={rows}
    value={form[field]}
    placeholder={placeholder}
    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
    style={{ ...inputSx, resize: 'vertical', lineHeight: 1.6 }}
  />
);

const Sel = ({ field, form, setForm, options }) => (
  <select
    value={form[field]}
    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
    style={{ ...inputSx, cursor: 'pointer' }}
  >
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

/* ─── JobCard (mobile) ───────────────────────────────────── */
const JobCard = ({ job, onEdit, onDelete }) => (
  <div style={{
    background: color.surface, border: `0.5px solid ${color.border}`,
    borderRadius: radius.md, padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: 10,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: color.text }}>{job.title}</div>
        <div style={{ fontSize: 12, color: color.muted, marginTop: 2 }}>
          {job.location || 'No location'} {job.is_remote ? '· Remote' : ''}
        </div>
      </div>
      <StatusPill status={job.status} />
    </div>
    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: color.muted }}>
      <span>📋 {job.application_count || 0} applications</span>
      {job.application_deadline && (
        <span>⏳ {new Date(job.application_deadline).toLocaleDateString()}</span>
      )}
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => onEdit(job)} style={btnEdit}>Edit</button>
      <button onClick={() => onDelete(job.id)} style={btnDeleteSx}>Delete</button>
    </div>
  </div>
);

/* ─── Buttons ────────────────────────────────────────────── */
const btnEdit = {
  padding: '6px 14px', borderRadius: radius.sm, fontSize: 12, fontWeight: 500,
  background: '#eef1fe', color: color.primary, border: `0.5px solid #c7d0fd`,
  cursor: 'pointer',
};
const btnDeleteSx = {
  padding: '6px 14px', borderRadius: radius.sm, fontSize: 12, fontWeight: 500,
  background: '#FCEBEB', color: '#A32D2D', border: `0.5px solid #F09595`,
  cursor: 'pointer',
};

/* ─── Main Component ─────────────────────────────────────── */
const CompanyJobs = () => {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob]     = useState(null);
  const [form, setForm]           = useState(initialForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [filterStatus, setFilter] = useState('');
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/company/jobs`, {
        ...getAuth(),
        params: filterStatus ? { status: filterStatus } : {},
      });
      setJobs(res.data.data || []);
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
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        skills_required: form.skills_required
          ? form.skills_required.split(',').map(s => s.trim()) : [],
      };
      if (editJob) {
        await axios.put(`${API}/company/jobs/${editJob.id}`, payload, getAuth());
      } else {
        await axios.post(`${API}/company/jobs`, payload, getAuth());
      }
      setShowModal(false); fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await axios.delete(`${API}/company/jobs/${id}`, getAuth());
    fetchJobs();
  };

  const filters = ['', 'active', 'draft', 'closed'];

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem',
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: color.text, margin: 0 }}>Job postings</h2>
          <p style={{ fontSize: 14, color: color.muted, marginTop: 4 }}>Manage your open positions</p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: radius.pill,
            background: color.primary, color: '#fff',
            border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Post a job
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: '1rem' }}>
        {filters.map(s => {
          const active = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '5px 14px', borderRadius: radius.pill, fontSize: 12,
                fontWeight: 500, cursor: 'pointer',
                border: active ? 'none' : `0.5px solid ${color.border}`,
                background: active ? color.primary : color.surface,
                color: active ? '#fff' : color.muted,
              }}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          );
        })}
        <span style={{
          marginLeft: 'auto', fontSize: 12, color: color.hint,
          alignSelf: 'center',
        }}>
          {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
        </span>
      </div>
      {error && (
        <div style={{
          background: '#FCEBEB', border: '0.5px solid #F09595',
          color: '#A32D2D', borderRadius: radius.md,
          padding: '10px 14px', fontSize: 13, marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: color.muted, fontSize: 14 }}>
          Loading…
        </div>
      ) : jobs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem 1rem',
          background: color.surface, border: `0.5px solid ${color.border}`,
          borderRadius: radius.lg,
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 14, color: color.muted }}>No jobs found</div>
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div style={{
          background: color.surface, border: `0.5px solid ${color.border}`,
          borderRadius: radius.lg, overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Title', 'Status', 'Applications', 'Location', 'Deadline', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: 11, fontWeight: 500, color: color.muted,
                      letterSpacing: '0.04em', textTransform: 'uppercase',
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
                    style={{ borderTop: `0.5px solid ${color.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: color.text }}>{job.title}</div>
                      {job.is_remote && (
                        <span style={{ fontSize: 11, color: color.primary }}>Remote</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <StatusPill status={job.status} />
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: color.text }}>
                      {job.application_count || 0}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: color.muted }}>
                      {job.location || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: color.muted }}>
                      {job.application_deadline
                        ? new Date(job.application_deadline).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 7 }}>
                        <button style={btnEdit} onClick={() => openEdit(job)}>Edit</button>
                        <button style={btnDeleteSx} onClick={() => handleDelete(job.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: color.surface, borderRadius: radius.lg,
            width: '100%', maxWidth: 540,
            maxHeight: '90vh', overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: color.text, margin: 0 }}>
                {editJob ? 'Edit job' : 'Post a new job'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: color.muted, fontSize: 20, lineHeight: 1, padding: 4,
                }}
              >
                ×
              </button>
            </div>

            {error && (
              <div style={{
                background: '#FCEBEB', color: '#A32D2D',
                border: '0.5px solid #F09595',
                borderRadius: radius.sm, padding: '8px 12px', fontSize: 13,
              }}>
                {error}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Job title *">
                  <Inp field="title" form={form} setForm={setForm} placeholder="e.g. Senior Frontend Engineer" />
                </Field>
              </div>

              <Field label="Employment type">
                <Sel field="employment_type" form={form} setForm={setForm} options={[
                  ['full_time','Full time'],['part_time','Part time'],
                  ['contract','Contract'],['internship','Internship'],
                ]} />
              </Field>

              <Field label="Status">
                <Sel field="status" form={form} setForm={setForm} options={[
                  ['draft','Draft'],['active','Active'],['closed','Closed'],
                ]} />
              </Field>

              <Field label="Location">
                <Inp field="location" form={form} setForm={setForm} placeholder="City or country" />
              </Field>

              <Field label="Openings">
                <Inp field="openings" form={form} setForm={setForm} type="number" placeholder="1" />
              </Field>

              <Field label="Min salary">
                <Inp field="salary_min" form={form} setForm={setForm} type="number" placeholder="e.g. 50000" />
              </Field>

              <Field label="Max salary">
                <Inp field="salary_max" form={form} setForm={setForm} type="number" placeholder="e.g. 80000" />
              </Field>

              <Field label="Experience (years)">
                <Inp field="experience_required" form={form} setForm={setForm} type="number" placeholder="0" />
              </Field>

              <Field label="Application deadline">
                <Inp field="application_deadline" form={form} setForm={setForm} type="date" />
              </Field>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Skills required (comma separated)">
                  <Inp field="skills_required" form={form} setForm={setForm} placeholder="React, Node.js, SQL…" />
                </Field>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Description">
                  <Txa field="description" form={form} setForm={setForm} placeholder="What is this role about?" />
                </Field>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Requirements">
                  <Txa field="requirements" form={form} setForm={setForm} placeholder="Qualifications and must-haves" />
                </Field>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Responsibilities">
                  <Txa field="responsibilities" form={form} setForm={setForm} placeholder="Day-to-day duties" />
                </Field>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: color.text }}>
                  <input
                    type="checkbox"
                    checked={form.is_remote}
                    onChange={e => setForm(p => ({ ...p, is_remote: e.target.checked }))}
                    style={{ width: 14, height: 14, accentColor: color.primary }}
                  />
                  This is a remote position
                </label>
              </div>
            </div>
            <div style={{
              display: 'flex', gap: 10, justifyContent: 'flex-end',
              borderTop: `0.5px solid ${color.border}`, paddingTop: '1rem',
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '9px 18px', borderRadius: radius.sm, fontSize: 13,
                  fontWeight: 500, cursor: 'pointer',
                  background: '#f3f4f6', color: color.muted, border: 'none',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '9px 22px', borderRadius: radius.sm, fontSize: 13,
                  fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
                  background: saving ? '#a5b4fc' : color.primary,
                  color: '#fff', border: 'none',
                }}
              >
                {saving ? 'Saving…' : editJob ? 'Update job' : 'Post job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyJobs;