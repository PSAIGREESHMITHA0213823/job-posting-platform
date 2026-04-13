
// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const getAuth = () => ({
//   headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
// });


// const InfoRow = ({ icon, label, value }) => (
//   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//     <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
//       <span>{icon}</span> {label}
//     </span>
//     <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{value}</span>
//   </div>
// );
// const timeAgo = (date) => {
//   const diff = Date.now() - new Date(date);
//   const d = Math.floor(diff / 86400000);
//   if (d === 0) return 'Today';
//   if (d === 1) return '1 day ago';
//   if (d < 30) return `${d} days ago`;
//   if (d < 365) return `${Math.floor(d / 30)}mo ago`;
//   return `${Math.floor(d / 365)}y ago`;
// };

// const STATUS_META = {
//   pending:     { bg: '#fef9ec', color: '#b45309', border: '#fcd34d', dot: '#f59e0b', label: 'Pending' },
//   shortlisted: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6', label: 'Shortlisted' },
//   hired:       { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#22c55e', label: 'Hired' },
//   rejected:    { bg: '#fff1f2', color: '#be123c', border: '#fecdd3', dot: '#f43f5e', label: 'Rejected' },
//   interview:   { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', dot: '#a855f7', label: 'Interview' },
// };

// const STATUSES = ['pending', 'shortlisted', 'interview', 'hired', 'rejected'];
// const StatusBadge = ({ status }) => {
//   const m = STATUS_META[status] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', dot: '#9ca3af', label: status };
//   return (
//     <span style={{
//       display: 'inline-flex', alignItems: 'center', gap: 5,
//       padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
//       background: m.bg, color: m.color, border: `1px solid ${m.border}`,
//       textTransform: 'capitalize', letterSpacing: '0.3px',
//     }}>
//       <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
//       {m.label}
//     </span>
//   );
// };
// const Avatar = ({ name, size = 40 }) => {
//   const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
//   const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444'];
//   const color  = colors[(name?.charCodeAt(0) || 0) % colors.length];
//   return (
//     <div style={{
//       width: size, height: size, borderRadius: '50%', background: color,
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       color: '#fff', fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
//     }}>
//       {initials}
//     </div>
//   );
// };
// const CompanyApplications = () => {
//   const [jobs, setJobs]               = useState([]);
//   const [selectedJob, setSelectedJob] = useState('');
//   const [applicants, setApplicants]   = useState([]);
//   const [selectedApp, setSelectedApp] = useState(null);
//   const [loading, setLoading]         = useState(false);
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [search, setSearch]           = useState('');
//   const [updatingId, setUpdatingId]   = useState(null);
//   const [toast, setToast]             = useState(null);
//   const [stats, setStats]             = useState({});
//   const [noteText, setNoteText]       = useState('');
//   const [notes, setNotes]             = useState({});   
//   const [activeTab, setActiveTab]     = useState('profile'); 
//   const showToast = (msg, type = 'success') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   };
//   useEffect(() => {
//     axios.get(`${API}/company/jobs`, getAuth()).then(res => {
//       const list = res.data.data || [];
//       setJobs(list);
//       if (list.length) setSelectedJob(list[0].id);
//     }).catch(() => {});
//   }, []);
//   const fetchApplicants = useCallback(() => {
//     if (!selectedJob) return;
//     setLoading(true);
//     axios.get(`${API}/company/jobs/${selectedJob}/applicants`, getAuth())
//       .then(res => {
//         const data = res.data.data || [];
//         setApplicants(data);
//         const s = { total: data.length };
//         STATUSES.forEach(st => { s[st] = data.filter(a => a.status === st).length; });
//         setStats(s);
//         setSelectedApp(null);
//       })
//       .catch(() => showToast('Failed to load applicants', 'error'))
//       .finally(() => setLoading(false));
//   }, [selectedJob]);

//   useEffect(() => { fetchApplicants(); }, [fetchApplicants]);
//   const updateStatus = async (appId, newStatus) => {
//     setUpdatingId(appId);
//     try {
//       await axios.patch(`${API}/company/applications/${appId}/status`, { status: newStatus }, getAuth());
//       setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
//       if (selectedApp?.id === appId) setSelectedApp(prev => ({ ...prev, status: newStatus }));
//       const s = {};
//       const updated = applicants.map(a => a.id === appId ? { ...a, status: newStatus } : a);
//       s.total = updated.length;
//       STATUSES.forEach(st => { s[st] = updated.filter(a => a.status === st).length; });
//       setStats(s);
//       showToast(`Status updated to "${newStatus}"`);
//     } catch {
//       showToast('Failed to update status', 'error');
//     } finally {
//       setUpdatingId(null);
//     }
//   };
//   const saveNote = (appId) => {
//     if (!noteText.trim()) return;
//     setNotes(prev => ({
//       ...prev,
//       [appId]: [...(prev[appId] || []), { text: noteText.trim(), time: new Date().toISOString() }],
//     }));
//     setNoteText('');
//     showToast('Note saved');
//   };
//   const filtered = applicants.filter(a => {
//     const matchStatus = filterStatus === 'all' || a.status === filterStatus;
//     const matchSearch = !search || 
//       a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
//       a.email?.toLowerCase().includes(search.toLowerCase()) ||
//       a.headline?.toLowerCase().includes(search.toLowerCase());
//     return matchStatus && matchSearch;
//   });

//   const selectedJobTitle = jobs.find(j => j.id == selectedJob)?.title || '';

//   return (
//     <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
//         * { box-sizing: border-box; }
//         ::-webkit-scrollbar { width: 5px; height: 5px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
//         .app-card:hover { background: #f8faff !important; }
//         .status-btn:hover { opacity: 0.85; transform: scale(0.98); }
//         .action-btn:hover { filter: brightness(0.93); }
//       `}</style>
//       {toast && (
//         <div style={{
//           position: 'fixed', top: 20, right: 20, zIndex: 9999,
//           background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
//           color: toast.type === 'error' ? '#991b1b' : '#065f46',
//           padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
//           boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 8,
//         }}>
//           {toast.type === 'error' ? '✕' : '✓'} {toast.msg}
//         </div>
//       )}

//       <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
//           <div>
//             <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Applications</h2>
//             <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Review and manage your candidates</p>
//           </div>
     
//           <select
//             value={selectedJob}
//             onChange={e => setSelectedJob(e.target.value)}
//             style={{
//               padding: '9px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
//               fontSize: 13, fontWeight: 600, color: '#1e293b', background: '#fff',
//               cursor: 'pointer', outline: 'none', minWidth: 200,
//               boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
//             }}
//           >
//             {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
//           </select>
//         </div>
//         <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
//           {[
//             { key: 'total',       label: 'Total',       color: '#6366f1', bg: '#eef2ff' },
//             { key: 'pending',     label: 'Pending',     color: '#b45309', bg: '#fef9ec' },
//             { key: 'shortlisted', label: 'Shortlisted', color: '#1d4ed8', bg: '#eff6ff' },
//             { key: 'interview',   label: 'Interview',   color: '#7e22ce', bg: '#faf5ff' },
//             { key: 'hired',       label: 'Hired',       color: '#15803d', bg: '#f0fdf4' },
//             { key: 'rejected',    label: 'Rejected',    color: '#be123c', bg: '#fff1f2' },
//           ].map(s => (
//             <div key={s.key} style={{
//               background: s.bg, borderRadius: 10, padding: '10px 16px',
//               display: 'flex', flexDirection: 'column', minWidth: 90,
//               border: `1px solid ${s.color}22`,
//             }}>
//               <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{stats[s.key] ?? 0}</span>
//               <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{s.label}</span>
//             </div>
//           ))}
//         </div>
//         <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
//           <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
//             <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
//             <input
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               placeholder="Search by name, email, headline…"
//               style={{
//                 width: '100%', padding: '9px 12px 9px 34px', borderRadius: 9,
//                 border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b',
//                 background: '#fff', outline: 'none',
//               }}
//             />
//             {search && (
//               <button onClick={() => setSearch('')} style={{
//                 position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
//                 background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16,
//               }}>×</button>
//             )}
//           </div>
//           {['all', ...STATUSES].map(st => (
//             <button key={st} onClick={() => setFilterStatus(st)} style={{
//               padding: '7px 14px', borderRadius: 20, border: '1.5px solid',
//               cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
//               borderColor: filterStatus === st ? '#4f6ef7' : '#e2e8f0',
//               background: filterStatus === st ? '#4f6ef7' : '#fff',
//               color: filterStatus === st ? '#fff' : '#64748b',
//               textTransform: 'capitalize',
//             }}>
//               {st === 'all' ? `All (${stats.total ?? 0})` : `${st} (${stats[st] ?? 0})`}
//             </button>
//           ))}
//         </div>
//         <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
//           <div style={{
//             flex: 1, background: '#fff', borderRadius: 14,
//             boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden',
//             border: '1px solid #f1f5f9',
//           }}>
//             <div style={{
//               padding: '13px 16px', borderBottom: '1px solid #f1f5f9',
//               display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//             }}>
//               <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
//                 {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
//                 {filterStatus !== 'all' && <span style={{ color: '#94a3b8', fontWeight: 500 }}> · {filterStatus}</span>}
//               </span>
//               {selectedJobTitle && (
//                 <span style={{
//                   fontSize: 11, fontWeight: 600, color: '#6366f1',
//                   background: '#eef2ff', padding: '3px 10px', borderRadius: 20,
//                 }}>
//                   {selectedJobTitle}
//                 </span>
//               )}
//             </div>

//             {loading ? (
//               <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
//                 <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
//                 Loading applicants…
//               </div>
//             ) : filtered.length === 0 ? (
//               <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
//                 <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
//                 {search ? 'No results found' : 'No applicants yet'}
//               </div>
//             ) : (
//               filtered.map((app, i) => (
//                 <div
//                   key={app.id}
//                   className="app-card"
//                   onClick={() => { setSelectedApp(app); setActiveTab('profile'); }}
//                   style={{
//                     padding: '14px 16px',
//                     borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
//                     cursor: 'pointer',
//                     background: selectedApp?.id === app.id ? '#f0f4ff' : '#fff',
//                     borderLeft: selectedApp?.id === app.id ? '3px solid #4f6ef7' : '3px solid transparent',
//                     transition: 'background 0.12s',
//                     display: 'flex', gap: 12, alignItems: 'flex-start',
//                   }}
//                 >
//                   <Avatar name={app.full_name} size={38} />
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                       <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
//                         {app.full_name}
//                       </div>
//                       <StatusBadge status={app.status} />
//                     </div>
//                     <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{app.email}</div>
//                     {app.headline && (
//                       <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                         {app.headline}
//                       </div>
//                     )}
//                     <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
//                       {app.experience_years != null && (
//                         <span style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>
//                           {app.experience_years}y exp
//                         </span>
//                       )}
//                       {app.applied_at && (
//                         <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(app.applied_at)}</span>
//                       )}
//                       {notes[app.id]?.length > 0 && (
//                         <span style={{ fontSize: 11, color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: 6 }}>
//                           📝 {notes[app.id].length} note{notes[app.id].length > 1 ? 's' : ''}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//           {selectedApp ? (
//             <div style={{
//               width: 340, background: '#fff', borderRadius: 14,
//               boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden',
//               border: '1px solid #f1f5f9', flexShrink: 0,
//               position: 'sticky', top: 20,
//             }}>
//               <div style={{
//                 padding: '16px 18px', borderBottom: '1px solid #f1f5f9',
//                 background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
//                 display: 'flex', gap: 12, alignItems: 'center',
//               }}>
//                 <Avatar name={selectedApp.full_name} size={46} />
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>{selectedApp.full_name}</div>
//                   <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{selectedApp.email}</div>
//                   {selectedApp.headline && (
//                     <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                       {selectedApp.headline}
//                     </div>
//                   )}
//                 </div>
//                 <button onClick={() => setSelectedApp(null)} style={{
//                   background: '#f1f5f9', border: 'none', borderRadius: '50%',
//                   width: 28, height: 28, cursor: 'pointer', display: 'flex',
//                   alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 16, flexShrink: 0,
//                 }}>×</button>
//               </div>
//               <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
//                 {['profile', 'status', 'notes'].map(tab => (
//                   <button key={tab} onClick={() => setActiveTab(tab)} style={{
//                     flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
//                     background: activeTab === tab ? '#fff' : '#f8fafc',
//                     color: activeTab === tab ? '#4f6ef7' : '#64748b',
//                     fontWeight: activeTab === tab ? 700 : 500,
//                     fontSize: 12, borderBottom: activeTab === tab ? '2px solid #4f6ef7' : '2px solid transparent',
//                     textTransform: 'capitalize', transition: 'all 0.15s',
//                   }}>
//                     {tab === 'notes' && notes[selectedApp.id]?.length
//                       ? `Notes (${notes[selectedApp.id].length})`
//                       : tab.charAt(0).toUpperCase() + tab.slice(1)}
//                   </button>
//                 ))}
//               </div>

//               <div style={{ padding: 18, maxHeight: 520, overflowY: 'auto' }}>
//                 {activeTab === 'profile' && (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Current Status</span>
//                       <StatusBadge status={selectedApp.status} />
//                     </div>

//                     {selectedApp.experience_years != null && (
//                       <InfoRow icon="💼" label="Experience" value={`${selectedApp.experience_years} year${selectedApp.experience_years !== 1 ? 's' : ''}`} />
//                     )}

//                     {selectedApp.applied_at && (
//                       <InfoRow icon="📅" label="Applied" value={new Date(selectedApp.applied_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} />
//                     )}

//                     {selectedApp.skills?.length > 0 && (
//                       <div>
//                         <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//                           Skills
//                         </div>
//                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
//                           {selectedApp.skills.map((s, i) => (
//                             <span key={i} style={{
//                               padding: '4px 10px', background: '#eef2ff', color: '#4338ca',
//                               borderRadius: 8, fontSize: 11, fontWeight: 600,
//                             }}>{s}</span>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {selectedApp.profile_resume && (
//                       <a
//                         href={`http://localhost:5000${selectedApp.profile_resume}`}
//                         target="_blank" rel="noreferrer"
//                         style={{
//                           display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
//                           padding: '10px', borderRadius: 10, background: '#4f6ef7', color: '#fff',
//                           textDecoration: 'none', fontSize: 13, fontWeight: 700,
//                           boxShadow: '0 2px 8px rgba(79,110,247,0.3)', marginTop: 4,
//                         }}
//                       >
//                         📄 View Resume
//                       </a>
//                     )}
//                   </div>
//                 )}
//                 {activeTab === 'status' && (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                     <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
//                       Move <strong>{selectedApp.full_name}</strong> to:
//                     </p>
//                     {STATUSES.map(st => {
//                       const m = STATUS_META[st];
//                       const isActive = selectedApp.status === st;
//                       const isLoading = updatingId === selectedApp.id;
//                       return (
//                         <button
//                           key={st}
//                           className="status-btn"
//                           disabled={isActive || isLoading}
//                           onClick={() => updateStatus(selectedApp.id, st)}
//                           style={{
//                             width: '100%', padding: '11px 14px', borderRadius: 10,
//                             border: `1.5px solid ${isActive ? m.border : '#e2e8f0'}`,
//                             background: isActive ? m.bg : '#fff',
//                             color: isActive ? m.color : '#374151',
//                             cursor: isActive ? 'default' : 'pointer',
//                             fontWeight: isActive ? 700 : 500, fontSize: 13,
//                             display: 'flex', alignItems: 'center', gap: 10,
//                             transition: 'all 0.15s', textAlign: 'left',
//                             opacity: isLoading ? 0.6 : 1,
//                           }}
//                         >
//                           <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
//                           <span style={{ flex: 1 }}>{m.label}</span>
//                           {isActive && <span style={{ fontSize: 11, opacity: 0.7 }}>Current</span>}
//                         </button>
//                       );
//                     })}
//                     {updatingId === selectedApp.id && (
//                       <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>Updating…</p>
//                     )}
//                   </div>
//                 )}

//                 {/* ── Notes Tab ── */}
//                 {activeTab === 'notes' && (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                       <textarea
//                         value={noteText}
//                         onChange={e => setNoteText(e.target.value)}
//                         placeholder="Write a note about this candidate…"
//                         rows={3}
//                         style={{
//                           width: '100%', padding: '10px 12px', borderRadius: 10,
//                           border: '1.5px solid #e2e8f0', fontSize: 13, resize: 'vertical',
//                           outline: 'none', color: '#1e293b', background: '#f8fafc',
//                         }}
//                       />
//                       <button
//                         onClick={() => saveNote(selectedApp.id)}
//                         disabled={!noteText.trim()}
//                         style={{
//                           padding: '9px', borderRadius: 9, border: 'none',
//                           background: noteText.trim() ? '#4f6ef7' : '#e2e8f0',
//                           color: noteText.trim() ? '#fff' : '#94a3b8',
//                           cursor: noteText.trim() ? 'pointer' : 'not-allowed',
//                           fontWeight: 700, fontSize: 13,
//                         }}
//                       >
//                         Save Note
//                       </button>
//                     </div>

              
//                     {(notes[selectedApp.id] || []).length === 0 ? (
//                       <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '16px 0' }}>
//                         No notes yet
//                       </div>
//                     ) : (
//                       [...(notes[selectedApp.id] || [])].reverse().map((n, i) => (
//                         <div key={i} style={{
//                           padding: '10px 12px', background: '#f8fafc', borderRadius: 10,
//                           border: '1px solid #f1f5f9',
//                         }}>
//                           <p style={{ margin: 0, fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>{n.text}</p>
//                           <p style={{ margin: '6px 0 0', fontSize: 11, color: '#94a3b8' }}>
//                             {new Date(n.time).toLocaleString()}
//                           </p>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div style={{
//               width: 340, flexShrink: 0, background: '#fff', borderRadius: 14,
//               border: '1.5px dashed #e2e8f0', display: 'flex',
//               flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
//               padding: 40, color: '#94a3b8', textAlign: 'center', minHeight: 300,
//             }}>
//               <div style={{ fontSize: 36, marginBottom: 12 }}>👆</div>
//               <div style={{ fontWeight: 600, fontSize: 14 }}>Select a candidate</div>
//               <div style={{ fontSize: 12, marginTop: 6 }}>Click any applicant to view details</div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CompanyApplications;

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
});

// ── Responsive hook ───────────────────────────────────────────────────────────
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
};

// ── Info Row helper ───────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{icon}</span> {label}
    </span>
    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{value}</span>
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1 day ago';
  if (d < 30) return `${d} days ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
};

const STATUS_META = {
  pending:     { bg: '#fef9ec', color: '#b45309', border: '#fcd34d', dot: '#f59e0b', label: 'Pending' },
  shortlisted: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6', label: 'Shortlisted' },
  hired:       { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#22c55e', label: 'Hired' },
  rejected:    { bg: '#fff1f2', color: '#be123c', border: '#fecdd3', dot: '#f43f5e', label: 'Rejected' },
  interview:   { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', dot: '#a855f7', label: 'Interview' },
};

const STATUSES = ['pending', 'shortlisted', 'interview', 'hired', 'rejected'];

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', dot: '#9ca3af', label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      textTransform: 'capitalize', letterSpacing: '0.3px', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 40 }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444'];
  const color  = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

// ── Detail Panel (shared between mobile modal & desktop sidebar) ──────────────
const DetailPanel = ({
  selectedApp, activeTab, setActiveTab, noteText, setNoteText,
  notes, saveNote, updateStatus, updatingId, onClose,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{
      padding: '16px 18px', borderBottom: '1px solid #f1f5f9',
      background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
      display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0,
    }}>
      <Avatar name={selectedApp.full_name} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>{selectedApp.full_name}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{selectedApp.email}</div>
        {selectedApp.headline && (
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedApp.headline}
          </div>
        )}
      </div>
      <button onClick={onClose} style={{
        background: '#f1f5f9', border: 'none', borderRadius: '50%',
        width: 32, height: 32, cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 18, flexShrink: 0,
      }}>×</button>
    </div>
    <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
      {['profile', 'status', 'notes'].map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)} style={{
          flex: 1, padding: '11px 0', border: 'none', cursor: 'pointer',
          background: activeTab === tab ? '#fff' : '#f8fafc',
          color: activeTab === tab ? '#4f6ef7' : '#64748b',
          fontWeight: activeTab === tab ? 700 : 500,
          fontSize: 12, borderBottom: activeTab === tab ? '2px solid #4f6ef7' : '2px solid transparent',
          textTransform: 'capitalize', transition: 'all 0.15s',
        }}>
          {tab === 'notes' && notes[selectedApp.id]?.length
            ? `Notes (${notes[selectedApp.id].length})`
            : tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>

    <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Current Status</span>
            <StatusBadge status={selectedApp.status} />
          </div>

          {selectedApp.experience_years != null && (
            <InfoRow icon="💼" label="Experience" value={`${selectedApp.experience_years} year${selectedApp.experience_years !== 1 ? 's' : ''}`} />
          )}

          {selectedApp.applied_at && (
            <InfoRow icon="📅" label="Applied" value={new Date(selectedApp.applied_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} />
          )}

          {selectedApp.skills?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedApp.skills.map((s, i) => (
                  <span key={i} style={{
                    padding: '4px 10px', background: '#eef2ff', color: '#4338ca',
                    borderRadius: 8, fontSize: 11, fontWeight: 600,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {selectedApp.profile_resume && (
            <a
              href={`http://localhost:5000${selectedApp.profile_resume}`}
              target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px', borderRadius: 10, background: '#4f6ef7', color: '#fff',
                textDecoration: 'none', fontSize: 13, fontWeight: 700,
                boxShadow: '0 2px 8px rgba(79,110,247,0.3)', marginTop: 4,
              }}
            >
              📄 View Resume
            </a>
          )}
        </div>
      )}
      {activeTab === 'status' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
            Move <strong>{selectedApp.full_name}</strong> to:
          </p>
          {STATUSES.map(st => {
            const m = STATUS_META[st];
            const isActive = selectedApp.status === st;
            const isLoading = updatingId === selectedApp.id;
            return (
              <button
                key={st}
                className="status-btn"
                disabled={isActive || isLoading}
                onClick={() => updateStatus(selectedApp.id, st)}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: `1.5px solid ${isActive ? m.border : '#e2e8f0'}`,
                  background: isActive ? m.bg : '#fff',
                  color: isActive ? m.color : '#374151',
                  cursor: isActive ? 'default' : 'pointer',
                  fontWeight: isActive ? 700 : 500, fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all 0.15s', textAlign: 'left',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{m.label}</span>
                {isActive && <span style={{ fontSize: 11, opacity: 0.7 }}>Current</span>}
              </button>
            );
          })}
          {updatingId === selectedApp.id && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>Updating…</p>
          )}
        </div>
      )}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Write a note about this candidate…"
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                border: '1.5px solid #e2e8f0', fontSize: 13, resize: 'vertical',
                outline: 'none', color: '#1e293b', background: '#f8fafc',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => saveNote(selectedApp.id)}
              disabled={!noteText.trim()}
              style={{
                padding: '9px', borderRadius: 9, border: 'none',
                background: noteText.trim() ? '#4f6ef7' : '#e2e8f0',
                color: noteText.trim() ? '#fff' : '#94a3b8',
                cursor: noteText.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 700, fontSize: 13,
              }}
            >
              Save Note
            </button>
          </div>

          {(notes[selectedApp.id] || []).length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '16px 0' }}>
              No notes yet
            </div>
          ) : (
            [...(notes[selectedApp.id] || [])].reverse().map((n, i) => (
              <div key={i} style={{
                padding: '10px 12px', background: '#f8fafc', borderRadius: 10,
                border: '1px solid #f1f5f9',
              }}>
                <p style={{ margin: 0, fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>{n.text}</p>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#94a3b8' }}>
                  {new Date(n.time).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const CompanyApplications = () => {
  const [jobs, setJobs]               = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applicants, setApplicants]   = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch]           = useState('');
  const [updatingId, setUpdatingId]   = useState(null);
  const [toast, setToast]             = useState(null);
  const [stats, setStats]             = useState({});
  const [noteText, setNoteText]       = useState('');
  const [notes, setNotes]             = useState({});
  const [activeTab, setActiveTab]     = useState('profile');

  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    axios.get(`${API}/company/jobs`, getAuth()).then(res => {
      const list = res.data.data || [];
      setJobs(list);
      if (list.length) setSelectedJob(list[0].id);
    }).catch(() => {});
  }, []);

  const fetchApplicants = useCallback(() => {
    if (!selectedJob) return;
    setLoading(true);
    axios.get(`${API}/company/jobs/${selectedJob}/applicants`, getAuth())
      .then(res => {
        const data = res.data.data || [];
        setApplicants(data);
        const s = { total: data.length };
        STATUSES.forEach(st => { s[st] = data.filter(a => a.status === st).length; });
        setStats(s);
        setSelectedApp(null);
      })
      .catch(() => showToast('Failed to load applicants', 'error'))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  const updateStatus = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await axios.patch(`${API}/company/applications/${appId}/status`, { status: newStatus }, getAuth());
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      if (selectedApp?.id === appId) setSelectedApp(prev => ({ ...prev, status: newStatus }));
      const updated = applicants.map(a => a.id === appId ? { ...a, status: newStatus } : a);
      const s = { total: updated.length };
      STATUSES.forEach(st => { s[st] = updated.filter(a => a.status === st).length; });
      setStats(s);
      showToast(`Status updated to "${newStatus}"`);
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const saveNote = (appId) => {
    if (!noteText.trim()) return;
    setNotes(prev => ({
      ...prev,
      [appId]: [...(prev[appId] || []), { text: noteText.trim(), time: new Date().toISOString() }],
    }));
    setNoteText('');
    showToast('Note saved');
  };

  const filtered = applicants.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchSearch = !search ||
      a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.headline?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selectedJobTitle = jobs.find(j => j.id == selectedJob)?.title || '';

  const handleSelectApp = (app) => {
    setSelectedApp(app);
    setActiveTab('profile');
  };

  const handleClosePanel = () => setSelectedApp(null);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .app-card:hover { background: #f8faff !important; }
        .status-btn:hover { opacity: 0.85; transform: scale(0.98); }
        .action-btn:hover { filter: brightness(0.93); }

        /* Mobile bottom sheet animation */
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }

        /* Responsive filter pills scroll on mobile */
        .filter-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .filter-scroll::-webkit-scrollbar { display: none; }
        .filter-scroll button { flex-shrink: 0; }
      `}</style>
      {toast && (
        <div style={{
          position: 'fixed',
          top: isMobile ? 'auto' : 20,
          bottom: isMobile ? 20 : 'auto',
          right: 16, left: isMobile ? 16 : 'auto',
          zIndex: 9999,
          background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: toast.type === 'error' ? '#991b1b' : '#065f46',
          padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 8,
          textAlign: 'center', justifyContent: 'center',
        }}>
          {toast.type === 'error' ? '✕' : '✓'} {toast.msg}
        </div>
      )}
      {isMobile && selectedApp && (
        <>
          <div
            onClick={handleClosePanel}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
              zIndex: 1000, backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff', borderRadius: '20px 20px 0 0',
            zIndex: 1001, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            animation: 'slideUp 0.25s ease-out',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
              <div style={{ width: 36, height: 4, background: '#e2e8f0', borderRadius: 2 }} />
            </div>
            <DetailPanel
              selectedApp={selectedApp} activeTab={activeTab} setActiveTab={setActiveTab}
              noteText={noteText} setNoteText={setNoteText} notes={notes} saveNote={saveNote}
              updateStatus={updateStatus} updatingId={updatingId} onClose={handleClosePanel}
            />
          </div>
        </>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 24px' }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          gap: 12,
          marginBottom: isMobile ? 16 : 24,
        }}>
          <div>
            <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Applications</h2>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4, margin: '4px 0 0' }}>Review and manage your candidates</p>
          </div>
          <select
            value={selectedJob}
            onChange={e => setSelectedJob(e.target.value)}
            style={{
              padding: '9px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              fontSize: 13, fontWeight: 600, color: '#1e293b', background: '#fff',
              cursor: 'pointer', outline: 'none', width: isMobile ? '100%' : 'auto', minWidth: 200,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(3, 1fr)'
            : 'repeat(6, 1fr)',
          gap: isMobile ? 8 : 12,
          marginBottom: isMobile ? 14 : 20,
        }}>
          {[
            { key: 'total',       label: 'Total',       color: '#6366f1', bg: '#eef2ff' },
            { key: 'pending',     label: 'Pending',     color: '#b45309', bg: '#fef9ec' },
            { key: 'shortlisted', label: 'Shortlisted', color: '#1d4ed8', bg: '#eff6ff' },
            { key: 'interview',   label: 'Interview',   color: '#7e22ce', bg: '#faf5ff' },
            { key: 'hired',       label: 'Hired',       color: '#15803d', bg: '#f0fdf4' },
            { key: 'rejected',    label: 'Rejected',    color: '#be123c', bg: '#fff1f2' },
          ].map(s => (
            <div key={s.key} style={{
              background: s.bg, borderRadius: 10, padding: isMobile ? '8px 10px' : '10px 16px',
              display: 'flex', flexDirection: 'column',
              border: `1px solid ${s.color}22`,
            }}>
              <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: s.color }}>{stats[s.key] ?? 0}</span>
              <span style={{ fontSize: isMobile ? 10 : 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, headline…"
              style={{
                width: '100%', padding: '9px 12px 9px 34px', borderRadius: 9,
                border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b',
                background: '#fff', outline: 'none',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16,
              }}>×</button>
            )}
          </div>
          <div className="filter-scroll">
            {['all', ...STATUSES].map(st => (
              <button key={st} onClick={() => setFilterStatus(st)} style={{
                padding: '7px 14px', borderRadius: 20, border: '1.5px solid',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                borderColor: filterStatus === st ? '#4f6ef7' : '#e2e8f0',
                background: filterStatus === st ? '#4f6ef7' : '#fff',
                color: filterStatus === st ? '#fff' : '#64748b',
                textTransform: 'capitalize',
              }}>
                {st === 'all' ? `All (${stats.total ?? 0})` : `${st} (${stats[st] ?? 0})`}
              </button>
            ))}
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: isTablet ? 'column' : 'row',
          gap: 16,
          alignItems: 'flex-start',
        }}>
          <div style={{
            flex: 1,
            width: '100%',
            background: '#fff', borderRadius: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden',
            border: '1px solid #f1f5f9',
          }}>
            <div style={{
              padding: '13px 16px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
                {filterStatus !== 'all' && <span style={{ color: '#94a3b8', fontWeight: 500 }}> · {filterStatus}</span>}
              </span>
              {selectedJobTitle && (
                <span style={{
                  fontSize: 11, fontWeight: 600, color: '#6366f1',
                  background: '#eef2ff', padding: '3px 10px', borderRadius: 20,
                  maxWidth: isMobile ? 140 : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {selectedJobTitle}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                Loading applicants…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                {search ? 'No results found' : 'No applicants yet'}
              </div>
            ) : (
              filtered.map((app, i) => (
                <div
                  key={app.id}
                  className="app-card"
                  onClick={() => handleSelectApp(app)}
                  style={{
                    padding: isMobile ? '12px 14px' : '14px 16px',
                    borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'pointer',
                    background: selectedApp?.id === app.id ? '#f0f4ff' : '#fff',
                    borderLeft: selectedApp?.id === app.id ? '3px solid #4f6ef7' : '3px solid transparent',
                    transition: 'background 0.12s',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}
                >
                  <Avatar name={app.full_name} size={isMobile ? 34 : 38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div style={{
                        fontWeight: 700, color: '#0f172a', fontSize: isMobile ? 13 : 14,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        minWidth: 0, flex: 1,
                      }}>
                        {app.full_name}
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{app.email}</div>
                    {app.headline && (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.headline}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {app.experience_years != null && (
                        <span style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>
                          {app.experience_years}y exp
                        </span>
                      )}
                      {app.applied_at && (
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(app.applied_at)}</span>
                      )}
                      {notes[app.id]?.length > 0 && (
                        <span style={{ fontSize: 11, color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: 6 }}>
                          📝 {notes[app.id].length} note{notes[app.id].length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
{selectedApp ? (
  <div
    style={{
      width: isTablet ? '100%' : 340,
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      overflow: 'hidden',
      border: '1px solid #f1f5f9',
      flexShrink: 0,
      position: isTablet ? 'static' : 'sticky',
      top: 20,
      maxHeight: isTablet ? 'none' : 'calc(100vh - 40px)',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <DetailPanel
      selectedApp={selectedApp}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      noteText={noteText}
      setNoteText={setNoteText}
      notes={notes}
      saveNote={saveNote}
      updateStatus={updateStatus}
      updatingId={updatingId}
      onClose={handleClosePanel}
    />
  </div>
) : (
  <div
    style={{
      width: isTablet ? '100%' : 340,
      flexShrink: 0,
      background: '#fff',
      borderRadius: 14,
      border: '1.5px dashed #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      color: '#94a3b8',
      textAlign: 'center',
      minHeight: 200,
    }}
  >
    <div style={{ fontSize: 36, marginBottom: 12 }}>👆</div>
    <div style={{ fontWeight: 600, fontSize: 14 }}>
      Select a candidate
    </div>
    <div style={{ fontSize: 12, marginTop: 6 }}>
      Click any applicant to view details
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default CompanyApplications;
