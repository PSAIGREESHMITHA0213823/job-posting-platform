import React, { useEffect, useState, useRef } from 'react';

const API_BASE = 'http://localhost:5000/api';

const AdminChat = () => {
  const [users, setUsers]           = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [myId, setMyId]             = useState(null);
  const messagesEndRef              = useRef(null);
  const pollRef                     = useRef(null);

  const token = localStorage.getItem('token');

  // decode admin's own ID from JWT once
  useEffect(() => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setMyId(payload.id || payload.userId || payload.sub);
    } catch (e) {
      console.warn('Could not decode token', e);
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res  = await fetch(`${API_BASE}/chat/admin/users`, {
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
      const res  = await fetch(`${API_BASE}/chat/admin/${userId}`, {
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
      console.error('sendMessage error:', err);
    }
  };

  const selectUser = (userId) => {
    setSelectedUser(userId);
    fetchMessages(userId);
    // poll every 5s for new messages
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(userId), 5000);
  };

  useEffect(() => {
    fetchUsers();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display:'flex', height:'600px', border:'1px solid #e2e8f0', borderRadius:'12px', overflow:'hidden', fontFamily:'inherit' }}>

      {/* LEFT: User list */}
      <div style={{ width:'260px', borderRight:'1px solid #e2e8f0', overflowY:'auto', background:'#fafbff' }}>
        <div style={{ padding:'14px 16px', fontWeight:'600', fontSize:'0.9rem', borderBottom:'1px solid #e2e8f0', color:'#1e293b' }}>
          Employee Chats
        </div>
        {users.length === 0 && (
          <div style={{ padding:'20px 16px', color:'#94a3b8', fontSize:'0.82rem' }}>No conversations yet.</div>
        )}
        {users.map(u => (
          <div key={u.id}
            onClick={() => selectUser(u.id)}
            style={{
              padding:'12px 16px', cursor:'pointer',
              background: selectedUser === u.id ? '#ede9fe' : 'transparent',
              borderLeft: selectedUser === u.id ? '3px solid #6366f1' : '3px solid transparent',
              transition:'background 0.15s',
            }}
            onMouseEnter={e => { if (selectedUser !== u.id) e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseLeave={e => { if (selectedUser !== u.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ fontWeight:'500', fontSize:'0.85rem', color:'#1e293b' }}>{u.email}</div>
            {u.last_message && (
              <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {u.last_message}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT: Chat area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#fff' }}>

        {/* Header */}
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #e2e8f0', fontWeight:'600', color:'#1e293b', fontSize:'0.9rem' }}>
          {selectedUser
            ? users.find(u => u.id === selectedUser)?.email || 'Chat'
            : 'Select an employee to chat'}
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
          {!selectedUser && (
            <div style={{ textAlign:'center', color:'#94a3b8', marginTop:'40px', fontSize:'0.85rem' }}>
              👈 Select an employee from the left panel
            </div>
          )}
          {messages.map((m, i) => {
            // FIX: use myId to determine which side the bubble goes
            const isMe = String(m.sender_id) === String(myId);
            return (
              <div key={i} style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth:'70%', padding:'9px 13px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? 'linear-gradient(135deg,#6366f1,#818cf8)' : '#f1f5f9',
                  color: isMe ? '#fff' : '#1e293b',
                  fontSize:'0.84rem', lineHeight:'1.5', wordBreak:'break-word',
                }}>
                  {m.message}
                  <div style={{ fontSize:'0.68rem', opacity:0.65, marginTop:'4px', textAlign: isMe ? 'right' : 'left' }}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {selectedUser && (
          <div style={{ padding:'12px 16px', borderTop:'1px solid #e2e8f0', display:'flex', gap:'8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Type a reply..."
              style={{
                flex:1, padding:'9px 12px', borderRadius:'10px',
                border:'1.5px solid #e2e8f0', outline:'none', fontSize:'0.85rem',
                fontFamily:'inherit',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{
                padding:'9px 18px', borderRadius:'10px', border:'none', cursor:'pointer',
                background: input.trim() ? 'linear-gradient(135deg,#6366f1,#818cf8)' : '#e2e8f0',
                color: input.trim() ? '#fff' : '#94a3b8',
                fontWeight:'600', fontSize:'0.85rem', transition:'all 0.15s',
              }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;