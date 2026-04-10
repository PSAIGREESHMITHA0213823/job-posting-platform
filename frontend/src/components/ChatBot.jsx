
import React, { useState, useRef, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:5000/api';
const EMOJI_LIST = ['👍','❤️','😂','😮','😢','🙏'];

const TypingDots = () => (
  <div style={{ display:'flex', gap:'4px', alignItems:'center', padding:'4px 0' }}>
    {[0,1,2].map(i => (
      <span key={i} style={{
        width:'6px', height:'6px', borderRadius:'50%', background:'#6366f1',
        animation:'botDot 1.2s infinite', animationDelay:`${i*0.2}s`, display:'inline-block',
      }}/>
    ))}
  </div>
);

// group reactions by emoji and count them
const groupReactions = (reactions=[]) => {
  const map = {};
  for (const r of reactions) {
    map[r.emoji] = (map[r.emoji] || []);
    map[r.emoji].push(r.user_id);
  }
  return map;
};

const ChatBot = () => {
  const [open, setOpen]           = useState(false);
  const [mode, setMode]           = useState('ai');
  const [messages, setMessages]   = useState([
    { role:'assistant', content:"Hi there! 👋 I'm your career assistant. Ask me about jobs, applications, or switch to Admin chat!" },
  ]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [unread, setUnread]       = useState(0);
  const [admins, setAdmins]       = useState([]);
  const [myUserId, setMyUserId]   = useState(null);
  // which message has its context menu open  { id, x, y }
  const [ctxMenu, setCtxMenu]     = useState(null);
  // which message has its emoji picker open
  const [emojiPicker, setEmojiPicker] = useState(null);
  const [hoveredId, setHoveredId]     = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const textareaRef    = useRef(null);
  const pollRef        = useRef(null);
  const mutatingRef    = useRef(false); // blocks poll during react/delete

  // decode own user ID from JWT
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const p = JSON.parse(atob(token.split('.')[1]));
        setMyUserId(p.id || p.userId || p.sub);
      }
    } catch(e) { console.warn('token decode failed', e); }
  }, []);

  // fetch admins
  useEffect(() => {
    const go = async () => {
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch(`${API_BASE}/chat/employee/admins`, {
          headers:{ Authorization:`Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setAdmins(data.data);
      } catch(e) { console.error(e); }
    };
    go();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, loading]);

  // close context menu on outside click
  useEffect(() => {
    const handler = () => { setCtxMenu(null); setEmojiPicker(null); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const fetchAdminMessages = useCallback(async (skipMutationCheck = false) => {
    if (!skipMutationCheck && mutatingRef.current) return;
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/chat/employee/my-thread`, {
        headers:{ Authorization:`Bearer ${token}` },
      });
      const data  = await res.json();
      if (!data.success) return;
      setMessages(data.data.map(msg => ({
        id:        msg.id,
        role:      String(msg.sender_id) === String(myUserId) ? 'user' : 'assistant',
        content:   msg.message,
        timestamp: msg.created_at,
        deleted:   !!msg.deleted_at,
        reactions: msg.reactions || [],
      })));
    } catch(e) { console.error('fetchAdminMessages', e); }
  }, [myUserId]);

  useEffect(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (!open) return;
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 200);
    if (mode === 'admin') {
      setMessages([]);
      fetchAdminMessages();
      pollRef.current = setInterval(fetchAdminMessages, 5000);
    } else {
      setMessages([
        { role:'assistant', content:"Hi there! 👋 I'm your career assistant. Ask me about jobs, applications, or switch to Admin chat!" },
      ]);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, mode, fetchAdminMessages]);

  // ── Send ────────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const token   = localStorage.getItem('token');
    const userMsg = { role:'user', content:text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);
    try {
      if (mode === 'admin') {
        const res  = await fetch(`${API_BASE}/chat/employee/send`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        await fetchAdminMessages();
      } else {
        const res  = await fetch(`${API_BASE}/employee/chat`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
          body: JSON.stringify({
            messages: [...messages, userMsg].map(m => ({ role:m.role, content:m.content })),
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'AI failed');
        setMessages(prev => [...prev, { role:'assistant', content:data.reply }]);
        if (!open) setUnread(u => u+1);
      }
    } catch(err) {
      console.error(err);
      setMessages(prev => [...prev, { role:'assistant', content:'⚠️ Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteMessage = async (msgId) => {
    setCtxMenu(null);
    const token = localStorage.getItem('token');
    mutatingRef.current = true;
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deleted:true } : m));
    try {
      await fetch(`${API_BASE}/chat/employee/${msgId}`, {
        method:'DELETE',
        headers:{ Authorization:`Bearer ${token}` },
      });
    } catch(e) { console.error('delete failed', e); }
    finally {
      mutatingRef.current = false;
      await fetchAdminMessages(true);
    }
  };

  // ── React ───────────────────────────────────────────────────────────────────
  const reactToMessage = async (msgId, emoji) => {
    setEmojiPicker(null);
    const token = localStorage.getItem('token');
    mutatingRef.current = true;
    try {
      const res  = await fetch(`${API_BASE}/chat/employee/${msgId}/react`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      if (data.success) {
        // immediately apply from server response — no flicker
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, reactions: data.reactions } : m
        ));
      }
    } catch(e) { console.error('react failed', e); }
    finally {
      mutatingRef.current = false;
      await fetchAdminMessages(true); // true = bypass mutationCheck
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // long-press / right-click handler
  const handleMsgPress = (e, msg) => {
    // only in admin mode and only for messages with a DB id
    if (mode !== 'admin' || !msg.id || msg.deleted) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setCtxMenu({ id: msg.id, isOwn: msg.role === 'user', x: rect.left, y: rect.top });
    setEmojiPicker(null);
  };

  const suggestedQuestions = [
    "How do I apply for a job?",
    "Tips for a great resume?",
    "How to prepare for interviews?",
  ];

  return (
    <>
      <style>{`
        @keyframes botDot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes chatSlideUp { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        .chat-msg-user,.chat-msg-bot { animation: chatSlideUp 0.2s ease; }
        .chat-input-field { resize:none;outline:none;border:none;background:transparent;width:100%;font-size:0.875rem;color:#1e293b;font-family:inherit;line-height:1.5; }
        .chat-input-field::placeholder { color:#94a3b8; }
        .chat-send-btn { border:none;cursor:pointer;transition:all 0.18s ease; }
        .chat-send-btn:hover:not(:disabled) { transform:scale(1.08); }
        .chat-send-btn:disabled { opacity:0.45;cursor:not-allowed; }
        .mode-btn { border:none;cursor:pointer;padding:5px 14px;border-radius:20px;font-size:0.75rem;font-family:inherit;font-weight:600;transition:all 0.15s; }
        .mode-btn.active { background:rgba(255,255,255,0.95);color:#6366f1; }
        .mode-btn:not(.active) { background:rgba(255,255,255,0.18);color:rgba(255,255,255,0.85); }
        .mode-btn:not(.active):hover { background:rgba(255,255,255,0.28); }
        .suggested-btn { border:1px solid #e2e8f0;background:#f8fafc;color:#475569;font-size:0.75rem;padding:5px 10px;border-radius:20px;cursor:pointer;transition:all 0.15s;white-space:nowrap;font-family:inherit; }
        .suggested-btn:hover { background:#6366f1;color:#fff;border-color:#6366f1; }
        .chat-scroll::-webkit-scrollbar { width:4px; }
        .chat-scroll::-webkit-scrollbar-track { background:transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background:#e2e8f0;border-radius:99px; }
        .fab-btn { border:none;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s; }
        .fab-btn:hover { transform:scale(1.07); }
        .msg-bubble { position:relative; cursor:default; }
        .msg-actions {
          position:absolute; top:-36px;
          display:flex; gap:2px; z-index:10;
          padding:6px 4px 10px 4px;
        }
        .msg-actions.left  { left:0; }
        .msg-actions.right { right:0; }
        .action-btn { border:none;background:#fff;border-radius:20px;padding:3px 7px;font-size:0.78rem;cursor:pointer;box-shadow:0 1px 6px rgba(0,0,0,0.12);transition:background 0.1s; }
        .action-btn:hover { background:#f1f5f9; }
        .ctx-menu { position:fixed;background:#fff;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,0.15);padding:4px 0;z-index:99999;min-width:140px;animation:fadeIn 0.12s ease; }
        .ctx-item { padding:9px 16px;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:8px;color:#1e293b;transition:background 0.1s; }
        .ctx-item:hover { background:#f8fafc; }
        .ctx-item.danger { color:#ef4444; }
        .emoji-picker { position:absolute;background:#fff;border-radius:30px;box-shadow:0 4px 20px rgba(0,0,0,0.15);padding:6px 10px;display:flex;gap:4px;z-index:99999;animation:fadeIn 0.12s ease; }
        .emoji-btn { background:none;border:none;font-size:1.2rem;cursor:pointer;padding:2px 3px;border-radius:6px;transition:transform 0.1s,background 0.1s; }
        .emoji-btn:hover { transform:scale(1.3);background:#f1f5f9; }
        .reaction-pill { display:inline-flex;align-items:center;gap:2px;background:#f1f5f9;border-radius:20px;padding:1px 7px;font-size:0.75rem;cursor:pointer;border:1px solid transparent;transition:all 0.1s; }
        .reaction-pill:hover { border-color:#6366f1; }
        .reaction-pill.mine { background:#ede9fe;border-color:#a5b4fc; }
        @media (max-width:480px) { .chatbot-window { right:12px !important;left:12px !important;width:auto !important;bottom:80px !important; } }
      `}</style>

      {/* Context menu */}
      {ctxMenu && (
        <div className="ctx-menu" style={{ top: ctxMenu.y - 10, left: ctxMenu.x }}
          onClick={e => e.stopPropagation()}>
          <div className="ctx-item" onClick={() => { setEmojiPicker(ctxMenu.id); setCtxMenu(null); }}>
            😊 React
          </div>
          {ctxMenu.isOwn && (
            <div className="ctx-item danger" onClick={() => deleteMessage(ctxMenu.id)}>
              🗑️ Delete
            </div>
          )}
        </div>
      )}

      {open && (
        <div className="chatbot-window" style={{
          position:'fixed', bottom:'88px', right:'24px', width:'360px', maxHeight:'580px',
          background:'#fff', borderRadius:'20px',
          boxShadow:'0 24px 64px rgba(0,0,0,0.15), 0 4px 12px rgba(99,102,241,0.12)',
          display:'flex', flexDirection:'column', zIndex:9999, overflow:'hidden',
          animation:'chatSlideUp 0.25s ease', border:'1px solid #e2e8f0',
        }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#6366f1 0%,#818cf8 100%)', padding:'14px 18px', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>
                  {mode === 'admin' ? '👨‍💼' : '🤖'}
                </div>
                <div>
                  <div style={{ color:'#fff', fontWeight:'700', fontSize:'0.9rem', lineHeight:1 }}>
                    {mode === 'admin' ? 'Admin Support' : 'Career Assistant'}
                  </div>
                  <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.72rem', marginTop:'2px', display:'flex', alignItems:'center', gap:'4px' }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ade80', display:'inline-block' }}/>
                    {mode === 'admin'
                      ? `${admins.length} admin${admins.length !== 1 ? 's' : ''} available`
                      : 'Online · Powered by AI'}
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background:'rgba(255,255,255,0.15)', border:'none', color:'#fff',
                width:'28px', height:'28px', borderRadius:'50%', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
              >✕</button>
            </div>
            <div style={{ display:'flex', gap:'6px' }}>
              <button className={`mode-btn ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>🤖 AI Assistant</button>
              <button className={`mode-btn ${mode === 'admin' ? 'active' : ''}`} onClick={() => setMode('admin')}>👨‍💼 Admin</button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-scroll" style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'14px', background:'#fafbff' }}>
            {mode === 'admin' && messages.length === 0 && !loading && (
              <div style={{ textAlign:'center', color:'#94a3b8', fontSize:'0.8rem', marginTop:'20px' }}>
                <div style={{ fontSize:'2rem', marginBottom:'8px' }}>👨‍💼</div>
                {admins.length === 0
                  ? 'No admins are currently available.'
                  : `Your message will be sent to ${admins.length} admin${admins.length !== 1 ? 's' : ''}.`}
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser    = msg.role === 'user';
              const grouped   = groupReactions(msg.reactions);
              const hasReacts = Object.keys(grouped).length > 0;

              return (
                <div key={msg.id || i}
                  style={{ display:'flex', flexDirection:'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}
                  onMouseEnter={() => setHoveredId(msg.id || i)}
                  onMouseLeave={() => setHoveredId(null)}>
                  <div style={{ display:'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap:'8px', alignItems:'flex-end', width:'100%', position:'relative' }}>
                    {!isUser && (
                      <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', flexShrink:0 }}>
                        {mode === 'admin' ? '👨‍💼' : '🤖'}
                      </div>
                    )}

                    {/* bubble wrapper */}
                    <div className="msg-bubble"
                      onContextMenu={e => handleMsgPress(e, msg)}
                    >
                      {/* action buttons — shown via state, not CSS hover */}
                      {mode === 'admin' && msg.id && !msg.deleted && hoveredId === msg.id && (
                        <div className={`msg-actions ${isUser ? 'right' : 'left'}`}
                          onClick={e => e.stopPropagation()}>
                          {/* emoji react button */}
                          <div style={{ position:'relative' }}>
                            <button className="action-btn"
                              onClick={e => { e.stopPropagation(); setEmojiPicker(emojiPicker === msg.id ? null : msg.id); setCtxMenu(null); }}
                              title="React">😊</button>
                            {emojiPicker === msg.id && (
                              <div className="emoji-picker"
                                style={{ bottom:'32px', [isUser ? 'right' : 'left']:'0' }}
                                onClick={e => e.stopPropagation()}>
                                {EMOJI_LIST.map(em => (
                                  <button key={em} className="emoji-btn"
                                    onClick={() => reactToMessage(msg.id, em)}>{em}</button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* delete button — own messages only */}
                          {isUser && (
                            <button className="action-btn" style={{ color:'#ef4444' }}
                              onClick={e => { e.stopPropagation(); deleteMessage(msg.id); }}
                              title="Delete">🗑️</button>
                          )}
                        </div>
                      )}

                      {/* the actual bubble */}
                      <div style={{
                        maxWidth:'220px', padding:'10px 13px',
                        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: msg.deleted
                          ? '#f1f5f9'
                          : isUser
                            ? 'linear-gradient(135deg,#6366f1,#818cf8)'
                            : '#ffffff',
                        color: msg.deleted ? '#94a3b8' : isUser ? '#fff' : '#1e293b',
                        fontSize:'0.84rem', lineHeight:'1.55',
                        boxShadow: isUser ? '0 2px 8px rgba(99,102,241,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                        border: (!isUser || msg.deleted) ? '1px solid #f1f5f9' : 'none',
                        fontStyle: msg.deleted ? 'italic' : 'normal',
                        whiteSpace:'pre-wrap', wordBreak:'break-word',
                      }}>
                        {msg.deleted ? '🚫 This message was deleted' : msg.content}
                        <div style={{ fontSize:'0.68rem', opacity:0.55, marginTop:'3px', textAlign: isUser ? 'right' : 'left' }}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([],{ hour:'2-digit', minute:'2-digit' }) : ''}
                        </div>
                      </div>
                    </div>

                    {isUser && (
                      <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', color:'#fff', fontWeight:'700', flexShrink:0 }}>U</div>
                    )}
                  </div>

                  {/* Reaction pills below bubble */}
                  {hasReacts && (
                    <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginTop:'4px', paddingLeft: isUser ? '0' : '34px', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                      {Object.entries(grouped).map(([emoji, users]) => {
                        const iMine = users.includes(String(myUserId));
                        return (
                          <button key={emoji}
                            className={`reaction-pill ${iMine ? 'mine' : ''}`}
                            onClick={() => msg.id && reactToMessage(msg.id, emoji)}
                            title={iMine ? 'Click to remove' : 'Click to react'}>
                            {emoji} <span style={{ fontSize:'0.72rem', color:'#64748b' }}>{users.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
                <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', flexShrink:0 }}>
                  {mode === 'admin' ? '👨‍💼' : '🤖'}
                </div>
                <div style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:'16px 16px 16px 4px', padding:'10px 14px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <TypingDots/>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {mode === 'ai' && messages.length === 1 && (
            <div style={{ padding:'8px 16px', display:'flex', gap:'6px', flexWrap:'wrap', background:'#fafbff', borderTop:'1px solid #f1f5f9', flexShrink:0 }}>
              {suggestedQuestions.map((q,i) => (
                <button key={i} className="suggested-btn" onClick={() => { setInput(q); inputRef.current?.focus(); }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'12px 14px', borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'flex-end', gap:'8px', background:'#fff', flexShrink:0 }}>
            <div style={{ flex:1, border:'1.5px solid #e2e8f0', borderRadius:'12px', padding:'9px 12px', background:'#f8fafc', transition:'border-color 0.15s' }}
              onFocusCapture={e => e.currentTarget.style.borderColor='#6366f1'}
              onBlurCapture={e => e.currentTarget.style.borderColor='#e2e8f0'}
            >
              <textarea
                ref={el => { inputRef.current = el; textareaRef.current = el; }}
                className="chat-input-field"
                rows={1}
                placeholder={mode === 'admin' ? 'Message admin...' : 'Ask me anything...'}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
                onKeyDown={handleKey}
                style={{ maxHeight:'100px', overflowY:'auto' }}
              />
            </div>
            <button className="chat-send-btn" onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width:'40px', height:'40px', borderRadius:'12px',
                background: input.trim() && !loading ? 'linear-gradient(135deg,#6366f1,#818cf8)' : '#e2e8f0',
                color: input.trim() && !loading ? '#fff' : '#94a3b8',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="fab-btn" onClick={() => setOpen(o => !o)} style={{
        position:'fixed', bottom:'24px', right:'24px', width:'56px', height:'56px', borderRadius:'50%',
        background: open ? '#475569' : 'linear-gradient(135deg,#6366f1,#818cf8)',
        color:'#fff', border:'none', display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:10000, boxShadow:'0 8px 24px rgba(99,102,241,0.35)',
      }}>
        {!open && <span style={{ position:'absolute', width:'100%', height:'100%', borderRadius:'50%', border:'2px solid #6366f1', animation:'pulse-ring 2s ease-out infinite' }}/>}
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {unread > 0 && !open && (
          <span style={{ position:'absolute', top:'-2px', right:'-2px', width:'18px', height:'18px', borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:'0.65rem', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' }}>{unread}</span>
        )}
      </button>
    </>
  );
};

export default ChatBot;