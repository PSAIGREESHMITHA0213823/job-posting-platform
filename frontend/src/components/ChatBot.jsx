
import React, { useState, useRef, useEffect, useCallback } from 'react';
import WebRTCCall from './WebRTCCall';

const API_BASE = 'http://localhost:5000/api';
const EMOJI_LIST = ['👍','❤️','😂','😮','😢','🙏','🎉','🔥'];

const THEMES = [
  { id:'indigo', label:'Indigo', grad:'linear-gradient(135deg,#6366f1,#818cf8)', bubble:'linear-gradient(135deg,#6366f1,#818cf8)', bg:'#fafbff' },
  { id:'violet', label:'Violet', grad:'linear-gradient(135deg,#7c3aed,#a78bfa)', bubble:'linear-gradient(135deg,#7c3aed,#a78bfa)', bg:'#f5f3ff' },
  { id:'ocean', label:'Ocean', grad:'linear-gradient(135deg,#0284c7,#38bdf8)', bubble:'linear-gradient(135deg,#0284c7,#38bdf8)', bg:'#f0f9ff' },
  { id:'forest', label:'Forest', grad:'linear-gradient(135deg,#16a34a,#4ade80)', bubble:'linear-gradient(135deg,#16a34a,#4ade80)', bg:'#f0fdf4' },
  { id:'rose', label:'Rose', grad:'linear-gradient(135deg,#e11d48,#fb7185)', bubble:'linear-gradient(135deg,#e11d48,#fb7185)', bg:'#fff1f2' },
  { id:'sunset', label:'Sunset', grad:'linear-gradient(135deg,#ea580c,#fb923c)', bubble:'linear-gradient(135deg,#ea580c,#fb923c)', bg:'#fff7ed' },
  { id:'midnight', label:'Night', grad:'linear-gradient(135deg,#1e1b4b,#4338ca)', bubble:'linear-gradient(135deg,#4338ca,#6366f1)', bg:'#eef2ff' },
  { id:'teal', label:'Teal', grad:'linear-gradient(135deg,#0d9488,#2dd4bf)', bubble:'linear-gradient(135deg,#0d9488,#2dd4bf)', bg:'#f0fdfa' },
];

const groupReactions = (reactions = []) => {
  const map = {};
  for (const r of reactions) { map[r.emoji] = map[r.emoji] || []; map[r.emoji].push(String(r.user_id)); }
  return map;
};

const isImage = (name = '') => /\.(jpe?g|png|gif|webp|svg)$/i.test(name);
const fmtSize = (b) => {
  if (!b) return '';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1)+' KB';
  return (b/1048576).toFixed(1)+' MB';
};

const TypingDots = () => (
  <div style={{ display:'flex', gap:'4px', alignItems:'center', padding:'4px 0' }}>
    {[0,1,2].map(i => (
      <span key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#6366f1', animation:'botDot 1.2s infinite', animationDelay:`${i*0.2}s`, display:'inline-block' }}/>
    ))}
  </div>
);

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('ai');
  const [messages, setMessages] = useState([
    { role:'assistant', content:"Hi there! 👋 I'm your career assistant. Ask me about jobs, applications, or switch to Admin chat!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [myUserId, setMyUserId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [emojiFor, setEmojiFor] = useState(null);
  const [emojiPos, setEmojiPos] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [delModal, setDelModal] = useState(null);
  const [themeId, setThemeId] = useState(() => localStorage.getItem('cb_theme') || 'indigo');
  const [showTheme, setShowTheme] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeRTCCall, setActiveRTCCall] = useState(null);

  const inEmojiPanel = useRef(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const pollRef = useRef(null);
  const callPollRef = useRef(null);
  const mutatingRef = useRef(false);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const hoverTimers = useRef({});
  const themeRef = useRef(null);
  const seenCallIds = useRef(new Set());

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  const tkn = () => localStorage.getItem('token');
  const auth = () => ({ Authorization: `Bearer ${tkn()}` });

  useEffect(() => {
    try {
      const p = JSON.parse(atob(tkn().split('.')[1]));
      setMyUserId(String(p.id || p.userId || p.sub || ''));
    } catch {}
  }, []);

  useEffect(() => {
    const loadPhoto = async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/employee/profile`, { headers: auth() });
        const data = await res.json();
        if (data.success && data.photo_url) {
          setProfilePhoto(`http://localhost:5000${data.photo_url}`);
        }
      } catch {}
    };
    loadPhoto();
  }, []);

  useEffect(() => { localStorage.setItem('cb_theme', themeId); }, [themeId]);

  useEffect(() => {
    const go = async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/employee/admins`, { headers: auth() });
        const data = await res.json();
        if (data.success) setAdmins(data.data);
      } catch {}
    };
    go();
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);

  useEffect(() => {
    const h = e => {
      if (!e.target.closest('.cb-emoji-panel')) { inEmojiPanel.current = false; setEmojiFor(null); }
      if (themeRef.current && !themeRef.current.contains(e.target)) setShowTheme(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  useEffect(() => {
    const pollIncoming = async () => {
      if (activeRTCCall) return;
      try {
        const res = await fetch(`${API_BASE}/chat/employee/calls/pending`, { headers: auth() });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.call) {
          const callId = data.call.callId;
          if (!seenCallIds.current.has(callId)) {
            seenCallIds.current.add(callId);
            setActiveRTCCall({
              callId,
              type: data.call.type,
              mode: 'callee',
              peerEmail: data.call.email || 'Admin',
            });
          }
        }
      } catch {}
    };
    callPollRef.current = setInterval(pollIncoming, 3000);
    return () => clearInterval(callPollRef.current);
  }, [activeRTCCall]);

  const fetchAdminMessages = useCallback(async (skipCheck = false) => {
    if (!skipCheck && mutatingRef.current) return;
    try {
      const res = await fetch(`${API_BASE}/chat/employee/my-thread`, { headers: auth() });
      const data = await res.json();
      if (!data.success) return;
      setMessages(data.data.map(msg => ({
        id: msg.id,
        role: String(msg.sender_id) === String(myUserId) ? 'user' : 'assistant',
        content: msg.message || '',
        timestamp: msg.created_at,
        deleted: !!msg.deleted_at,
        deleted_for: msg.deleted_for,
        sender_id: String(msg.sender_id),
        reactions: msg.reactions || [],
        attachments: msg.attachments || [],
        edited: !!msg.edited_at,
      })));
    } catch {}
  }, [myUserId]);

  useEffect(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (!open) return;
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 200);
    if (mode === 'admin') {
      setMessages([]);
      fetchAdminMessages(true);
      pollRef.current = setInterval(() => fetchAdminMessages(), 5000);
    } else {
      setMessages([{ role:'assistant', content:"Hi there! 👋 I'm your career assistant. Ask me about jobs, applications, or switch to Admin chat!" }]);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, mode, fetchAdminMessages]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch(`${API_BASE}/chat/employee/profile/photo`, {
        method: 'POST', headers: auth(), body: fd,
      });
      const data = await res.json();
      if (data.success && data.photo_url) {
        setProfilePhoto(`http://localhost:5000${data.photo_url}`);
      }
    } catch {}
    finally { setUploadingPhoto(false); e.target.value = ''; }
  };

  const initiateCall = async (type) => {
    try {
      const res = await fetch(`${API_BASE}/chat/employee/calls/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success && data.callId) {
        seenCallIds.current.add(data.callId);
        setActiveRTCCall({ callId: data.callId, type, mode: 'caller', peerEmail: 'Admin' });
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠️ ${data.message || 'No admin available.'}`,
        }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network error.' }]);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    if (loading) return;

    if (editingId) {
      const msgId = editingId;
      setEditingId(null); setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      mutatingRef.current = true;
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: text, edited: true } : m));
      try {
        await fetch(`${API_BASE}/chat/employee/${msgId}`, {
          method: 'PUT',
          headers: { 'Content-Type':'application/json', ...auth() },
          body: JSON.stringify({ message: text }),
        });
      } catch {}
      finally { mutatingRef.current = false; await fetchAdminMessages(true); }
      return;
    }

    const userMsg = {
      role:'user', content: text || '📎',
      attachments: attachments.map(a => ({ name:a.name, size:a.size, previewUrl:a.previewUrl })),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    const toUpload = [...attachments];
    setAttachments([]);
    setLoading(true);

    try {
      if (mode === 'admin') {
        const fd = new FormData();
        if (text) fd.append('message', text);
        toUpload.forEach(a => fd.append('files', a.file));
        const res = await fetch(`${API_BASE}/chat/employee/send`, { method:'POST', headers: auth(), body: fd });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        await fetchAdminMessages(true);
      } else {
        const res = await fetch(`${API_BASE}/employee/chat`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json', ...auth() },
          body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role:m.role, content:m.content })) }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'AI failed');
        setMessages(prev => [...prev, { role:'assistant', content: data.reply }]);
        if (!open) setUnread(u => u + 1);
      }
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'⚠️ Something went wrong. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const deleteForMe = async (msgId) => {
    setDelModal(null); mutatingRef.current = true;
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deleted:true, deleted_for:'me' } : m));
    try { await fetch(`${API_BASE}/chat/employee/${msgId}/delete-for-me`, { method:'POST', headers: auth() }); } catch {}
    finally { mutatingRef.current = false; await fetchAdminMessages(true); }
  };

  const deleteForAll = async (msgId) => {
    setDelModal(null); mutatingRef.current = true;
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deleted:true, deleted_for:'all' } : m));
    try { await fetch(`${API_BASE}/chat/employee/${msgId}`, { method:'DELETE', headers: auth() }); } catch {}
    finally { mutatingRef.current = false; await fetchAdminMessages(true); }
  };

  const reactToMessage = async (msgId, emoji) => {
    inEmojiPanel.current = false; setEmojiFor(null); mutatingRef.current = true;
    try {
      const res = await fetch(`${API_BASE}/chat/employee/${msgId}/react`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', ...auth() },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      if (data.success) setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: data.reactions } : m));
    } catch {}
    finally { mutatingRef.current = false; await fetchAdminMessages(true); }
  };

  const startEdit = (msg) => { setEditingId(msg.id); setInput(msg.content); setTimeout(() => inputRef.current?.focus(), 50); };
  const cancelEdit = () => { setEditingId(null); setInput(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape' && editingId) cancelEdit();
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files.map(f => ({
      file:f, name:f.name, size:f.size,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }))]);
    e.target.value = '';
  };

  const openEmojiFor = (e, msgKey, isUser) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setEmojiPos({ top: rect.top - 52, left: isUser ? Math.max(8, rect.right - 260) : rect.left });
    setEmojiFor(prev => prev === msgKey ? null : msgKey);
  };

  const msgEnter = id => { clearTimeout(hoverTimers.current[id]); setHoveredId(id); };
  const msgLeave = id => {
    hoverTimers.current[id] = setTimeout(() => {
      if (!inEmojiPanel.current) setHoveredId(p => p === id ? null : p);
    }, 280);
  };

  const getMessageContent = (msg) => {
    if (!msg.deleted) return msg.content;
    if (msg.deleted_for === 'all') return '🚫 This message was deleted';
    if (msg.deleted_for === 'me') {
      if (msg.sender_id === myUserId) return '🚫 You deleted this message';
      return msg.content;
    }
    return '🚫 This message was deleted';
  };

  const isVisiblyDeleted = (msg) => {
    if (!msg.deleted) return false;
    if (msg.deleted_for === 'all') return true;
    if (msg.deleted_for === 'me' && msg.sender_id === myUserId) return true;
    return false;
  };

  const suggestedQuestions = ["How do I apply for a job?", "Tips for a great resume?", "How to prepare for interviews?"];

  const UserAvatar = ({ size = 26 }) => (
    profilePhoto
      ? <img src={profilePhoto} alt="me" style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
      : <div style={{ width:size, height:size, borderRadius:'50%', background:theme.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.32, color:'#fff', fontWeight:'700', flexShrink:0 }}>U</div>
  );

  return (
    <>
      <style>{`
@keyframes botDot{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
@keyframes chatSlideUp{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.5);opacity:0}}
@keyframes cbFadeIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
.cb-input{resize:none;outline:none;border:none;background:transparent;width:100%;font-size:.875rem;color:#1e293b;font-family:inherit;line-height:1.5}
.cb-input::placeholder{color:#94a3b8}
.cb-send{border:none;cursor:pointer;transition:all .18s}
.cb-send:hover:not(:disabled){transform:scale(1.08)}
.cb-send:disabled{opacity:.45;cursor:not-allowed}
.cb-mode{border:none;cursor:pointer;padding:5px 14px;border-radius:20px;font-size:.75rem;font-family:inherit;font-weight:600;transition:all .15s}
.cb-mode.active{background:rgba(255,255,255,.95);color:#6366f1}
.cb-mode:not(.active){background:rgba(255,255,255,.18);color:rgba(255,255,255,.85)}
.cb-mode:not(.active):hover{background:rgba(255,255,255,.28)}
.cb-sug{border:1px solid #e2e8f0;background:#f8fafc;color:#475569;font-size:.75rem;padding:5px 10px;border-radius:20px;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:inherit}
.cb-sug:hover{color:#fff;border-color:#6366f1}
.cb-scroll::-webkit-scrollbar{width:4px}
.cb-scroll::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
.cb-fab{border:none;cursor:pointer;transition:transform .2s,box-shadow .2s}
.cb-fab:hover{transform:scale(1.07)}
.cb-action-bar{position:absolute;top:-42px;display:flex;gap:2px;z-index:9999;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:4px;box-shadow:0 4px 16px rgba(0,0,0,.1);animation:cbFadeIn .12s ease}
.cb-action-bar.right{right:0}
.cb-action-bar.left{left:0}
.cb-act{display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:7px;border:none;background:none;cursor:pointer;font-size:11.5px;color:#4a5068;font-family:inherit;transition:background .12s;white-space:nowrap}
.cb-act:hover{background:#f5f7fa;color:#0d0f1a}
.cb-act.danger{color:#dc2626}
.cb-act.danger:hover{background:#fef2f2}
.cb-act-sep{width:1px;height:16px;background:#e2e8f0;flex-shrink:0}
.cb-emoji-panel{position:fixed;z-index:99999;background:#fff;border:1px solid #e2e8f0;border-radius:30px;padding:6px 10px;display:flex;gap:4px;box-shadow:0 4px 20px rgba(0,0,0,.15);animation:cbFadeIn .12s ease}
.cb-emoji-btn{background:none;border:none;font-size:1.15rem;cursor:pointer;padding:2px 3px;border-radius:6px;transition:transform .1s;line-height:1}
.cb-emoji-btn:hover{transform:scale(1.3)}
.cb-rpill{display:inline-flex;align-items:center;gap:2px;background:#f1f5f9;border-radius:20px;padding:2px 7px;font-size:.75rem;cursor:pointer;border:1px solid transparent;transition:all .1s}
.cb-rpill:hover{border-color:#6366f1}
.cb-rpill.mine{background:#ede9fe;border-color:#a5b4fc}
.cb-lightbox{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:999999;display:flex;align-items:center;justify-content:center;cursor:zoom-out}
.cb-lightbox img{max-width:90vw;max-height:90vh;border-radius:10px}
.cb-overlay{position:fixed;inset:0;background:rgba(10,10,15,.5);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px}
.cb-del-modal{background:#14141c;border:1px solid #2a2a38;border-radius:18px;padding:24px;width:100%;max-width:340px;animation:cbFadeIn .2s ease;box-shadow:0 24px 64px rgba(0,0,0,.5)}
.cb-del-title{font-size:16px;font-weight:700;color:#f0f0f8;margin-bottom:8px}
.cb-del-sub{font-size:12.5px;color:#8888a8;margin-bottom:20px;line-height:1.6}
.cb-del-btns{display:flex;flex-direction:column;gap:7px}
.cb-del-btn{padding:10px 16px;border-radius:10px;border:none;cursor:pointer;font-size:12.5px;font-weight:500;font-family:inherit;text-align:left;display:flex;align-items:center;gap:8px;transition:opacity .15s}
.cb-del-btn:hover{opacity:.88}
.cb-del-btn.all{background:#ef4444;color:#fff}
.cb-del-btn.me{background:#1e1e28;color:#e8e8f0;border:1px solid #2a2a38}
.cb-del-btn.cncl{background:transparent;color:#55556a;border:1px solid #2a2a38}
.cb-chip{display:flex;align-items:center;gap:6px;padding:4px 8px 4px 10px;background:#f0f2f7;border:1px solid #e4e7ef;border-radius:8px;font-size:11px;color:#4a5068;max-width:160px}
.cb-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.cb-chip-rm{background:none;border:none;cursor:pointer;color:#9198b2;padding:0;font-size:13px;line-height:1}
.cb-chip-rm:hover{color:#ef4444}
.cb-edit-banner{padding:5px 14px;background:#fffbeb;border-top:1px solid #fde68a;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#92400e}
.cb-edit-cancel{background:none;border:none;cursor:pointer;color:#92400e;font-size:12px;font-family:inherit}
.cb-file-attach{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;margin-bottom:4px;text-decoration:none}
.cb-file-attach.u{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.2)}
.cb-file-attach.t{background:#f5f7fa;border:1px solid #e2e8f0}
.cb-img-thumb{max-width:180px;max-height:140px;border-radius:8px;cursor:pointer;display:block;object-fit:cover}
.cb-hdr-btn{background:rgba(255,255,255,.15);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0}
.cb-hdr-btn:hover{background:rgba(255,255,255,.28)}
.cb-theme-panel{position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:14px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,.12);animation:cbFadeIn .14s ease;min-width:230px}
.cb-theme-title{font-size:11px;font-weight:600;color:#94a3b8;letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px}
.cb-theme-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.cb-theme-swatch{width:100%;aspect-ratio:1;border-radius:10px;cursor:pointer;border:2.5px solid transparent;position:relative;transition:transform .15s}
.cb-theme-swatch:hover{transform:scale(1.08)}
.cb-theme-swatch.active{border-color:#6366f1}
.cb-theme-swatch.active::after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.4)}
.cb-theme-lbl{font-size:10px;color:#94a3b8;text-align:center;margin-top:3px}
.cb-photo-ring{width:40px;height:40px;border-radius:50%;position:relative;cursor:pointer;flex-shrink:0}
.cb-photo-ring:hover .cb-photo-overlay{opacity:1}
.cb-photo-overlay{position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;font-size:16px}
@media (max-width:480px){.cb-win{right:12px !important;left:12px !important;width:auto !important;bottom:80px !important}}
      `}</style>

      {lightbox && <div className="cb-lightbox" onClick={() => setLightbox(null)}><img src={lightbox} alt="preview"/></div>}

      {activeRTCCall && (
        <WebRTCCall
          mode={activeRTCCall.mode}
          callId={activeRTCCall.callId}
          callType={activeRTCCall.type}
          token={localStorage.getItem('token')}
          apiBase="http://localhost:5000/api"
          myRole="employee"
          peerEmail={activeRTCCall.peerEmail}
          onEnd={() => setActiveRTCCall(null)}
        />
      )}

      {delModal && (
        <div className="cb-overlay" onClick={() => setDelModal(null)}>
          <div className="cb-del-modal" onClick={e => e.stopPropagation()}>
            <div className="cb-del-title">Delete this message?</div>
            <div className="cb-del-sub">Choose how to delete it. Deleting for everyone cannot be undone.</div>
            <div className="cb-del-btns">
              <button className="cb-del-btn all" onClick={() => deleteForAll(delModal.msgId)}>🌐 Delete for everyone</button>
              <button className="cb-del-btn me" onClick={() => deleteForMe(delModal.msgId)}>👤 Delete for me only</button>
              <button className="cb-del-btn cncl" onClick={() => setDelModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {emojiFor && (
        <div className="cb-emoji-panel" style={{ top: emojiPos.top, left: emojiPos.left }}
          onMouseEnter={() => { inEmojiPanel.current = true; clearTimeout(hoverTimers.current[emojiFor]); }}
          onMouseLeave={() => { inEmojiPanel.current = false; }}>
          {EMOJI_LIST.map(em => (
            <button key={em} className="cb-emoji-btn" onClick={() => reactToMessage(emojiFor, em)}>{em}</button>
          ))}
        </div>
      )}

      <input ref={photoInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoChange} />
      <input ref={fileInputRef} type="file" multiple style={{ display:'none' }} onChange={handleFileChange} />

      {open && (
        <div className="cb-win" style={{ position:'fixed', bottom:'88px', right:'24px', width:'370px', maxHeight:'600px', background:'#fff', borderRadius:'20px', boxShadow:'0 24px 64px rgba(0,0,0,.15)', display:'flex', flexDirection:'column', zIndex:9999, overflow:'visible', animation:'chatSlideUp .25s ease', border:'1px solid #e2e8f0' }}>

          <div style={{ background: theme.grad, padding:'14px 18px', flexShrink:0, borderRadius:'20px 20px 0 0' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div className="cb-photo-ring" onClick={() => photoInputRef.current?.click()} title="Change profile photo">
                  {profilePhoto
                    ? <img src={profilePhoto} alt="me" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover' }} />
                    : <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>
                        {mode === 'admin' ? '👨‍💼' : '🤖'}
                      </div>
                  }
                  <div className="cb-photo-overlay">{uploadingPhoto ? '⏳' : '📷'}</div>
                </div>
                <div>
                  <div style={{ color:'#fff', fontWeight:'700', fontSize:'.9rem', lineHeight:1 }}>
                    {mode === 'admin' ? 'Admin Support' : 'Career Assistant'}
                  </div>
                  <div style={{ color:'rgba(255,255,255,.75)', fontSize:'.72rem', marginTop:'2px', display:'flex', alignItems:'center', gap:'4px' }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ade80', display:'inline-block' }}/>
                    {mode === 'admin' ? `${admins.length} admin${admins.length !== 1 ? 's' : ''} available` : 'Online · Powered by AI'}
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                {mode === 'admin' && (
                  <>
                    <button className="cb-hdr-btn" title="Voice call" onClick={() => initiateCall('voice')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 011 1.24 2 2 0 013 .06h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                      </svg>
                    </button>
                    <button className="cb-hdr-btn" title="Video call" onClick={() => initiateCall('video')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    </button>
                  </>
                )}

                <div style={{ position:'relative' }} ref={themeRef}>
                  <button className="cb-hdr-btn" title="Change theme" onClick={e => { e.stopPropagation(); setShowTheme(p => !p); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                    </svg>
                  </button>
                  {showTheme && (
                    <div className="cb-theme-panel" onClick={e => e.stopPropagation()}>
                      <div className="cb-theme-title">Chat Theme</div>
                      <div className="cb-theme-grid">
                        {THEMES.map(t => (
                          <div key={t.id}>
                            <div className={`cb-theme-swatch ${themeId === t.id ? 'active' : ''}`}
                              style={{ background: t.grad }}
                              onClick={() => { setThemeId(t.id); setShowTheme(false); }}/>
                            <div className="cb-theme-lbl">{t.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => setOpen(false)} style={{ background:'rgba(255,255,255,.15)', border:'none', color:'#fff', width:'28px', height:'28px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>✕</button>
              </div>
            </div>

            <div style={{ display:'flex', gap:'6px' }}>
              <button className={`cb-mode ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>🤖 AI Assistant</button>
              <button className={`cb-mode ${mode === 'admin' ? 'active' : ''}`} onClick={() => setMode('admin')}>👨‍💼 Admin</button>
            </div>
          </div>

          <div className="cb-scroll" style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px', background: theme.bg, minHeight:0 }}>
            {mode === 'admin' && messages.length === 0 && !loading && (
              <div style={{ textAlign:'center', color:'#94a3b8', fontSize:'.8rem', marginTop:'20px' }}>
                <div style={{ fontSize:'2rem', marginBottom:'8px' }}>👨‍💼</div>
                {admins.length === 0 ? 'No admins are currently available.' : `Your message will be sent to ${admins.length} admin${admins.length !== 1 ? 's' : ''}.`}
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              const grouped = groupReactions(msg.reactions);
              const hasReact = Object.keys(grouped).length > 0;
              const msgKey = msg.id || i;
              const showActs = mode === 'admin' && msg.id && !isVisiblyDeleted(msg) && hoveredId === msgKey;
              const files = msg.attachments || [];
              const visDeleted = isVisiblyDeleted(msg);
              const content = getMessageContent(msg);

              return (
                <div key={msgKey}
                  style={{ display:'flex', flexDirection:'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}
                  onMouseEnter={() => msgEnter(msgKey)}
                  onMouseLeave={() => msgLeave(msgKey)}>
                  <div style={{ display:'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap:'8px', alignItems:'flex-end', width:'100%', position:'relative' }}>
                    {!isUser && (
                      <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem', flexShrink:0 }}>
                        {mode === 'admin' ? '👨‍💼' : '🤖'}
                      </div>
                    )}

                    <div style={{ position:'relative', maxWidth:'230px' }}
                      onMouseEnter={() => clearTimeout(hoverTimers.current[msgKey])}>

                      {showActs && (
                        <div className={`cb-action-bar ${isUser ? 'right' : 'left'}`}
                          onMouseEnter={() => clearTimeout(hoverTimers.current[msgKey])}
                          onMouseLeave={() => msgLeave(msgKey)}>
                          <button className="cb-act" onClick={e => openEmojiFor(e, msgKey, isUser)}>😊</button>
                          {isUser && (
                            <><div className="cb-act-sep"/>
                            <button className="cb-act" onClick={() => startEdit(msg)}>✏️ Edit</button></>
                          )}
                          <div className="cb-act-sep"/>
                          <button className="cb-act danger" onClick={() => setDelModal({ msgId: msg.id })}>🗑️</button>
                        </div>
                      )}

                      <div style={{
                        padding:'10px 13px',
                        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: visDeleted ? '#f1f5f9' : isUser ? theme.bubble : '#fff',
                        color: visDeleted ? '#94a3b8' : isUser ? '#fff' : '#1e293b',
                        fontSize:'.84rem', lineHeight:'1.55',
                        boxShadow: isUser ? '0 2px 8px rgba(99,102,241,.2)' : '0 1px 4px rgba(0,0,0,.06)',
                        border: (!isUser || visDeleted) ? '1px solid #f1f5f9' : 'none',
                        fontStyle: visDeleted ? 'italic' : 'normal',
                        whiteSpace:'pre-wrap', wordBreak:'break-word',
                      }}>
                        {!visDeleted && files.map((f, fi) =>
                          isImage(f.name || '') ? (
                            <img key={fi} className="cb-img-thumb"
                              src={f.previewUrl || `http://localhost:5000${f.url}`}
                              alt={f.name}
                              onClick={() => setLightbox(f.previewUrl || `http://localhost:5000${f.url}`)}
                              style={{ marginBottom:4 }}/>
                          ) : (
                            <a key={fi} className={`cb-file-attach ${isUser ? 'u' : 't'}`}
                              href={`http://localhost:5000${f.url}`} download={f.name} target="_blank" rel="noreferrer">
                              <span style={{ fontSize:'1.1rem' }}>📎</span>
                              <div>
                                <div style={{ fontSize:'11px', fontWeight:500, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                                <div style={{ fontSize:'10px', opacity:.6 }}>{fmtSize(f.size)}</div>
                              </div>
                            </a>
                          )
                        )}
                        {content}
                        <div style={{ fontSize:'.68rem', opacity:.55, marginTop:'3px', display:'flex', alignItems:'center', gap:4, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([],{ hour:'2-digit', minute:'2-digit' }) : ''}
                          {msg.edited && !visDeleted && <span style={{ fontStyle:'italic' }}>· edited</span>}
                        </div>
                      </div>
                    </div>

                    {isUser && <UserAvatar size={26} />}
                  </div>

                  {hasReact && !visDeleted && (
                    <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginTop:'4px', paddingLeft: isUser ? '0' : '34px', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                      {Object.entries(grouped).map(([emoji, uids]) => (
                        <button key={emoji} className={`cb-rpill ${uids.includes(String(myUserId)) ? 'mine' : ''}`}
                          onClick={() => msg.id && reactToMessage(msg.id, emoji)}>
                          {emoji} <span style={{ fontSize:'.72rem', color:'#64748b' }}>{uids.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
                <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem', flexShrink:0 }}>
                  {mode === 'admin' ? '👨‍💼' : '🤖'}
                </div>
                <div style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:'16px 16px 16px 4px', padding:'10px 14px', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
                  <TypingDots/>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {mode === 'ai' && messages.length === 1 && (
            <div style={{ padding:'8px 16px', display:'flex', gap:'6px', flexWrap:'wrap', background:'#fafbff', borderTop:'1px solid #f1f5f9', flexShrink:0 }}>
              {suggestedQuestions.map((q, i) => (
                <button key={i} className="cb-sug" style={{ background: theme.bg }} onClick={() => { setInput(q); inputRef.current?.focus(); }}>{q}</button>
              ))}
            </div>
          )}

          {attachments.length > 0 && (
            <div style={{ padding:'8px 14px 0', display:'flex', gap:'6px', flexWrap:'wrap', background:'#fff', borderTop:'1px solid #f1f5f9', flexShrink:0 }}>
              {attachments.map((a, i) => (
                <div key={i} className="cb-chip">
                  {a.previewUrl ? <img src={a.previewUrl} alt="" style={{ width:18, height:18, borderRadius:3, objectFit:'cover', flexShrink:0 }}/> : <span style={{ fontSize:14 }}>📎</span>}
                  <span>{a.name}</span>
                  <button className="cb-chip-rm" onClick={() => setAttachments(prev => prev.filter((_,idx) => idx !== i))}>×</button>
                </div>
              ))}
            </div>
          )}

          {editingId && (
            <div className="cb-edit-banner">
              <span>✏️ Editing message</span>
              <button className="cb-edit-cancel" onClick={cancelEdit}>✕ Cancel (Esc)</button>
            </div>
          )}

          <div style={{ padding:'12px 14px', borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'flex-end', gap:'8px', background:'#fff', flexShrink:0, borderRadius:'0 0 20px 20px' }}>
            {mode === 'admin' && (
              <button onClick={() => fileInputRef.current?.click()} title="Attach file"
                style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:'4px', display:'flex', alignItems:'center', flexShrink:0, transition:'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color='#6366f1'}
                onMouseLeave={e => e.currentTarget.style.color='#94a3b8'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
            )}

            <div style={{ flex:1, border:`1.5px solid ${editingId ? '#f59e0b' : '#e2e8f0'}`, borderRadius:'12px', padding:'9px 12px', background: editingId ? '#fffbeb' : '#f8fafc', transition:'border-color .15s' }}
              onFocusCapture={e => e.currentTarget.style.borderColor = editingId ? '#f59e0b' : '#6366f1'}
              onBlurCapture={e => e.currentTarget.style.borderColor = editingId ? '#f59e0b' : '#e2e8f0'}>
              <textarea ref={el => { inputRef.current = el; textareaRef.current = el; }}
                className="cb-input" rows={1}
                placeholder={editingId ? 'Edit your message…' : mode === 'admin' ? 'Message admin...' : 'Ask me anything...'}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,100)+'px'; }}
                onKeyDown={handleKey}
                style={{ maxHeight:'100px', overflowY:'auto' }}/>
            </div>

            <button className="cb-send" onClick={sendMessage}
              disabled={(!input.trim() && attachments.length === 0) || loading}
              style={{ width:'40px', height:'40px', borderRadius:'12px', background: (input.trim() || attachments.length > 0) && !loading ? theme.grad : '#e2e8f0', color: (input.trim() || attachments.length > 0) && !loading ? '#fff' : '#94a3b8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'none', cursor:'pointer' }}>
              {editingId
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              }
            </button>
          </div>
        </div>
      )}

      <button className="cb-fab" onClick={() => setOpen(o => !o)} style={{ position:'fixed', bottom:'24px', right:'24px', width:'56px', height:'56px', borderRadius:'50%', background: open ? '#475569' : theme.grad, color:'#fff', border:'none', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000, boxShadow:'0 8px 24px rgba(99,102,241,.35)' }}>
        {!open && <span style={{ position:'absolute', width:'100%', height:'100%', borderRadius:'50%', border:'2px solid #6366f1', animation:'pulse-ring 2s ease-out infinite' }}/>}
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {unread > 0 && !open && (
          <span style={{ position:'absolute', top:'-2px', right:'-2px', width:'18px', height:'18px', borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:'.65rem', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' }}>{unread}</span>
        )}
      </button>
    </>
  );
};

export default ChatBot;