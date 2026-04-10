// // pages/AdminChatDashboard.jsx
// import { useState, useEffect } from 'react'

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// const STATUS_COLORS = {
//   open: { bg: '#dbeafe', text: '#1d4ed8' },
//   waiting_admin: { bg: '#fef3c7', text: '#d97706' },
//   resolved: { bg: '#d1fae5', text: '#065f46' },
//   closed: { bg: '#f1f5f9', text: '#64748b' },
// }

// export default function AdminChatDashboard() {
//   const [sessions, setSessions] = useState([])
//   const [selectedSession, setSelectedSession] = useState(null)
//   const [messages, setMessages] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [filter, setFilter] = useState('')

//   useEffect(() => {
//     fetchSessions()
//   }, [filter])

//   const fetchSessions = async () => {
//     setLoading(true)
//     try {
//       const url = filter
//         ? `${API_BASE}/admin/chat-sessions?status=${filter}`
//         : `${API_BASE}/admin/chat-sessions`
//       const res = await fetch(url, { credentials: 'include' })
//       const data = await res.json()
//       if (data.success) setSessions(data.sessions)
//     } catch (err) {
//       console.error(err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchMessages = async (sessionId) => {
//     setLoading(true)
//     try {
//       const res = await fetch(`${API_BASE}/admin/chat-sessions/${sessionId}`, { credentials: 'include' })
//       const data = await res.json()
//       if (data.success) {
//         setSelectedSession(data.session)
//         setMessages(data.messages)
//       }
//     } catch (err) {
//       console.error(err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const updateStatus = async (sessionId, status) => {
//     await fetch(`${API_BASE}/admin/chat-sessions/${sessionId}/status`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify({ status }),
//     })
//     fetchSessions()
//     if (selectedSession?.id === sessionId) {
//       setSelectedSession((s) => ({ ...s, status }))
//     }
//   }

//   const formatTime = (ts) =>
//     new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

//   return (
//     <div style={styles.page}>
//       <div style={styles.sidebar}>
//         <div style={styles.sidebarHeader}>
//           <h2 style={styles.sidebarTitle}>💬 Chat Sessions</h2>
//           <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.filterSelect}>
//             <option value="">All</option>
//             <option value="waiting_admin">Waiting Admin</option>
//             <option value="open">Open</option>
//             <option value="resolved">Resolved</option>
//             <option value="closed">Closed</option>
//           </select>
//         </div>

//         <div style={styles.sessionList}>
//           {loading && sessions.length === 0 && (
//             <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: 24 }}>Loading...</p>
//           )}
//           {sessions.length === 0 && !loading && (
//             <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: 24 }}>No sessions found.</p>
//           )}
//           {sessions.map((s) => (
//             <div
//               key={s.id}
//               onClick={() => fetchMessages(s.id)}
//               style={{
//                 ...styles.sessionCard,
//                 background: selectedSession?.id === s.id ? '#eff6ff' : '#fff',
//                 borderColor: selectedSession?.id === s.id ? '#2563eb' : '#e2e8f0',
//               }}
//             >
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                 <div>
//                   <p style={styles.sessionName}>{s.employee_name || `Employee #${s.employee_id}`}</p>
//                   <p style={styles.sessionEmail}>{s.employee_email}</p>
//                 </div>
//                 <span style={{
//                   ...styles.badge,
//                   background: STATUS_COLORS[s.status]?.bg,
//                   color: STATUS_COLORS[s.status]?.text,
//                 }}>
//                   {s.status.replace('_', ' ')}
//                 </span>
//               </div>
//               <p style={styles.lastMsg}>
//                 {s.last_message?.slice(0, 60)}{s.last_message?.length > 60 ? '...' : ''}
//               </p>
//               <p style={styles.sessionTime}>{formatTime(s.updated_at)} · {s.message_count} msgs</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div style={styles.main}>
//         {!selectedSession ? (
//           <div style={styles.placeholder}>
//             <p style={{ fontSize: 48 }}>📨</p>
//             <p style={{ color: '#94a3b8', fontSize: 16 }}>Select a session to view the full chat history</p>
//           </div>
//         ) : (
//           <>
//             <div style={styles.chatHeader}>
//               <div>
//                 <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
//                   {selectedSession.employee_name || `Employee #${selectedSession.employee_id}`}
//                 </h3>
//                 <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{selectedSession.employee_email}</p>
//               </div>
//               <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                 <span style={{
//                   ...styles.badge,
//                   background: STATUS_COLORS[selectedSession.status]?.bg,
//                   color: STATUS_COLORS[selectedSession.status]?.text,
//                 }}>
//                   {selectedSession.status.replace('_', ' ')}
//                 </span>
//                 <select
//                   onChange={(e) => updateStatus(selectedSession.id, e.target.value)}
//                   defaultValue=""
//                   style={styles.filterSelect}
//                 >
//                   <option value="" disabled>Change status</option>
//                   <option value="open">Open</option>
//                   <option value="resolved">Resolved</option>
//                   <option value="closed">Closed</option>
//                 </select>
//               </div>
//             </div>

//             <div style={styles.chatMessages}>
//               {messages.map((msg) => (
//                 <div
//                   key={msg.id}
//                   style={{
//                     display: 'flex',
//                     justifyContent: msg.sender_role === 'user' ? 'flex-end' : 'flex-start',
//                     marginBottom: 10,
//                   }}
//                 >
//                   {msg.sender_role !== 'user' && (
//                     <span style={{ fontSize: 18, marginRight: 6, alignSelf: 'flex-end' }}>
//                       {msg.sender_role === 'admin' ? '🛡️' : '🤖'}
//                     </span>
//                   )}
//                   <div>
//                     <div style={msg.sender_role === 'user' ? styles.userBubble : styles.botBubble}>
//                       {msg.content}
//                     </div>
//                     <p style={{ fontSize: 10, color: '#94a3b8', textAlign: msg.sender_role === 'user' ? 'right' : 'left', margin: '2px 4px 0' }}>
//                       {msg.sender_role === 'admin' ? '👤 Admin' : msg.sender_role === 'user' ? '👤 Employee' : '🤖 AI'}
//                       &nbsp;·&nbsp;{formatTime(msg.created_at)}
//                     </p>
//                   </div>
//                   {msg.sender_role === 'user' && (
//                     <span style={{ fontSize: 18, marginLeft: 6, alignSelf: 'flex-end' }}>👤</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

// const styles = {
//   page: {
//     display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif',
//     background: '#f8fafc',
//   },
//   sidebar: {
//     width: 320, background: '#fff', borderRight: '1px solid #e2e8f0',
//     display: 'flex', flexDirection: 'column', overflow: 'hidden',
//   },
//   sidebarHeader: {
//     padding: '16px 14px 12px', borderBottom: '1px solid #e2e8f0',
//     display: 'flex', flexDirection: 'column', gap: 8,
//   },
//   sidebarTitle: { margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b' },
//   filterSelect: {
//     border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 10px',
//     fontSize: 13, outline: 'none', cursor: 'pointer', background: '#fff',
//   },
//   sessionList: { flex: 1, overflowY: 'auto', padding: 10 },
//   sessionCard: {
//     border: '1.5px solid', borderRadius: 12, padding: '12px 12px',
//     marginBottom: 8, cursor: 'pointer', transition: 'all 0.15s',
//   },
//   sessionName: { margin: 0, fontWeight: 600, fontSize: 14, color: '#1e293b' },
//   sessionEmail: { margin: '2px 0 0', fontSize: 12, color: '#64748b' },
//   lastMsg: { margin: '8px 0 4px', fontSize: 12, color: '#475569', lineHeight: 1.4 },
//   sessionTime: { margin: 0, fontSize: 11, color: '#94a3b8' },
//   badge: {
//     padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
//     textTransform: 'capitalize', whiteSpace: 'nowrap',
//   },
//   main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
//   placeholder: {
//     flex: 1, display: 'flex', flexDirection: 'column',
//     alignItems: 'center', justifyContent: 'center', gap: 12,
//   },
//   chatHeader: {
//     padding: '14px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0',
//     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//   },
//   chatMessages: { flex: 1, overflowY: 'auto', padding: '16px 20px' },
//   userBubble: {
//     background: '#2563eb', color: '#fff', padding: '9px 14px',
//     borderRadius: '16px 16px 4px 16px', maxWidth: 420, fontSize: 13, lineHeight: 1.5,
//   },
//   botBubble: {
//     background: '#f1f5f9', color: '#1e293b', padding: '9px 14px',
//     borderRadius: '16px 16px 16px 4px', maxWidth: 420, fontSize: 13, lineHeight: 1.5,
//   },
// }
// pages/AdminChatDashboard.jsx
// ✅ This is a PAGE — add it as a route inside AdminLayout (not globally in App.jsx)
// Route: <Route path="chat-sessions" element={<AdminChatDashboard />} />
// Sidebar link: /admin/chat-sessions

import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_COLORS = {
  open:          { bg: '#dbeafe', text: '#1d4ed8', label: 'Open' },
  waiting_admin: { bg: '#fef3c7', text: '#d97706', label: 'Waiting' },
  resolved:      { bg: '#d1fae5', text: '#065f46', label: 'Resolved' },
  closed:        { bg: '#f1f5f9', text: '#64748b', label: 'Closed' },
};

const Avatar = ({ name, size = 36 }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const colors = ['#6366f1', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  );
};

export default function AdminChatDashboard() {
  const [sessions, setSessions]           = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [filter, setFilter]               = useState('');
  const [search, setSearch]               = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { fetchSessions(); }, [filter]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filter
        ? `${API_BASE}/admin/chat-sessions?status=${filter}`
        : `${API_BASE}/admin/chat-sessions`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSessions(data.sessions);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchMessages = async (session) => {
    setLoading(true);
    setSelectedSession(session);
    setMessages([]);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/chat-sessions/${session.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedSession(data.session);
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (sessionId, status) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/admin/chat-sessions/${sessionId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    fetchSessions();
    if (selectedSession?.id === sessionId) {
      setSelectedSession(s => ({ ...s, status }));
    }
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const formatTimeShort = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const filteredSessions = sessions.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.employee_name?.toLowerCase().includes(q) ||
      s.employee_email?.toLowerCase().includes(q)
    );
  });

  const waitingCount = sessions.filter(s => s.status === 'waiting_admin').length;

  return (
    <div style={S.page}>
      <style>{`
        .session-card:hover { background: #f8faff !important; }
        .session-card.active { background: #eff6ff !important; border-color: #2563eb !important; }
        .status-select { border: 1px solid #d1d5db; border-radius: 8px; padding: 6px 10px; font-size: 13px; outline: none; cursor: pointer; background: #fff; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>

      {/* ── Left Sidebar: session list ── */}
      <div style={S.sidebar}>

        {/* Sidebar header */}
        <div style={S.sidebarHeader}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>💬</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Chat Sessions</span>
            </div>
            {waitingCount > 0 && (
              <span style={{
                background: '#fef3c7', color: '#d97706',
                padding: '2px 8px', borderRadius: 20,
                fontSize: 11, fontWeight: 700,
              }}>
                {waitingCount} waiting
              </span>
            )}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              style={{
                width: '100%', padding: '8px 10px 8px 32px',
                border: '1px solid #e2e8f0', borderRadius: 10,
                fontSize: 13, outline: 'none', boxSizing: 'border-box',
                color: '#1e293b', background: '#f8fafc',
              }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['', 'waiting_admin', 'open', 'resolved', 'closed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 11,
                  border: 'none', cursor: 'pointer', fontWeight: 600,
                  background: filter === f ? '#2563eb' : '#f1f5f9',
                  color: filter === f ? '#fff' : '#475569',
                  transition: 'all 0.15s',
                }}
              >
                {f === '' ? 'All' : f === 'waiting_admin' ? '⚡ Waiting' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Session list */}
        <div className="chat-scroll" style={S.sessionList}>
          {sessionsLoading && (
            <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: 24, fontSize: 13 }}>Loading sessions...</p>
          )}
          {!sessionsLoading && filteredSessions.length === 0 && (
            <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: 24, fontSize: 13 }}>No sessions found.</p>
          )}
          {filteredSessions.map(s => (
            <div
              key={s.id}
              className={`session-card ${selectedSession?.id === s.id ? 'active' : ''}`}
              onClick={() => fetchMessages(s)}
              style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: 12, padding: '12px',
                marginBottom: 8, cursor: 'pointer',
                transition: 'all 0.15s', background: '#fff',
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Avatar name={s.employee_name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.employee_name || `Employee #${s.employee_id}`}
                    </span>
                    <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0, marginLeft: 4 }}>
                      {formatTimeShort(s.updated_at)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.employee_email}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.last_message?.slice(0, 55)}{(s.last_message?.length || 0) > 55 ? '...' : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{
                  ...S.badge,
                  background: STATUS_COLORS[s.status]?.bg,
                  color: STATUS_COLORS[s.status]?.text,
                }}>
                  {STATUS_COLORS[s.status]?.label || s.status}
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{s.message_count} messages</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: chat view ── */}
      <div style={S.main}>
        {!selectedSession ? (
          <div style={S.placeholder}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>💬</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: '#475569', marginBottom: 6 }}>Select a conversation</div>
            <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', maxWidth: 260 }}>
              Click any session on the left to view the employee's full chat history
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={S.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={selectedSession.employee_name} size={40} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>
                    {selectedSession.employee_name || `Employee #${selectedSession.employee_id}`}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{selectedSession.employee_email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{
                  ...S.badge,
                  background: STATUS_COLORS[selectedSession.status]?.bg,
                  color: STATUS_COLORS[selectedSession.status]?.text,
                  fontSize: 12, padding: '4px 12px',
                }}>
                  {STATUS_COLORS[selectedSession.status]?.label}
                </span>
                <select
                  className="status-select"
                  value=""
                  onChange={e => {
                    if (e.target.value) updateStatus(selectedSession.id, e.target.value);
                  }}
                >
                  <option value="" disabled>Change status</option>
                  <option value="open">Open</option>
                  <option value="resolved">✅ Resolved</option>
                  <option value="closed">🔒 Closed</option>
                </select>
              </div>
            </div>

            {/* Employee info strip */}
            <div style={{
              padding: '8px 20px', background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex', gap: 20, fontSize: 12, color: '#64748b',
            }}>
              <span>📧 {selectedSession.employee_email}</span>
              <span>🕐 Started: {formatTime(selectedSession.created_at)}</span>
              <span>💬 {messages.length} messages</span>
            </div>

            {/* Messages */}
            <div className="chat-scroll" style={S.chatMessages}>
              {loading && (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: 24, fontSize: 13 }}>Loading messages...</div>
              )}
              {!loading && messages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.sender_role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 14, gap: 8, alignItems: 'flex-end',
                }}>
                  {msg.sender_role !== 'user' && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: msg.sender_role === 'admin' ? '#dbeafe' : '#ede9fe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, flexShrink: 0,
                    }}>
                      {msg.sender_role === 'admin' ? '🛡️' : '🤖'}
                    </div>
                  )}
                  <div>
                    <div style={{
                      maxWidth: 460, padding: '10px 14px',
                      borderRadius: msg.sender_role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.sender_role === 'user'
                        ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                        : msg.sender_role === 'admin' ? '#dbeafe' : '#fff',
                      color: msg.sender_role === 'user' ? '#fff' : '#1e293b',
                      fontSize: 13, lineHeight: 1.55,
                      boxShadow: msg.sender_role === 'user' ? '0 2px 8px rgba(99,102,241,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                      border: msg.sender_role !== 'user' ? '1px solid #f1f5f9' : 'none',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
                      {msg.content}
                    </div>
                    <div style={{
                      fontSize: 10, color: '#94a3b8', marginTop: 3,
                      textAlign: msg.sender_role === 'user' ? 'right' : 'left',
                      paddingLeft: 4,
                    }}>
                      {msg.sender_role === 'user' ? '👤 Employee'
                        : msg.sender_role === 'admin' ? '🛡️ Admin'
                        : '🤖 AI'} · {formatTime(msg.created_at)}
                    </div>
                  </div>
                  {msg.sender_role === 'user' && (
                    <Avatar name={selectedSession.employee_name} size={28} />
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  page: {
    display: 'flex',
    height: '100%',           // fills AdminLayout's <Outlet> area
    minHeight: 0,
    fontFamily: 'system-ui, sans-serif',
    background: '#f8fafc',
    overflow: 'hidden',
  },
  sidebar: {
    width: 320, flexShrink: 0,
    background: '#fff', borderRight: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '16px 14px 12px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  sessionList: {
    flex: 1, overflowY: 'auto', padding: 10,
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  placeholder: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  chatHeader: {
    padding: '14px 20px', background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexShrink: 0,
  },
  chatMessages: {
    flex: 1, overflowY: 'auto', padding: '20px',
  },
  badge: {
    padding: '3px 9px', borderRadius: 20,
    fontSize: 11, fontWeight: 600,
    textTransform: 'capitalize', whiteSpace: 'nowrap',
  },
};