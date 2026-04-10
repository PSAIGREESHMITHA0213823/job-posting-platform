
// import React, { useEffect, useState, useRef } from 'react';

// const API_BASE = 'http://localhost:5000/api';
// const EMOJI_LIST = ['👍','❤️','😂','😮','😢','🙏'];

// const groupReactions = (reactions = []) => {
//   const map = {};
//   for (const r of reactions) {
//     map[r.emoji] = map[r.emoji] || [];
//     map[r.emoji].push(String(r.user_id));
//   }
//   return map;
// };

// const AdminChat = () => {
//   const [users, setUsers]               = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages]         = useState([]);
//   const [input, setInput]               = useState('');
//   const [myId, setMyId]                 = useState(null);
//   const [emojiPicker, setEmojiPicker]   = useState(null);
//   const [hoveredId, setHoveredId]       = useState(null);

//   const messagesEndRef  = useRef(null);
//   const pollRef         = useRef(null);
//   const mutatingRef     = useRef(false);
//   const selectedUserRef = useRef(null); // keep latest selectedUser for poll closure
//   const token           = localStorage.getItem('token');

//   // keep ref in sync
//   useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

//   // decode admin ID from JWT
//   useEffect(() => {
//     try {
//       const p = JSON.parse(atob(token.split('.')[1]));
//       const id = String(p.id || p.userId || p.sub || '');
//       console.log('AdminChat myId:', id);
//       setMyId(id);
//     } catch (e) { console.warn('token decode failed', e); }
//   }, [token]);

//   // close emoji picker on outside click
//   useEffect(() => {
//     const h = (e) => {
//       if (!e.target.closest('.adm-emoji-wrap')) setEmojiPicker(null);
//     };
//     document.addEventListener('click', h);
//     return () => document.removeEventListener('click', h);
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/chat/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
//       const data = await res.json();
//       if (data.success) setUsers(data.data);
//     } catch (e) { console.error('fetchUsers', e); }
//   };

//   // raw fetch — does NOT check mutatingRef (used after mutations too)
//   const fetchMessagesRaw = async (userId) => {
//     try {
//       const res  = await fetch(`${API_BASE}/chat/admin/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
//       const data = await res.json();
//       if (data.success) setMessages(data.data);
//     } catch (e) { console.error('fetchMessages', e); }
//   };

//   // poll version — skips if mutating
//   const fetchMessagesPoll = async (userId) => {
//     if (mutatingRef.current) return;
//     await fetchMessagesRaw(userId);
//   };

//   const sendMessage = async () => {
//     const text = input.trim();
//     if (!text || !selectedUser) return;
//     setInput('');
//     try {
//       await fetch(`${API_BASE}/chat/admin/send`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ receiver_id: selectedUser, message: text }),
//       });
//       await fetchMessagesRaw(selectedUser);
//       fetchUsers();
//     } catch (e) { console.error('sendMessage', e); }
//   };

//   const deleteMessage = async (msgId) => {
//     setEmojiPicker(null);
//     mutatingRef.current = true;
//     // optimistic
//     setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deleted_at: new Date().toISOString() } : m));
//     try {
//       await fetch(`${API_BASE}/chat/admin/${msgId}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//     } catch (e) { console.error('delete failed', e); }
//     finally {
//       mutatingRef.current = false;
//       if (selectedUser) await fetchMessagesRaw(selectedUser);
//     }
//   };

//   const reactToMessage = async (msgId, emoji) => {
//     setEmojiPicker(null);
//     mutatingRef.current = true;
//     try {
//       const res  = await fetch(`${API_BASE}/chat/admin/${msgId}/react`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ emoji }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         // apply immediately from server response
//         setMessages(prev => prev.map(m =>
//           m.id === msgId ? { ...m, reactions: data.reactions } : m
//         ));
//       }
//     } catch (e) { console.error('react failed', e); }
//     finally {
//       mutatingRef.current = false;
//       // confirming refetch AFTER mutation flag is cleared
//       if (selectedUser) await fetchMessagesRaw(selectedUser);
//     }
//   };

//   const selectUser = (userId) => {
//     setSelectedUser(userId);
//     fetchMessagesRaw(userId);
//     if (pollRef.current) clearInterval(pollRef.current);
//     pollRef.current = setInterval(() => {
//       const uid = selectedUserRef.current;
//       if (uid) fetchMessagesPoll(uid);
//     }, 5000);
//   };

//   useEffect(() => {
//     fetchUsers();
//     const userPoll = setInterval(fetchUsers, 10000);
//     return () => {
//       clearInterval(userPoll);
//       if (pollRef.current) clearInterval(pollRef.current);
//     };
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   return (
//     <>
//       <style>{`
//         @keyframes fadeIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
//         .adm-bubble-row { position:relative; display:flex; }
//         .adm-actions {
//           position:absolute; top:-36px; gap:4px; z-index:20;
//           padding:6px 4px 10px 4px;
//           background:transparent;
//         }
//         .adm-actions.right { right:0; }
//         .adm-actions.left  { left:0; }
//         .adm-act-btn {
//           border:none; background:#fff; border-radius:16px; padding:4px 8px;
//           font-size:0.8rem; cursor:pointer; white-space:nowrap;
//           box-shadow:0 2px 8px rgba(0,0,0,0.12); line-height:1;
//         }
//         .adm-act-btn:hover { background:#f1f5f9; }
//         .adm-emoji-wrap { position:relative; }
//         .adm-emoji-picker {
//           position:absolute; background:#fff; border-radius:30px;
//           box-shadow:0 4px 20px rgba(0,0,0,0.15); padding:6px 10px;
//           display:flex; gap:4px; z-index:99; bottom:36px;
//           animation:fadeIn 0.12s ease;
//         }
//         .adm-emoji-picker.right { right:0; }
//         .adm-emoji-picker.left  { left:0; }
//         .adm-emoji-btn {
//           background:none; border:none; font-size:1.2rem; cursor:pointer;
//           padding:2px 3px; border-radius:6px; transition:transform 0.1s;
//         }
//         .adm-emoji-btn:hover { transform:scale(1.3); }
//         .react-pill {
//           display:inline-flex; align-items:center; gap:3px;
//           background:#f1f5f9; border-radius:20px; padding:2px 8px;
//           font-size:0.76rem; cursor:pointer; border:1.5px solid transparent;
//           transition:all 0.1s;
//         }
//         .react-pill:hover  { border-color:#6366f1; }
//         .react-pill.mine   { background:#ede9fe; border-color:#a5b4fc; }
//         .user-row { padding:12px 16px; cursor:pointer; border-left:3px solid transparent; transition:background 0.15s; }
//         .user-row:hover    { background:#f1f5f9; }
//         .user-row.selected { background:#ede9fe; border-left-color:#6366f1; }
//       `}</style>

//       <div style={{ display:'flex', height:'600px', border:'1px solid #e2e8f0', borderRadius:'12px', overflow:'hidden', fontFamily:'inherit' }}>

//         {/* LEFT: user list */}
//         <div style={{ width:'260px', borderRight:'1px solid #e2e8f0', overflowY:'auto', background:'#fafbff' }}>
//           <div style={{ padding:'14px 16px', fontWeight:'600', fontSize:'0.9rem', borderBottom:'1px solid #e2e8f0', color:'#1e293b' }}>
//             Employee Chats
//           </div>
//           {users.length === 0 && (
//             <div style={{ padding:'20px 16px', color:'#94a3b8', fontSize:'0.82rem' }}>No conversations yet.</div>
//           )}
//           {users.map(u => (
//             <div key={u.id}
//               className={`user-row ${selectedUser === u.id ? 'selected' : ''}`}
//               onClick={() => selectUser(u.id)}>
//               <div style={{ fontWeight:'500', fontSize:'0.85rem', color:'#1e293b' }}>{u.email}</div>
//               {u.last_message && (
//                 <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
//                   {u.last_message}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* RIGHT: chat */}
//         <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#fff' }}>
//           <div style={{ padding:'14px 18px', borderBottom:'1px solid #e2e8f0', fontWeight:'600', color:'#1e293b', fontSize:'0.9rem' }}>
//             {selectedUser ? users.find(u => u.id === selectedUser)?.email || 'Chat' : 'Select an employee'}
//           </div>

//           <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'14px' }}>
//             {!selectedUser && (
//               <div style={{ textAlign:'center', color:'#94a3b8', marginTop:'40px', fontSize:'0.85rem' }}>
//                 👈 Select an employee from the left panel
//               </div>
//             )}

//             {messages.map((m, i) => {
//               // FIX: always compare as strings
//               const isMe      = myId && String(m.sender_id) === String(myId);
//               const deleted   = !!m.deleted_at;
//               const grouped   = groupReactions(m.reactions);
//               const hasReacts = Object.keys(grouped).length > 0;

//               return (
//                 <div key={m.id || i}
//                   style={{ display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}
//                   onMouseEnter={() => setHoveredId(m.id)}
//                   onMouseLeave={() => setHoveredId(null)}>

//                   {/* bubble row with hover actions */}
//                   <div className="adm-bubble-row"
//                     style={{ justifyContent: isMe ? 'flex-end' : 'flex-start', width:'100%' }}>

//                     {/* hover action buttons — shown via state, not CSS hover */}
//                     {!deleted && hoveredId === m.id && (
//                       <div className={`adm-actions ${isMe ? 'right' : 'left'}`} style={{ display:'flex' }}>
//                         {/* emoji react */}
//                         <div className="adm-emoji-wrap">
//                           <button className="adm-act-btn"
//                             onClick={e => { e.stopPropagation(); setEmojiPicker(emojiPicker === m.id ? null : m.id); }}>
//                             😊
//                           </button>
//                           {emojiPicker === m.id && (
//                             <div className={`adm-emoji-picker ${isMe ? 'right' : 'left'}`}
//                               onClick={e => e.stopPropagation()}>
//                               {EMOJI_LIST.map(em => (
//                                 <button key={em} className="adm-emoji-btn"
//                                   onClick={() => reactToMessage(m.id, em)}>{em}</button>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                         {/* FIX: show delete for admin's own messages */}
//                         {isMe && (
//                           <button className="adm-act-btn" style={{ color:'#ef4444' }}
//                             onClick={e => { e.stopPropagation(); deleteMessage(m.id); }}>
//                             🗑️ Delete
//                           </button>
//                         )}
//                       </div>
//                     )}

//                     {/* bubble */}
//                     <div style={{
//                       maxWidth:'65%', padding:'9px 13px',
//                       borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
//                       background: deleted ? '#f1f5f9' : isMe ? 'linear-gradient(135deg,#6366f1,#818cf8)' : '#f1f5f9',
//                       color: deleted ? '#94a3b8' : isMe ? '#fff' : '#1e293b',
//                       fontSize:'0.84rem', lineHeight:'1.5',
//                       fontStyle: deleted ? 'italic' : 'normal',
//                       wordBreak:'break-word',
//                     }}>
//                       {deleted ? '🚫 This message was deleted' : m.message}
//                       <div style={{ fontSize:'0.68rem', opacity:0.55, marginTop:'3px', textAlign: isMe ? 'right' : 'left' }}>
//                         {new Date(m.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
//                       </div>
//                     </div>
//                   </div>

//                   {/* reaction pills */}
//                   {hasReacts && (
//                     <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginTop:'4px', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
//                       {Object.entries(grouped).map(([emoji, userIds]) => {
//                         const iMine = userIds.includes(String(myId));
//                         return (
//                           <button key={emoji}
//                             className={`react-pill ${iMine ? 'mine' : ''}`}
//                             onClick={() => reactToMessage(m.id, emoji)}>
//                             {emoji} <span style={{ fontSize:'0.72rem', color:'#64748b' }}>{userIds.length}</span>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//             <div ref={messagesEndRef} />
//           </div>

//           {selectedUser && (
//             <div style={{ padding:'12px 16px', borderTop:'1px solid #e2e8f0', display:'flex', gap:'8px' }}>
//               <input
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
//                 placeholder="Type a reply..."
//                 style={{ flex:1, padding:'9px 12px', borderRadius:'10px', border:'1.5px solid #e2e8f0', outline:'none', fontSize:'0.85rem', fontFamily:'inherit' }}
//                 onFocus={e => e.target.style.borderColor = '#6366f1'}
//                 onBlur={e => e.target.style.borderColor = '#e2e8f0'}
//               />
//               <button onClick={sendMessage} disabled={!input.trim()}
//                 style={{
//                   padding:'9px 18px', borderRadius:'10px', border:'none', cursor:'pointer',
//                   background: input.trim() ? 'linear-gradient(135deg,#6366f1,#818cf8)' : '#e2e8f0',
//                   color: input.trim() ? '#fff' : '#94a3b8', fontWeight:'600', fontSize:'0.85rem',
//                 }}>
//                 Send
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default AdminChat;
import React, { useEffect, useState, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────────────────────── */
const API_BASE   = 'http://localhost:5000/api';
const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '✅'];

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const groupReactions = (reactions = []) => {
  const map = {};
  for (const r of reactions) {
    map[r.emoji] = map[r.emoji] || [];
    map[r.emoji].push(String(r.user_id));
  }
  return map;
};

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDay = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const initials = (email = '') =>
  email.split('@')[0].slice(0, 2).toUpperCase();

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES  (injected once via <style> tag)
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:          #0b0b10;
  --bg1:         #111118;
  --bg2:         #18181f;
  --bg3:         #20202a;
  --bg4:         #282834;
  --border:      #27273a;
  --border2:     #32324a;
  --text:        #eaeaf4;
  --text2:       #9494b4;
  --text3:       #4a4a6a;
  --accent:      #7c6bff;
  --accent-dim:  rgba(124,107,255,0.14);
  --accent-glow: rgba(124,107,255,0.08);
  --green:       #22c55e;
  --green-dim:   rgba(34,197,94,0.12);
  --red:         #ef4444;
  --red-dim:     rgba(239,68,68,0.12);
  --amber:       #f59e0b;
  --amber-dim:   rgba(245,158,11,0.12);
  --cyan:        #06b6d4;
  --r:           10px;
  --mono:        'JetBrains Mono', monospace;
  --sans:        'DM Sans', system-ui, sans-serif;
  --transition:  0.18s cubic-bezier(0.4,0,0.2,1);
}

body {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ── Scrollbar ─────────────────────────────────────────────── */
::-webkit-scrollbar       { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: var(--text3); }

/* ── Layout ────────────────────────────────────────────────── */
.adm-root {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--sans);
}

/* ── Sidebar ───────────────────────────────────────────────── */
.adm-sidebar {
  width: 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  background: var(--bg1);
  border-right: 1px solid var(--border);
}

.adm-sidebar-header {
  padding: 20px 18px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.adm-sidebar-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.3px;
}

.adm-sidebar-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.adm-live-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 8px rgba(34,197,94,0.6);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

.adm-live-label {
  font-size: 11px;
  color: var(--green);
  font-family: var(--mono);
}

/* Search */
.adm-search-wrap {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}

.adm-search {
  width: 100%;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 8px 12px 8px 34px;
  color: var(--text);
  font-size: 13px;
  font-family: var(--sans);
  outline: none;
  transition: border-color var(--transition);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%234a4a6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 10px center;
}
.adm-search::placeholder { color: var(--text3); }
.adm-search:focus { border-color: var(--accent); }

/* User list */
.adm-user-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.adm-user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background var(--transition);
  margin-bottom: 2px;
  border: 1px solid transparent;
  position: relative;
}
.adm-user-item:hover { background: var(--bg2); }
.adm-user-item.active {
  background: var(--accent-dim);
  border-color: rgba(124,107,255,0.2);
}

.adm-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600;
  flex-shrink: 0;
  position: relative;
  border: 1.5px solid var(--border2);
  letter-spacing: 0.4px;
}
.adm-avatar-online::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 9px; height: 9px;
  background: var(--green);
  border-radius: 50%;
  border: 2px solid var(--bg1);
}
.adm-av-0 { background: rgba(124,107,255,0.15); color: #b3aaff; border-color: rgba(124,107,255,0.2); }
.adm-av-1 { background: rgba(34,197,94,0.12);  color: #4ade80; border-color: rgba(34,197,94,0.2);  }
.adm-av-2 { background: rgba(6,182,212,0.12);   color: #22d3ee; border-color: rgba(6,182,212,0.2);  }
.adm-av-3 { background: rgba(245,158,11,0.12);  color: #fbbf24; border-color: rgba(245,158,11,0.2); }
.adm-av-4 { background: rgba(239,68,68,0.12);   color: #f87171; border-color: rgba(239,68,68,0.2);  }
.adm-av-5 { background: rgba(168,85,247,0.12);  color: #c084fc; border-color: rgba(168,85,247,0.2); }

.adm-user-info { flex: 1; min-width: 0; }
.adm-user-name {
  font-size: 13px; font-weight: 500;
  color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 2px;
}
.adm-user-item.active .adm-user-name { color: #b3aaff; }
.adm-user-preview {
  font-size: 11.5px; color: var(--text3);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.adm-unread {
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  font-family: var(--mono);
  padding: 2px 7px;
  border-radius: 20px;
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.adm-user-time {
  font-size: 10px;
  color: var(--text3);
  font-family: var(--mono);
  position: absolute;
  top: 10px; right: 10px;
}

/* ── Chat Main ─────────────────────────────────────────────── */
.adm-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  min-width: 0;
}

/* Header */
.adm-chat-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg1);
  min-height: 65px;
}

.adm-chat-header-info { flex: 1; min-width: 0; }
.adm-chat-header-name { font-size: 14px; font-weight: 600; color: var(--text); }
.adm-chat-header-status {
  font-size: 12px;
  color: var(--green);
  display: flex; align-items: center; gap: 5px;
  margin-top: 2px;
}
.adm-chat-header-status.offline { color: var(--text3); }
.adm-status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.adm-header-actions { display: flex; gap: 6px; }
.adm-icon-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--bg2);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--transition), border-color var(--transition);
  color: var(--text2);
}
.adm-icon-btn:hover { background: var(--bg3); border-color: var(--border2); color: var(--text); }
.adm-icon-btn svg { width: 14px; height: 14px; }

/* Messages */
.adm-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.adm-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text3);
  gap: 12px;
}
.adm-empty-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--bg2);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
}
.adm-empty-icon svg { width: 22px; height: 22px; }
.adm-empty-title { font-size: 14px; font-weight: 500; color: var(--text2); }
.adm-empty-sub   { font-size: 12px; color: var(--text3); }

/* Day separator */
.adm-day-sep {
  display: flex; align-items: center; gap: 10px;
  margin: 12px 0 10px;
}
.adm-day-line { flex: 1; height: 1px; background: var(--border); }
.adm-day-label { font-size: 11px; color: var(--text3); font-family: var(--mono); white-space: nowrap; }

/* Message group */
.adm-msg-group { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }

.adm-msg-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.adm-msg-row.me { flex-direction: row-reverse; }

.adm-bubble-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 600;
  flex-shrink: 0;
  margin-bottom: 2px;
  border: 1.5px solid var(--border2);
}

.adm-bubble {
  max-width: 62%;
  padding: 10px 14px;
  font-size: 13.5px;
  line-height: 1.55;
  word-break: break-word;
  position: relative;
  transition: opacity var(--transition);
}

.adm-bubble.them {
  background: var(--bg2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 4px 16px 16px 16px;
}
.adm-bubble.me {
  background: var(--accent);
  color: #fff;
  border-radius: 16px 4px 16px 16px;
}
.adm-bubble.deleted {
  background: var(--bg2);
  color: var(--text3);
  border-color: var(--border);
  font-style: italic;
  border-radius: 10px;
}

.adm-bubble-time {
  font-size: 10.5px;
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--mono);
}
.adm-bubble.them .adm-bubble-time { color: var(--text3); }
.adm-bubble.me   .adm-bubble-time { color: rgba(255,255,255,0.5); justify-content: flex-end; }

.adm-bubble-spacer { width: 36px; flex-shrink: 0; }

/* Reactions row */
.adm-react-row {
  display: flex; gap: 4px; flex-wrap: wrap;
  margin: 3px 0 4px 36px;
}
.adm-react-row.me { justify-content: flex-end; margin-left: 0; margin-right: 36px; }

.adm-react-pill {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 20px;
  padding: 3px 9px;
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition);
  color: var(--text2);
  font-family: var(--sans);
}
.adm-react-pill:hover { border-color: var(--accent); background: var(--accent-dim); }
.adm-react-pill.mine  { background: var(--accent-dim); border-color: rgba(124,107,255,0.35); color: #b3aaff; }
.adm-react-pill span  { font-size: 11px; }

/* Typing indicator */
.adm-typing-row {
  display: flex; align-items: flex-end; gap: 8px; margin-top: 4px;
}
.adm-typing-bubble {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 4px 16px 16px 16px;
  padding: 12px 16px;
  display: flex; gap: 5px; align-items: center;
}
.adm-typing-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--text3);
  animation: adm-bounce 1.4s ease-in-out infinite;
}
.adm-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.adm-typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes adm-bounce {
  0%,60%,100% { transform: translateY(0); }
  30%          { transform: translateY(-6px); }
}

/* ── Input Area ────────────────────────────────────────────── */
.adm-input-area {
  padding: 14px 18px;
  border-top: 1px solid var(--border);
  background: var(--bg1);
  display: flex;
  align-items: flex-end;
  gap: 10px;
  position: relative;
}

.adm-attach-btn {
  width: 36px; height: 36px;
  border-radius: 9px;
  border: 1px solid var(--border2);
  background: var(--bg2);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition), border-color var(--transition);
  color: var(--text3);
}
.adm-attach-btn:hover { background: var(--bg3); color: var(--text2); }
.adm-attach-btn svg { width: 15px; height: 15px; }

.adm-input-wrap {
  flex: 1;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 12px;
  padding: 10px 14px;
  display: flex; align-items: flex-end; gap: 8px;
  transition: border-color var(--transition);
}
.adm-input-wrap:focus-within { border-color: var(--accent); }

.adm-textarea {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 13.5px;
  font-family: var(--sans);
  resize: none;
  line-height: 1.5;
  max-height: 120px;
  min-height: 22px;
}
.adm-textarea::placeholder { color: var(--text3); }

.adm-emoji-trigger {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text3);
  padding: 2px;
  border-radius: 6px;
  transition: color var(--transition);
  display: flex; align-items: center;
  flex-shrink: 0;
}
.adm-emoji-trigger:hover { color: var(--text2); }
.adm-emoji-trigger svg { width: 16px; height: 16px; }

.adm-send-btn {
  width: 36px; height: 36px;
  border-radius: 9px;
  border: none;
  background: var(--accent);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: opacity var(--transition), transform var(--transition);
  color: #fff;
}
.adm-send-btn:hover:not(:disabled) { opacity: 0.85; }
.adm-send-btn:active:not(:disabled) { transform: scale(0.94); }
.adm-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.adm-send-btn svg { width: 15px; height: 15px; }

/* Emoji picker */
.adm-emoji-picker {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 18px;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 14px;
  padding: 10px 12px;
  display: flex; gap: 6px; flex-wrap: wrap;
  z-index: 100;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  max-width: 220px;
  animation: adm-pop 0.12s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes adm-pop {
  from { opacity: 0; transform: scale(0.85) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.adm-emoji-opt {
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  border: none;
  background: none;
  transition: background var(--transition), transform 0.1s;
  line-height: 1;
}
.adm-emoji-opt:hover { background: var(--bg3); transform: scale(1.2); }

/* Message action hover */
.adm-msg-actions {
  position: absolute;
  top: -32px;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 4px;
  display: flex; gap: 2px;
  z-index: 20;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  animation: adm-pop 0.1s ease;
}
.adm-msg-actions.me  { right: 0; }
.adm-msg-actions.them { left: 0; }
.adm-msg-act-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text2);
  transition: background var(--transition), color var(--transition);
  display: flex; align-items: center; gap: 4px;
}
.adm-msg-act-btn:hover { background: var(--bg3); color: var(--text); }
.adm-msg-act-btn.danger { color: var(--red); }
.adm-msg-act-btn.danger:hover { background: var(--red-dim); }

/* Alert */
.adm-alert {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; padding: 10px 14px; border-radius: 8px;
  font-size: 12.5px; margin: 10px 20px 0;
}
.adm-alert-error   { background: var(--red-dim);   border: 1px solid rgba(239,68,68,0.2);   color: #fca5a5; }
.adm-alert-success { background: var(--green-dim);  border: 1px solid rgba(34,197,94,0.2);   color: #86efac; }

/* No conv selected */
.adm-no-conv {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 14px;
  color: var(--text3);
  background: var(--bg);
}
.adm-no-conv-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: var(--bg2);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
}
.adm-no-conv-icon svg { width: 26px; height: 26px; }

/* Responsive */
@media (max-width: 680px) {
  .adm-sidebar { width: 220px; min-width: 220px; }
  .adm-bubble  { max-width: 80%; }
}
@media (max-width: 500px) {
  .adm-sidebar { display: none; }
}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   SVG ICON COMPONENTS
───────────────────────────────────────────────────────────────────────────── */
const Icon = {
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Emoji: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 13s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Attach: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 011 1.24 2 2 0 013 .06h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Chat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  CheckDouble: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

/* ─────────────────────────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────────────────────────── */
const AV_CLASSES = ['adm-av-0', 'adm-av-1', 'adm-av-2', 'adm-av-3', 'adm-av-4', 'adm-av-5'];

const getAvClass = (email = '') => {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
  return AV_CLASSES[h % AV_CLASSES.length];
};

const Avatar = ({ email, size = 38, online = false, className = '' }) => (
  <div
    className={`adm-avatar ${getAvClass(email)} ${online ? 'adm-avatar-online' : ''} ${className}`}
    style={{ width: size, height: size, fontSize: size * 0.3 }}
  >
    {initials(email)}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────────────────────────────────────── */
const TypingIndicator = ({ email }) => (
  <div className="adm-typing-row">
    <Avatar email={email} size={28} className="" />
    <div className="adm-typing-bubble">
      <div className="adm-typing-dot" />
      <div className="adm-typing-dot" />
      <div className="adm-typing-dot" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SINGLE MESSAGE BUBBLE
───────────────────────────────────────────────────────────────────────────── */
const MessageBubble = ({ msg, isMe, user, myId, onReact, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const deleted  = !!msg.deleted_at;
  const grouped  = groupReactions(msg.reactions);
  const hasReact = Object.keys(grouped).length > 0;

  return (
    <div
      className="adm-msg-group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setEmojiOpen(false); }}
    >
      <div className={`adm-msg-row ${isMe ? 'me' : ''}`}>
        {/* avatar placeholder for alignment */}
        {isMe
          ? <div className="adm-bubble-spacer" />
          : <Avatar email={user?.email || ''} size={28} />
        }

        <div className="adm-bubble" style={{ position: 'relative' }} >
          {/* hover actions */}
          {!deleted && hovered && (
            <div className={`adm-msg-actions ${isMe ? 'me' : 'them'}`}>
              <button
                className="adm-msg-act-btn"
                title="React"
                onClick={(e) => { e.stopPropagation(); setEmojiOpen(p => !p); }}
              >
                😊
              </button>
              {isMe && (
                <button
                  className="adm-msg-act-btn danger"
                  title="Delete"
                  onClick={() => onDelete(msg.id)}
                >
                  <Icon.Trash />
                </button>
              )}
              {/* inline emoji picker */}
              {emojiOpen && (
                <div
                  className="adm-emoji-picker"
                  style={{ bottom: '36px', right: isMe ? 0 : 'auto', left: isMe ? 'auto' : 0 }}
                  onClick={e => e.stopPropagation()}
                >
                  {EMOJI_LIST.map(em => (
                    <button
                      key={em}
                      className="adm-emoji-opt"
                      onClick={() => { onReact(msg.id, em); setEmojiOpen(false); }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={`adm-bubble ${deleted ? 'deleted' : isMe ? 'me' : 'them'}`}>
            {deleted ? '🚫 This message was deleted' : msg.message}
            <div className="adm-bubble-time">
              {fmtTime(msg.created_at)}
              {isMe && !deleted && (
                <span style={{ opacity: 0.6, display: 'flex', alignItems: 'center' }}>
                  <Icon.CheckDouble />
                </span>
              )}
            </div>
          </div>
        </div>

        {!isMe && <div className="adm-bubble-spacer" />}
      </div>

      {/* reaction pills */}
      {hasReact && !deleted && (
        <div className={`adm-react-row ${isMe ? 'me' : ''}`}>
          {Object.entries(grouped).map(([emoji, uids]) => {
            const isMine = uids.includes(String(myId));
            return (
              <button
                key={emoji}
                className={`adm-react-pill ${isMine ? 'mine' : ''}`}
                onClick={() => onReact(msg.id, emoji)}
              >
                {emoji}
                <span>{uids.length}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const AdminChat = () => {
  /* ── state ── */
  const [users,        setUsers]        = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [myId,         setMyId]         = useState(null);
  const [search,       setSearch]       = useState('');
  const [typing,       setTyping]       = useState(false);
  const [emojiOpen,    setEmojiOpen]    = useState(false);
  const [alert,        setAlert]        = useState(null);    // { type, text }
  const [loading,      setLoading]      = useState(false);

  /* ── refs ── */
  const messagesEndRef  = useRef(null);
  const textareaRef     = useRef(null);
  const pollRef         = useRef(null);
  const mutatingRef     = useRef(false);
  const selectedUserRef = useRef(null);

  const token = localStorage.getItem('token');

  /* keep ref in sync */
  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  /* ── decode admin ID from JWT ── */
  useEffect(() => {
    try {
      const p  = JSON.parse(atob(token.split('.')[1]));
      const id = String(p.id || p.userId || p.sub || '');
      setMyId(id);
    } catch (e) { console.warn('token decode failed', e); }
  }, [token]);

  /* ── close emoji + message pickers on outside click ── */
  useEffect(() => {
    const h = (e) => {
      if (!e.target.closest('.adm-emoji-picker') && !e.target.closest('.adm-emoji-trigger'))
        setEmojiOpen(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  /* ── alert auto-dismiss ── */
  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 3500);
    return () => clearTimeout(t);
  }, [alert]);

  /* ── inject styles once ── */
  useEffect(() => {
    const id = 'adm-chat-styles';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  /* ── scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  /* ── API CALLS ── */
  const showAlert = (type, text) => setAlert({ type, text });

  const fetchUsers = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/chat/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (e) { console.error('fetchUsers', e); }
  }, [token]);

  const fetchMessagesRaw = useCallback(async (userId) => {
    try {
      const res  = await fetch(`${API_BASE}/chat/admin/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (e) { console.error('fetchMessages', e); }
  }, [token]);

  const fetchMessagesPoll = useCallback(async (userId) => {
    if (mutatingRef.current) return;
    await fetchMessagesRaw(userId);
  }, [fetchMessagesRaw]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedUser) return;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    try {
      const res = await fetch(`${API_BASE}/chat/admin/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ receiver_id: selectedUser, message: text }),
      });
      const data = await res.json();
      if (!data.success) { showAlert('error', 'Failed to send message.'); return; }
      await fetchMessagesRaw(selectedUser);
      fetchUsers();
    } catch (e) {
      showAlert('error', 'Network error — message not sent.');
      console.error('sendMessage', e);
    }
  };

  const deleteMessage = async (msgId) => {
    setEmojiOpen(false);
    mutatingRef.current = true;
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, deleted_at: new Date().toISOString() } : m
    ));
    try {
      await fetch(`${API_BASE}/chat/admin/${msgId}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) { console.error('delete failed', e); showAlert('error', 'Delete failed.'); }
    finally {
      mutatingRef.current = false;
      if (selectedUser) await fetchMessagesRaw(selectedUser);
    }
  };

  const reactToMessage = async (msgId, emoji) => {
    setEmojiOpen(false);
    mutatingRef.current = true;
    try {
      const res  = await fetch(`${API_BASE}/chat/admin/${msgId}/react`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ emoji }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, reactions: data.reactions } : m
        ));
      }
    } catch (e) { console.error('react failed', e); }
    finally {
      mutatingRef.current = false;
      if (selectedUser) await fetchMessagesRaw(selectedUser);
    }
  };

  const selectUser = (userId) => {
    setSelectedUser(userId);
    setMessages([]);
    setLoading(true);
    fetchMessagesRaw(userId).finally(() => setLoading(false));

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      const uid = selectedUserRef.current;
      if (uid) fetchMessagesPoll(uid);
    }, 5000);
  };

  /* ── initial data load ── */
  useEffect(() => {
    fetchUsers();
    const userPoll = setInterval(fetchUsers, 10000);
    return () => {
      clearInterval(userPoll);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchUsers]);

  /* ── helpers ── */
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (el) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const addEmoji = (em) => {
    setInput(p => p + em);
    setEmojiOpen(false);
    textareaRef.current?.focus();
  };

  /* ── derived data ── */
  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUserData = users.find(u => u.id === selectedUser);

  /* group messages by date for separators */
  const groupedMessages = () => {
    const result = [];
    let lastDay  = null;
    for (const m of messages) {
      const day = fmtDay(m.created_at);
      if (day !== lastDay) {
        result.push({ type: 'day', label: day, key: `day-${day}` });
        lastDay = day;
      }
      result.push({ type: 'msg', msg: m, key: m.id });
    }
    return result;
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="adm-root">
      {/* ── Sidebar ── */}
      <div className="adm-sidebar">
        <div className="adm-sidebar-header">
          <div className="adm-sidebar-title">Messages</div>
          <div className="adm-sidebar-meta">
            <div className="adm-live-dot" />
            <span className="adm-live-label">LIVE</span>
          </div>
        </div>

        <div className="adm-search-wrap">
          <input
            className="adm-search"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="adm-user-list">
          {filteredUsers.length === 0 && (
            <div style={{ padding: '20px 12px', color: 'var(--text3)', fontSize: '12px', textAlign: 'center' }}>
              No conversations yet.
            </div>
          )}
          {filteredUsers.map(u => (
            <div
              key={u.id}
              className={`adm-user-item ${selectedUser === u.id ? 'active' : ''}`}
              onClick={() => selectUser(u.id)}
            >
              <Avatar email={u.email} size={38} online={u.online} />
              <div className="adm-user-info">
                <div className="adm-user-name">{u.email}</div>
                {u.last_message && (
                  <div className="adm-user-preview">{u.last_message}</div>
                )}
              </div>
              {u.unread_count > 0 && (
                <div className="adm-unread">{u.unread_count}</div>
              )}
              {u.last_message_at && (
                <span className="adm-user-time">{fmtTime(u.last_message_at)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat Main ── */}
      <div className="adm-chat">
        {/* Header */}
        <div className="adm-chat-header">
          {selectedUserData ? (
            <>
              <Avatar email={selectedUserData.email} size={36} online={selectedUserData.online} />
              <div className="adm-chat-header-info">
                <div className="adm-chat-header-name">{selectedUserData.email}</div>
                <div className={`adm-chat-header-status ${selectedUserData.online ? '' : 'offline'}`}>
                  <div className="adm-status-dot" />
                  {selectedUserData.online ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="adm-header-actions">
                <button className="adm-icon-btn" title="Voice call"><Icon.Phone /></button>
                <button className="adm-icon-btn" title="Video call"><Icon.Video /></button>
                <button className="adm-icon-btn" title="Info"><Icon.Info /></button>
              </div>
            </>
          ) : (
            <span style={{ color: 'var(--text3)', fontSize: '13px', margin: 'auto' }}>
              Select an employee to start chatting
            </span>
          )}
        </div>

        {/* Alert bar */}
        {alert && (
          <div className={`adm-alert adm-alert-${alert.type}`}>
            <span>{alert.text}</span>
            <button
              onClick={() => setAlert(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '16px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Messages */}
        {!selectedUser ? (
          <div className="adm-no-conv">
            <div className="adm-no-conv-icon">
              <Icon.Chat />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text2)' }}>No conversation selected</div>
            <div style={{ fontSize: '12px' }}>Choose an employee from the sidebar</div>
          </div>
        ) : (
          <div className="adm-messages">
            {loading && (
              <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '12px', padding: '20px' }}>
                Loading messages…
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="adm-empty-state">
                <div className="adm-empty-icon">
                  <Icon.Chat />
                </div>
                <div className="adm-empty-title">No messages yet</div>
                <div className="adm-empty-sub">Send the first message below</div>
              </div>
            )}

            {groupedMessages().map(item => {
              if (item.type === 'day') {
                return (
                  <div key={item.key} className="adm-day-sep">
                    <div className="adm-day-line" />
                    <div className="adm-day-label">{item.label}</div>
                    <div className="adm-day-line" />
                  </div>
                );
              }
              const m    = item.msg;
              const isMe = myId && String(m.sender_id) === String(myId);
              return (
                <MessageBubble
                  key={item.key}
                  msg={m}
                  isMe={isMe}
                  user={selectedUserData}
                  myId={myId}
                  onReact={reactToMessage}
                  onDelete={deleteMessage}
                />
              );
            })}

            {typing && selectedUserData && (
              <TypingIndicator email={selectedUserData.email} />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        {selectedUser && (
          <div className="adm-input-area">
            <button className="adm-attach-btn" title="Attach file">
              <Icon.Attach />
            </button>

            <div className="adm-input-wrap">
              <textarea
                ref={textareaRef}
                className="adm-textarea"
                placeholder="Type a message…"
                value={input}
                rows={1}
                onChange={e => {
                  setInput(e.target.value);
                  autoResize(e.target);
                }}
                onKeyDown={handleKey}
              />
              <button
                className="adm-emoji-trigger"
                title="Emoji"
                onClick={e => { e.stopPropagation(); setEmojiOpen(p => !p); }}
              >
                <Icon.Emoji />
              </button>
            </div>

            <button
              className="adm-send-btn"
              disabled={!input.trim()}
              onClick={sendMessage}
              title="Send"
            >
              <Icon.Send />
            </button>

            {/* Emoji picker */}
            {emojiOpen && (
              <div className="adm-emoji-picker" onClick={e => e.stopPropagation()}>
                {EMOJI_LIST.map(em => (
                  <button key={em} className="adm-emoji-opt" onClick={() => addEmoji(em)}>
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;