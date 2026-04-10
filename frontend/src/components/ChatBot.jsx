import React, { useState, useRef, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const TypingDots = () => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: '#6366f1',
        animation: 'botDot 1.2s infinite',
        animationDelay: `${i * 0.2}s`,
        display: 'inline-block',
      }} />
    ))}
  </div>
);

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there! 👋 I'm your career assistant. Ask me about jobs, your applications, interview tips, or anything career-related!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setLoading(true);

    try {
      // Get token — adjust key name if yours is different
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE}/employee/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Failed');

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (!open) setUnread(u => u + 1);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ Something went wrong. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "How do I apply for a job?",
    "Tips for a great resume?",
    "How to prepare for interviews?",
  ];

  return (
    <>
      <style>{`
        @keyframes botDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .chat-msg-user { animation: chatSlideUp 0.2s ease; }
        .chat-msg-bot  { animation: chatSlideUp 0.25s ease; }
        .chat-input-field {
          resize: none; outline: none; border: none;
          background: transparent; width: 100%;
          font-size: 0.875rem; color: #1e293b;
          font-family: inherit; line-height: 1.5;
        }
        .chat-input-field::placeholder { color: #94a3b8; }
        .chat-send-btn { border: none; cursor: pointer; transition: all 0.18s ease; }
        .chat-send-btn:hover:not(:disabled) { transform: scale(1.08); }
        .chat-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .suggested-btn {
          border: 1px solid #e2e8f0; background: #f8fafc; color: #475569;
          font-size: 0.75rem; padding: 5px 10px; border-radius: 20px;
          cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: inherit;
        }
        .suggested-btn:hover { background: #6366f1; color: #fff; border-color: #6366f1; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .fab-btn { border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .fab-btn:hover { transform: scale(1.07); box-shadow: 0 12px 32px rgba(99,102,241,0.45) !important; }
        @media (max-width: 480px) {
          .chatbot-window { right: 12px !important; left: 12px !important; width: auto !important; bottom: 80px !important; }
        }
      `}</style>

      {open && (
        <div className="chatbot-window" style={{
          position: 'fixed', bottom: '88px', right: '24px',
          width: '360px', maxHeight: '560px',
          background: '#ffffff', borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15), 0 4px 12px rgba(99,102,241,0.12)',
          display: 'flex', flexDirection: 'column',
          zIndex: 9999, overflow: 'hidden',
          animation: 'chatSlideUp 0.25s ease',
          border: '1px solid #e2e8f0',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            padding: '16px 18px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
              }}>🤖</div>
              <div>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem', lineHeight: 1 }}>Career Assistant</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  Online · Powered by AI
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              width: '28px', height: '28px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >✕</button>
          </div>

          {/* Messages */}
          <div className="chat-scroll" style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '12px', background: '#fafbff',
          }}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}
                style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-end' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '82%', padding: '10px 13px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#ffffff',
                  color: msg.role === 'user' ? '#fff' : '#1e293b',
                  fontSize: '0.84rem', lineHeight: '1.55',
                  boxShadow: msg.role === 'user' ? '0 2px 8px rgba(99,102,241,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                  border: msg.role === 'assistant' ? '1px solid #f1f5f9' : 'none',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#fff', fontWeight: '700', flexShrink: 0 }}>U</div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
                <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div style={{ padding: '8px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', background: '#fafbff', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
              {suggestedQuestions.map((q, i) => (
                <button key={i} className="suggested-btn" onClick={() => { setInput(q); inputRef.current?.focus(); }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '12px 14px', borderTop: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'flex-end', gap: '8px',
            background: '#fff', flexShrink: 0,
          }}>
            <div style={{
              flex: 1, border: '1.5px solid #e2e8f0', borderRadius: '12px',
              padding: '9px 12px', background: '#f8fafc', transition: 'border-color 0.15s',
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = '#6366f1'}
              onBlurCapture={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <textarea
                ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
                className="chat-input-field"
                rows={1}
                placeholder="Ask me anything... (Enter to send)"
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
                onKeyDown={handleKey}
                style={{ maxHeight: '100px', overflowY: 'auto' }}
              />
            </div>
            <button className="chat-send-btn" onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#e2e8f0',
                color: input.trim() && !loading ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="fab-btn" onClick={() => setOpen(o => !o)} style={{
        position: 'fixed', bottom: '24px', right: '24px',
        width: '56px', height: '56px', borderRadius: '50%',
        background: open ? '#475569' : 'linear-gradient(135deg, #6366f1, #818cf8)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
      }}>
        {!open && <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #6366f1', animation: 'pulse-ring 2s ease-out infinite' }} />}
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {unread > 0 && !open && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff',
          }}>{unread}</span>
        )}
      </button>
    </>
  );
};

export default ChatBot;