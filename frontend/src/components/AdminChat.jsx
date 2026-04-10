
import React, { useEffect, useState, useRef } from 'react';

const API_BASE = 'http://localhost:5000/api';

const AdminChat = () => {
const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const [myId, setMyId] = useState(null);
const messagesEndRef = useRef(null);
const pollRef = useRef(null);

const token = localStorage.getItem('token');

useEffect(() => {
try {
const payload = JSON.parse(atob(token.split('.')[1]));
setMyId(payload.id || payload.userId || payload.sub);
} catch (e) {
console.warn('token decode failed', e);
}
}, [token]);

const fetchUsers = async () => {
try {
const res = await fetch(`${API_BASE}/chat/admin/users`, {
headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
if (data.success) setUsers(data.data);
} catch (err) {
console.error('fetchUsers error:', err);
}
};

const fetchMessages = async (userId) => {
try {
const res = await fetch(`${API_BASE}/chat/admin/${userId}`, {
headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
if (data.success) setMessages(data.data);
} catch (err) {
console.error('fetchMessages error:', err);
}
};

const sendMessage = async () => {
const text = input.trim();
if (!text || !selectedUser) return;
setInput('');
try {
await fetch(`${API_BASE}/chat/admin/send`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({ receiver_id: selectedUser, message: text }),
});
fetchMessages(selectedUser);
} catch (err) {
console.error('send error', err);
}
};

const selectUser = (userId) => {
setSelectedUser(userId);
fetchMessages(userId);
if (pollRef.current) clearInterval(pollRef.current);
pollRef.current = setInterval(() => fetchMessages(userId), 5000);
};

useEffect(() => {
fetchUsers();
return () => {
if (pollRef.current) clearInterval(pollRef.current);
};
}, []);

useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

return (
<div style={{ display:'flex', height:'600px', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden', fontFamily:'inherit', background:'var(--bg1)' }}>

<div style={{ width:'260px', borderRight:'1px solid var(--border)', overflowY:'auto', background:'var(--bg2)', display:'flex', flexDirection:'column' }}>
<div style={{ padding:'14px 16px', fontWeight:'600', fontSize:'0.9rem', borderBottom:'1px solid var(--border)', color:'var(--text)', background:'var(--bg2)', flexShrink:0 }}>
💬 Employee Chats
</div>

{users.length === 0 && (
<div style={{ padding:'20px 16px', color:'var(--text3)', fontSize:'0.82rem' }}>
No conversations yet.
</div>
)}

{users.map(u => (
<div
key={u.id}
onClick={() => selectUser(u.id)}
style={{
padding:'12px 16px',
cursor:'pointer',
background: selectedUser === u.id ? 'rgba(124,107,255,0.12)' : 'transparent',
borderLeft: selectedUser === u.id ? '3px solid var(--accent)' : '3px solid transparent',
transition:'background 0.15s',
}}
onMouseEnter={e => { if (selectedUser !== u.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
onMouseLeave={e => { if (selectedUser !== u.id) e.currentTarget.style.background = 'transparent'; }}
>
<div style={{ fontWeight:'500', fontSize:'0.85rem', color:'var(--text)' }}>
{u.name || u.email}
</div>
<div style={{ fontSize:'0.72rem', color:'var(--text3)', marginTop:'2px', fontFamily:'var(--mono)' }}>
{u.email}
</div>
{u.last_message && (
<div style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
{u.last_message}
</div>
)}
</div>
))}
</div>

<div style={{ flex:1, display:'flex', flexDirection:'column', background:'var(--bg1)', minWidth:0 }}>

<div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', fontWeight:'600', color:'var(--text)', fontSize:'0.9rem', background:'var(--bg2)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
{selectedUser ? (
<>
<div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', color:'#fff', fontWeight:700, flexShrink:0 }}>
{(users.find(u => u.id === selectedUser)?.name || users.find(u => u.id === selectedUser)?.email || '?')[0].toUpperCase()}
</div>
<div>
<div style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--text)' }}>
{users.find(u => u.id === selectedUser)?.name || users.find(u => u.id === selectedUser)?.email || 'Chat'}
</div>
<div style={{ fontSize:'0.7rem', color:'var(--text3)', fontFamily:'var(--mono)' }}>
{users.find(u => u.id === selectedUser)?.email}
</div>
</div>
</>
) : (
<span style={{ color:'var(--text3)' }}>Select an employee to chat</span>
)}
</div>

<div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px', background:'var(--bg)' }}>
{!selectedUser && (
<div style={{ textAlign:'center', color:'var(--text3)', marginTop:'40px', fontSize:'0.85rem' }}>
👈 Select an employee from the left panel
</div>
)}
{messages.map((m, i) => {
const isMe = String(m.sender_id) === String(myId);
return (
<div key={i} style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
<div style={{
maxWidth:'70%',
padding:'9px 13px',
borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
background: isMe ? 'linear-gradient(135deg, var(--accent), #9d8fff)' : 'var(--bg3)',
color: isMe ? '#fff' : 'var(--text)',
fontSize:'0.84rem',
lineHeight:'1.5',
wordBreak:'break-word',
border: isMe ? 'none' : '1px solid var(--border)',
}}>
{m.message}
<div style={{ fontSize:'0.68rem', opacity:0.55, marginTop:'4px', textAlign: isMe ? 'right' : 'left', fontFamily:'var(--mono)' }}>
{new Date(m.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
</div>
</div>
</div>
);
})}
<div ref={messagesEndRef} />
</div>

{selectedUser && (
<div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:'8px', background:'var(--bg2)', flexShrink:0 }}>
<input
value={input}
onChange={e => setInput(e.target.value)}
onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
placeholder="Type a reply..."
style={{
flex:1,
padding:'9px 12px',
borderRadius:'10px',
border:'1.5px solid var(--border)',
outline:'none',
fontSize:'0.85rem',
fontFamily:'inherit',
background:'var(--bg)',
color:'var(--text)',
transition:'border-color 0.15s',
}}
onFocus={e => e.target.style.borderColor = 'var(--accent)'}
onBlur={e => e.target.style.borderColor = 'var(--border)'}
/>
<button
onClick={sendMessage}
disabled={!input.trim()}
style={{
padding:'9px 18px',
borderRadius:'10px',
border:'none',
cursor: input.trim() ? 'pointer' : 'not-allowed',
background: input.trim() ? 'linear-gradient(135deg, var(--accent), #9d8fff)' : 'var(--bg3)',
color: input.trim() ? '#fff' : 'var(--text3)',
fontWeight:'600',
fontSize:'0.85rem',
fontFamily:'inherit',
transition:'all 0.15s',
display:'flex',
alignItems:'center',
gap:6,
}}
>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
</svg>
Send
</button>
</div>
)}
</div>
</div>
);
};

export default AdminChat;