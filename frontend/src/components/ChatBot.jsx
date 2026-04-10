// // import React, { useState, useRef, useEffect } from 'react';

// // const API_BASE = 'http://localhost:5000/api';

// // const TypingDots = () => (
// //   <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
// //     {[0, 1, 2].map(i => (
// //       <span key={i} style={{
// //         width: '6px', height: '6px', borderRadius: '50%',
// //         background: '#6366f1',
// //         animation: 'botDot 1.2s infinite',
// //         animationDelay: `${i * 0.2}s`,
// //         display: 'inline-block',
// //       }} />
// //     ))}
// //   </div>
// // );

// // const ChatBot = () => {
// //   const [open, setOpen] = useState(false);
// //   const [messages, setMessages] = useState([
// //     {
// //       role: 'assistant',
// //       content: "Hi there! 👋 I'm your career assistant. Ask me about jobs, your applications, interview tips, or anything career-related!",
// //     },
// //   ]);
// //   const [input, setInput] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [unread, setUnread] = useState(0);
// //   const messagesEndRef = useRef(null);
// //   const inputRef = useRef(null);
// //   const textareaRef = useRef(null);

// //   useEffect(() => {
// //     if (open) {
// //       setUnread(0);
// //       setTimeout(() => inputRef.current?.focus(), 200);
// //     }
// //   }, [open]);

// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   }, [messages, loading]);

// //   const sendMessage = async () => {
// //     const text = input.trim();
// //     if (!text || loading) return;

// //     const userMsg = { role: 'user', content: text };
// //     const newMessages = [...messages, userMsg];
// //     setMessages(newMessages);
// //     setInput('');

// //     if (textareaRef.current) {
// //       textareaRef.current.style.height = 'auto';
// //     }

// //     setLoading(true);

// //     try {
// //       // Get token — adjust key name if yours is different
// //       const token = localStorage.getItem('token');

// //       const res = await fetch(`${API_BASE}/employee/chat`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'Authorization': `Bearer ${token}`,
// //         },
// //         body: JSON.stringify({
// //           messages: newMessages.map(m => ({ role: m.role, content: m.content })),
// //         }),
// //       });

// //       const data = await res.json();

// //       if (!data.success) throw new Error(data.message || 'Failed');

// //       setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
// //       if (!open) setUnread(u => u + 1);
// //     } catch (err) {
// //       console.error('Chat error:', err);
// //       setMessages(prev => [...prev, {
// //         role: 'assistant',
// //         content: "⚠️ Something went wrong. Please try again in a moment.",
// //       }]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleKey = (e) => {
// //     if (e.key === 'Enter' && !e.shiftKey) {
// //       e.preventDefault();
// //       sendMessage();
// //     }
// //   };

// //   const suggestedQuestions = [
// //     "How do I apply for a job?",
// //     "Tips for a great resume?",
// //     "How to prepare for interviews?",
// //   ];

// //   return (
// //     <>
// //       <style>{`
// //         @keyframes botDot {
// //           0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
// //           40% { transform: scale(1); opacity: 1; }
// //         }
// //         @keyframes chatSlideUp {
// //           from { opacity: 0; transform: translateY(16px) scale(0.97); }
// //           to { opacity: 1; transform: translateY(0) scale(1); }
// //         }
// //         @keyframes pulse-ring {
// //           0% { transform: scale(1); opacity: 0.6; }
// //           100% { transform: scale(1.5); opacity: 0; }
// //         }
// //         .chat-msg-user { animation: chatSlideUp 0.2s ease; }
// //         .chat-msg-bot  { animation: chatSlideUp 0.25s ease; }
// //         .chat-input-field {
// //           resize: none; outline: none; border: none;
// //           background: transparent; width: 100%;
// //           font-size: 0.875rem; color: #1e293b;
// //           font-family: inherit; line-height: 1.5;
// //         }
// //         .chat-input-field::placeholder { color: #94a3b8; }
// //         .chat-send-btn { border: none; cursor: pointer; transition: all 0.18s ease; }
// //         .chat-send-btn:hover:not(:disabled) { transform: scale(1.08); }
// //         .chat-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
// //         .suggested-btn {
// //           border: 1px solid #e2e8f0; background: #f8fafc; color: #475569;
// //           font-size: 0.75rem; padding: 5px 10px; border-radius: 20px;
// //           cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: inherit;
// //         }
// //         .suggested-btn:hover { background: #6366f1; color: #fff; border-color: #6366f1; }
// //         .chat-scroll::-webkit-scrollbar { width: 4px; }
// //         .chat-scroll::-webkit-scrollbar-track { background: transparent; }
// //         .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
// //         .fab-btn { border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
// //         .fab-btn:hover { transform: scale(1.07); box-shadow: 0 12px 32px rgba(99,102,241,0.45) !important; }
// //         @media (max-width: 480px) {
// //           .chatbot-window { right: 12px !important; left: 12px !important; width: auto !important; bottom: 80px !important; }
// //         }
// //       `}</style>

// //       {open && (
// //         <div className="chatbot-window" style={{
// //           position: 'fixed', bottom: '88px', right: '24px',
// //           width: '360px', maxHeight: '560px',
// //           background: '#ffffff', borderRadius: '20px',
// //           boxShadow: '0 24px 64px rgba(0,0,0,0.15), 0 4px 12px rgba(99,102,241,0.12)',
// //           display: 'flex', flexDirection: 'column',
// //           zIndex: 9999, overflow: 'hidden',
// //           animation: 'chatSlideUp 0.25s ease',
// //           border: '1px solid #e2e8f0',
// //         }}>
// //           {/* Header */}
// //           <div style={{
// //             background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
// //             padding: '16px 18px', display: 'flex',
// //             alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
// //           }}>
// //             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
// //               <div style={{
// //                 width: '36px', height: '36px', borderRadius: '50%',
// //                 background: 'rgba(255,255,255,0.2)',
// //                 display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
// //               }}>🤖</div>
// //               <div>
// //                 <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem', lineHeight: 1 }}>Career Assistant</div>
// //                 <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
// //                   <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
// //                   Online · Powered by AI
// //                 </div>
// //               </div>
// //             </div>
// //             <button onClick={() => setOpen(false)} style={{
// //               background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
// //               width: '28px', height: '28px', borderRadius: '50%',
// //               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
// //             }}
// //               onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
// //               onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
// //             >✕</button>
// //           </div>

// //           {/* Messages */}
// //           <div className="chat-scroll" style={{
// //             flex: 1, overflowY: 'auto', padding: '16px',
// //             display: 'flex', flexDirection: 'column', gap: '12px', background: '#fafbff',
// //           }}>
// //             {messages.map((msg, i) => (
// //               <div key={i} className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}
// //                 style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-end' }}>
// //                 {msg.role === 'assistant' && (
// //                   <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
// //                 )}
// //                 <div style={{
// //                   maxWidth: '82%', padding: '10px 13px',
// //                   borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
// //                   background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#ffffff',
// //                   color: msg.role === 'user' ? '#fff' : '#1e293b',
// //                   fontSize: '0.84rem', lineHeight: '1.55',
// //                   boxShadow: msg.role === 'user' ? '0 2px 8px rgba(99,102,241,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
// //                   border: msg.role === 'assistant' ? '1px solid #f1f5f9' : 'none',
// //                   whiteSpace: 'pre-wrap', wordBreak: 'break-word',
// //                 }}>
// //                   {msg.content}
// //                 </div>
// //                 {msg.role === 'user' && (
// //                   <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#fff', fontWeight: '700', flexShrink: 0 }}>U</div>
// //                 )}
// //               </div>
// //             ))}

// //             {loading && (
// //               <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
// //                 <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
// //                 <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
// //                   <TypingDots />
// //                 </div>
// //               </div>
// //             )}
// //             <div ref={messagesEndRef} />
// //           </div>

// //           {/* Suggested Questions */}
// //           {messages.length === 1 && (
// //             <div style={{ padding: '8px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', background: '#fafbff', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
// //               {suggestedQuestions.map((q, i) => (
// //                 <button key={i} className="suggested-btn" onClick={() => { setInput(q); inputRef.current?.focus(); }}>{q}</button>
// //               ))}
// //             </div>
// //           )}

// //           {/* Input */}
// //           <div style={{
// //             padding: '12px 14px', borderTop: '1px solid #f1f5f9',
// //             display: 'flex', alignItems: 'flex-end', gap: '8px',
// //             background: '#fff', flexShrink: 0,
// //           }}>
// //             <div style={{
// //               flex: 1, border: '1.5px solid #e2e8f0', borderRadius: '12px',
// //               padding: '9px 12px', background: '#f8fafc', transition: 'border-color 0.15s',
// //             }}
// //               onFocusCapture={e => e.currentTarget.style.borderColor = '#6366f1'}
// //               onBlurCapture={e => e.currentTarget.style.borderColor = '#e2e8f0'}
// //             >
// //               <textarea
// //                 ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
// //                 className="chat-input-field"
// //                 rows={1}
// //                 placeholder="Ask me anything... (Enter to send)"
// //                 value={input}
// //                 onChange={e => {
// //                   setInput(e.target.value);
// //                   e.target.style.height = 'auto';
// //                   e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
// //                 }}
// //                 onKeyDown={handleKey}
// //                 style={{ maxHeight: '100px', overflowY: 'auto' }}
// //               />
// //             </div>
// //             <button className="chat-send-btn" onClick={sendMessage}
// //               disabled={!input.trim() || loading}
// //               style={{
// //                 width: '40px', height: '40px', borderRadius: '12px',
// //                 background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#e2e8f0',
// //                 color: input.trim() && !loading ? '#fff' : '#94a3b8',
// //                 display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
// //               }}
// //             >
// //               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
// //                 <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
// //               </svg>
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* FAB */}
// //       <button className="fab-btn" onClick={() => setOpen(o => !o)} style={{
// //         position: 'fixed', bottom: '24px', right: '24px',
// //         width: '56px', height: '56px', borderRadius: '50%',
// //         background: open ? '#475569' : 'linear-gradient(135deg, #6366f1, #818cf8)',
// //         color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
// //         zIndex: 10000, boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
// //       }}>
// //         {!open && <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #6366f1', animation: 'pulse-ring 2s ease-out infinite' }} />}
// //         {open ? (
// //           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
// //             <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
// //           </svg>
// //         ) : (
// //           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// //             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
// //           </svg>
// //         )}
// //         {unread > 0 && !open && (
// //           <span style={{
// //             position: 'absolute', top: '-2px', right: '-2px',
// //             width: '18px', height: '18px', borderRadius: '50%',
// //             background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: '700',
// //             display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff',
// //           }}>{unread}</span>
// //         )}
// //       </button>
// //     </>
// //   );
// // };

// // export default ChatBot;
// import React, { useState, useRef, useEffect } from 'react';

// const API_BASE = 'http://localhost:5000/api';

// const TypingDots = () => (
//   <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
//     {[0, 1, 2].map(i => (
//       <span key={i} style={{
//         width: '6px', height: '6px', borderRadius: '50%',
//         background: '#6366f1',
//         animation: 'botDot 1.2s infinite',
//         animationDelay: `${i * 0.2}s`,
//         display: 'inline-block',
//       }} />
//     ))}
//   </div>
// );

// const ChatBot = () => {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       content: "Hi there! 👋 I'm your career assistant. Ask me about jobs, your applications, interview tips, or anything career-related!",
//     },
//   ]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [unread, setUnread] = useState(0);
//   const [sessionId, setSessionId] = useState(null);

//   // Contact Admin states
//   const [showContactForm, setShowContactForm] = useState(false);
//   const [contactMsg, setContactMsg] = useState('');
//   const [contactSent, setContactSent] = useState(false);
//   const [contactLoading, setContactLoading] = useState(false);

//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);
//   const textareaRef = useRef(null);

//   useEffect(() => {
//     if (open) {
//       setUnread(0);
//       setTimeout(() => inputRef.current?.focus(), 200);
//     }
//   }, [open]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, loading, showContactForm]);

//   const sendMessage = async () => {
//     const text = input.trim();
//     if (!text || loading) return;

//     const userMsg = { role: 'user', content: text };
//     const newMessages = [...messages, userMsg];
//     setMessages(newMessages);
//     setInput('');

//     if (textareaRef.current) textareaRef.current.style.height = 'auto';

//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_BASE}/employee/chat`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           messages: newMessages.map(m => ({ role: m.role, content: m.content })),
//           sessionId,
//         }),
//       });

//       const data = await res.json();
//       if (!data.success) throw new Error(data.message || 'Failed');

//       if (data.sessionId && !sessionId) setSessionId(data.sessionId);
//       setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
//       if (!open) setUnread(u => u + 1);
//     } catch (err) {
//       console.error('Chat error:', err);
//       setMessages(prev => [...prev, {
//         role: 'assistant',
//         content: "⚠️ Something went wrong. Please try again in a moment.",
//       }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleContactAdmin = async () => {
//     if (!contactMsg.trim()) return;
//     setContactLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_BASE}/employee/chat/contact-admin`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({ sessionId, message: contactMsg.trim() }),
//       });

//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);

//       setContactSent(true);
//       setShowContactForm(false);
//       setContactMsg('');
//       setMessages(prev => [...prev, {
//         role: 'assistant',
//         content: '✅ Your message has been sent to the admin. They will review your conversation and get back to you soon.',
//       }]);
//     } catch (err) {
//       console.error('Contact admin error:', err);
//       alert('Failed to contact admin. Please try again.');
//     } finally {
//       setContactLoading(false);
//     }
//   };

//   const handleKey = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const suggestedQuestions = [
//     "How do I apply for a job?",
//     "Tips for a great resume?",
//     "How to prepare for interviews?",
//   ];

//   return (
//     <>
//       <style>{`
//         @keyframes botDot {
//           0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
//           40% { transform: scale(1); opacity: 1; }
//         }
//         @keyframes chatSlideUp {
//           from { opacity: 0; transform: translateY(16px) scale(0.97); }
//           to { opacity: 1; transform: translateY(0) scale(1); }
//         }
//         @keyframes pulse-ring {
//           0% { transform: scale(1); opacity: 0.6; }
//           100% { transform: scale(1.5); opacity: 0; }
//         }
//         .chat-msg-user { animation: chatSlideUp 0.2s ease; }
//         .chat-msg-bot  { animation: chatSlideUp 0.25s ease; }
//         .chat-input-field {
//           resize: none; outline: none; border: none;
//           background: transparent; width: 100%;
//           font-size: 0.875rem; color: #1e293b;
//           font-family: inherit; line-height: 1.5;
//         }
//         .chat-input-field::placeholder { color: #94a3b8; }
//         .chat-send-btn { border: none; cursor: pointer; transition: all 0.18s ease; }
//         .chat-send-btn:hover:not(:disabled) { transform: scale(1.08); }
//         .chat-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
//         .suggested-btn {
//           border: 1px solid #e2e8f0; background: #f8fafc; color: #475569;
//           font-size: 0.75rem; padding: 5px 10px; border-radius: 20px;
//           cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: inherit;
//         }
//         .suggested-btn:hover { background: #6366f1; color: #fff; border-color: #6366f1; }
//         .chat-scroll::-webkit-scrollbar { width: 4px; }
//         .chat-scroll::-webkit-scrollbar-track { background: transparent; }
//         .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
//         .fab-btn { border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
//         .fab-btn:hover { transform: scale(1.07); box-shadow: 0 12px 32px rgba(99,102,241,0.45) !important; }
//         .contact-admin-btn { border: none; cursor: pointer; font-family: inherit; transition: all 0.15s; }
//         .contact-admin-btn:hover { opacity: 0.88; }
//         .contact-textarea {
//           width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px;
//           padding: 9px 12px; font-size: 0.82rem; font-family: inherit;
//           resize: none; outline: none; color: #1e293b; background: #f8fafc;
//           transition: border-color 0.15s; box-sizing: border-box;
//         }
//         .contact-textarea:focus { border-color: #f59e0b; }
//         @media (max-width: 480px) {
//           .chatbot-window { right: 12px !important; left: 12px !important; width: auto !important; bottom: 80px !important; }
//         }
//       `}</style>

//       {open && (
//         <div className="chatbot-window" style={{
//           position: 'fixed', bottom: '88px', right: '24px',
//           width: '360px', maxHeight: '600px',
//           background: '#ffffff', borderRadius: '20px',
//           boxShadow: '0 24px 64px rgba(0,0,0,0.15), 0 4px 12px rgba(99,102,241,0.12)',
//           display: 'flex', flexDirection: 'column',
//           zIndex: 9999, overflow: 'hidden',
//           animation: 'chatSlideUp 0.25s ease',
//           border: '1px solid #e2e8f0',
//         }}>

//           {/* Header */}
//           <div style={{
//             background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
//             padding: '16px 18px', display: 'flex',
//             alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//               <div style={{
//                 width: '36px', height: '36px', borderRadius: '50%',
//                 background: 'rgba(255,255,255,0.2)',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
//               }}>🤖</div>
//               <div>
//                 <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem', lineHeight: 1 }}>Career Assistant</div>
//                 <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                   <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
//                   Online · Powered by AI
//                 </div>
//               </div>
//             </div>
//             <button onClick={() => setOpen(false)} style={{
//               background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
//               width: '28px', height: '28px', borderRadius: '50%',
//               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
//             }}
//               onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
//               onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
//             >✕</button>
//           </div>

//           {/* Messages */}
//           <div className="chat-scroll" style={{
//             flex: 1, overflowY: 'auto', padding: '16px',
//             display: 'flex', flexDirection: 'column', gap: '12px', background: '#fafbff',
//           }}>
//             {messages.map((msg, i) => (
//               <div key={i} className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}
//                 style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-end' }}>
//                 {msg.role === 'assistant' && (
//                   <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
//                 )}
//                 <div style={{
//                   maxWidth: '82%', padding: '10px 13px',
//                   borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
//                   background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#ffffff',
//                   color: msg.role === 'user' ? '#fff' : '#1e293b',
//                   fontSize: '0.84rem', lineHeight: '1.55',
//                   boxShadow: msg.role === 'user' ? '0 2px 8px rgba(99,102,241,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
//                   border: msg.role === 'assistant' ? '1px solid #f1f5f9' : 'none',
//                   whiteSpace: 'pre-wrap', wordBreak: 'break-word',
//                 }}>
//                   {msg.content}
//                 </div>
//                 {msg.role === 'user' && (
//                   <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#fff', fontWeight: '700', flexShrink: 0 }}>U</div>
//                 )}
//               </div>
//             ))}

//             {loading && (
//               <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
//                 <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
//                 <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
//                   <TypingDots />
//                 </div>
//               </div>
//             )}

//             {/* Contact Admin inline form */}
//             {showContactForm && (
//               <div style={{
//                 background: '#fffbeb', border: '1.5px solid #fde68a',
//                 borderRadius: '14px', padding: '14px', marginTop: 4,
//                 animation: 'chatSlideUp 0.2s ease',
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
//                   <span style={{ fontSize: 15 }}>📩</span>
//                   <span style={{ fontWeight: 600, fontSize: '0.83rem', color: '#92400e' }}>Message to Admin</span>
//                 </div>
//                 <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#a16207' }}>
//                   Your full chat history will be shared with the admin along with this message.
//                 </p>
//                 <textarea
//                   className="contact-textarea"
//                   rows={3}
//                   placeholder="Describe your issue or question for the admin..."
//                   value={contactMsg}
//                   onChange={e => setContactMsg(e.target.value)}
//                 />
//                 <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
//                   <button
//                     className="contact-admin-btn"
//                     onClick={handleContactAdmin}
//                     disabled={contactLoading || !contactMsg.trim()}
//                     style={{
//                       flex: 1, padding: '8px 0', borderRadius: 10,
//                       background: contactMsg.trim() ? '#f59e0b' : '#e5e7eb',
//                       color: contactMsg.trim() ? '#fff' : '#9ca3af',
//                       fontWeight: 600, fontSize: '0.82rem',
//                     }}
//                   >
//                     {contactLoading ? 'Sending...' : '📤 Send to Admin'}
//                   </button>
//                   <button
//                     className="contact-admin-btn"
//                     onClick={() => { setShowContactForm(false); setContactMsg(''); }}
//                     style={{
//                       padding: '8px 14px', borderRadius: 10,
//                       background: '#f1f5f9', color: '#475569',
//                       fontWeight: 500, fontSize: '0.82rem',
//                     }}
//                   >Cancel</button>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* Suggested Questions */}
//           {messages.length === 1 && (
//             <div style={{ padding: '8px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', background: '#fafbff', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
//               {suggestedQuestions.map((q, i) => (
//                 <button key={i} className="suggested-btn" onClick={() => { setInput(q); inputRef.current?.focus(); }}>{q}</button>
//               ))}
//             </div>
//           )}

//           {/* Contact Admin banner */}
//           {!contactSent && !showContactForm && (
//             <div style={{
//               padding: '9px 14px', borderTop: '1px solid #f1f5f9',
//               display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//               background: '#fafbff', flexShrink: 0,
//             }}>
//               <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Need human help?</span>
//               <button
//                 className="contact-admin-btn"
//                 onClick={() => setShowContactForm(true)}
//                 style={{
//                   padding: '6px 14px', borderRadius: 20,
//                   background: '#fff7ed', color: '#c2410c',
//                   border: '1.5px solid #fed7aa',
//                   fontWeight: 600, fontSize: '0.76rem',
//                   display: 'flex', alignItems: 'center', gap: 5,
//                 }}
//               >
//                 <span style={{ fontSize: 13 }}>📩</span> Contact Admin
//               </button>
//             </div>
//           )}

//           {/* Sent confirmation strip */}
//           {contactSent && (
//             <div style={{
//               padding: '9px 14px', borderTop: '1px solid #f1f5f9',
//               background: '#f0fdf4', flexShrink: 0,
//               display: 'flex', alignItems: 'center', gap: 6,
//             }}>
//               <span style={{ fontSize: 13 }}>✅</span>
//               <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 500 }}>Admin notified — they'll review your chat shortly</span>
//             </div>
//           )}

//           {/* Input */}
//           <div style={{
//             padding: '12px 14px', borderTop: '1px solid #f1f5f9',
//             display: 'flex', alignItems: 'flex-end', gap: '8px',
//             background: '#fff', flexShrink: 0,
//           }}>
//             <div style={{
//               flex: 1, border: '1.5px solid #e2e8f0', borderRadius: '12px',
//               padding: '9px 12px', background: '#f8fafc', transition: 'border-color 0.15s',
//             }}
//               onFocusCapture={e => e.currentTarget.style.borderColor = '#6366f1'}
//               onBlurCapture={e => e.currentTarget.style.borderColor = '#e2e8f0'}
//             >
//               <textarea
//                 ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
//                 className="chat-input-field"
//                 rows={1}
//                 placeholder="Ask me anything... (Enter to send)"
//                 value={input}
//                 onChange={e => {
//                   setInput(e.target.value);
//                   e.target.style.height = 'auto';
//                   e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
//                 }}
//                 onKeyDown={handleKey}
//                 style={{ maxHeight: '100px', overflowY: 'auto' }}
//               />
//             </div>
//             <button className="chat-send-btn" onClick={sendMessage}
//               disabled={!input.trim() || loading}
//               style={{
//                 width: '40px', height: '40px', borderRadius: '12px',
//                 background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#e2e8f0',
//                 color: input.trim() && !loading ? '#fff' : '#94a3b8',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//               }}
//             >
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                 <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* FAB */}
//       <button className="fab-btn" onClick={() => setOpen(o => !o)} style={{
//         position: 'fixed', bottom: '24px', right: '24px',
//         width: '56px', height: '56px', borderRadius: '50%',
//         background: open ? '#475569' : 'linear-gradient(135deg, #6366f1, #818cf8)',
//         color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
//         zIndex: 10000, boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
//       }}>
//         {!open && <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #6366f1', animation: 'pulse-ring 2s ease-out infinite' }} />}
//         {open ? (
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//             <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
//           </svg>
//         ) : (
//           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//           </svg>
//         )}
//         {unread > 0 && !open && (
//           <span style={{
//             position: 'absolute', top: '-2px', right: '-2px',
//             width: '18px', height: '18px', borderRadius: '50%',
//             background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: '700',
//             display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff',
//           }}>{unread}</span>
//         )}
//       </button>
//     </>
//   );
// };

// export default ChatBot;
// // // import React, { useState, useRef, useEffect } from 'react';

// // // const API_BASE = 'http://localhost:5000/api';

// // // const TypingDots = () => (
// // //   <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
// // //     {[0, 1, 2].map(i => (
// // //       <span key={i} style={{
// // //         width: '6px', height: '6px', borderRadius: '50%',
// // //         background: '#6366f1',
// // //         animation: 'botDot 1.2s infinite',
// // //         animationDelay: `${i * 0.2}s`,
// // //         display: 'inline-block',
// // //       }} />
// // //     ))}
// // //   </div>
// // // );

// // // const ChatBot = () => {
// // //   const [open, setOpen] = useState(false);
// // //   const [messages, setMessages] = useState([
// // //     {
// // //       role: 'assistant',
// // //       content: "Hi there! 👋 I'm your career assistant. Ask me about jobs, your applications, interview tips, or anything career-related!",
// // //     },
// // //   ]);
// // //   const [input, setInput] = useState('');
// // //   const [loading, setLoading] = useState(false);
// // //   const [unread, setUnread] = useState(0);
// // //   const messagesEndRef = useRef(null);
// // //   const inputRef = useRef(null);
// // //   const textareaRef = useRef(null);

// // //   useEffect(() => {
// // //     if (open) {
// // //       setUnread(0);
// // //       setTimeout(() => inputRef.current?.focus(), 200);
// // //     }
// // //   }, [open]);

// // //   useEffect(() => {
// // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // //   }, [messages, loading]);

// // //   const sendMessage = async () => {
// // //     const text = input.trim();
// // //     if (!text || loading) return;

// // //     const userMsg = { role: 'user', content: text };
// // //     const newMessages = [...messages, userMsg];
// // //     setMessages(newMessages);
// // //     setInput('');

// // //     if (textareaRef.current) {
// // //       textareaRef.current.style.height = 'auto';
// // //     }

// // //     setLoading(true);

// // //     try {
// // //       // Get token — adjust key name if yours is different
// // //       const token = localStorage.getItem('token');

// // //       const res = await fetch(`${API_BASE}/employee/chat`, {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //           'Authorization': `Bearer ${token}`,
// // //         },
// // //         body: JSON.stringify({
// // //           messages: newMessages.map(m => ({ role: m.role, content: m.content })),
// // //         }),
// // //       });

// // //       const data = await res.json();

// // //       if (!data.success) throw new Error(data.message || 'Failed');

// // //       setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
// // //       if (!open) setUnread(u => u + 1);
// // //     } catch (err) {
// // //       console.error('Chat error:', err);
// // //       setMessages(prev => [...prev, {
// // //         role: 'assistant',
// // //         content: "⚠️ Something went wrong. Please try again in a moment.",
// // //       }]);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleKey = (e) => {
// // //     if (e.key === 'Enter' && !e.shiftKey) {
// // //       e.preventDefault();
// // //       sendMessage();
// // //     }
// // //   };

// // //   const suggestedQuestions = [
// // //     "How do I apply for a job?",
// // //     "Tips for a great resume?",
// // //     "How to prepare for interviews?",
// // //   ];

// // //   return (
// // //     <>
// // //       <style>{`
// // //         @keyframes botDot {
// // //           0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
// // //           40% { transform: scale(1); opacity: 1; }
// // //         }
// // //         @keyframes chatSlideUp {
// // //           from { opacity: 0; transform: translateY(16px) scale(0.97); }
// // //           to { opacity: 1; transform: translateY(0) scale(1); }
// // //         }
// // //         @keyframes pulse-ring {
// // //           0% { transform: scale(1); opacity: 0.6; }
// // //           100% { transform: scale(1.5); opacity: 0; }
// // //         }
// // //         .chat-msg-user { animation: chatSlideUp 0.2s ease; }
// // //         .chat-msg-bot  { animation: chatSlideUp 0.25s ease; }
// // //         .chat-input-field {
// // //           resize: none; outline: none; border: none;
// // //           background: transparent; width: 100%;
// // //           font-size: 0.875rem; color: #1e293b;
// // //           font-family: inherit; line-height: 1.5;
// // //         }
// // //         .chat-input-field::placeholder { color: #94a3b8; }
// // //         .chat-send-btn { border: none; cursor: pointer; transition: all 0.18s ease; }
// // //         .chat-send-btn:hover:not(:disabled) { transform: scale(1.08); }
// // //         .chat-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
// // //         .suggested-btn {
// // //           border: 1px solid #e2e8f0; background: #f8fafc; color: #475569;
// // //           font-size: 0.75rem; padding: 5px 10px; border-radius: 20px;
// // //           cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: inherit;
// // //         }
// // //         .suggested-btn:hover { background: #6366f1; color: #fff; border-color: #6366f1; }
// // //         .chat-scroll::-webkit-scrollbar { width: 4px; }
// // //         .chat-scroll::-webkit-scrollbar-track { background: transparent; }
// // //         .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
// // //         .fab-btn { border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
// // //         .fab-btn:hover { transform: scale(1.07); box-shadow: 0 12px 32px rgba(99,102,241,0.45) !important; }
// // //         @media (max-width: 480px) {
// // //           .chatbot-window { right: 12px !important; left: 12px !important; width: auto !important; bottom: 80px !important; }
// // //         }
// // //       `}</style>

// // //       {open && (
// // //         <div className="chatbot-window" style={{
// // //           position: 'fixed', bottom: '88px', right: '24px',
// // //           width: '360px', maxHeight: '560px',
// // //           background: '#ffffff', borderRadius: '20px',
// // //           boxShadow: '0 24px 64px rgba(0,0,0,0.15), 0 4px 12px rgba(99,102,241,0.12)',
// // //           display: 'flex', flexDirection: 'column',
// // //           zIndex: 9999, overflow: 'hidden',
// // //           animation: 'chatSlideUp 0.25s ease',
// // //           border: '1px solid #e2e8f0',
// // //         }}>
// // //           {/* Header */}
// // //           <div style={{
// // //             background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
// // //             padding: '16px 18px', display: 'flex',
// // //             alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
// // //           }}>
// // //             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
// // //               <div style={{
// // //                 width: '36px', height: '36px', borderRadius: '50%',
// // //                 background: 'rgba(255,255,255,0.2)',
// // //                 display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
// // //               }}>🤖</div>
// // //               <div>
// // //                 <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem', lineHeight: 1 }}>Career Assistant</div>
// // //                 <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
// // //                   <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
// // //                   Online · Powered by AI
// // //                 </div>
// // //               </div>
// // //             </div>
// // //             <button onClick={() => setOpen(false)} style={{
// // //               background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
// // //               width: '28px', height: '28px', borderRadius: '50%',
// // //               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
// // //             }}
// // //               onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
// // //               onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
// // //             >✕</button>
// // //           </div>

// // //           {/* Messages */}
// // //           <div className="chat-scroll" style={{
// // //             flex: 1, overflowY: 'auto', padding: '16px',
// // //             display: 'flex', flexDirection: 'column', gap: '12px', background: '#fafbff',
// // //           }}>
// // //             {messages.map((msg, i) => (
// // //               <div key={i} className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}
// // //                 style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-end' }}>
// // //                 {msg.role === 'assistant' && (
// // //                   <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
// // //                 )}
// // //                 <div style={{
// // //                   maxWidth: '82%', padding: '10px 13px',
// // //                   borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
// // //                   background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#ffffff',
// // //                   color: msg.role === 'user' ? '#fff' : '#1e293b',
// // //                   fontSize: '0.84rem', lineHeight: '1.55',
// // //                   boxShadow: msg.role === 'user' ? '0 2px 8px rgba(99,102,241,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
// // //                   border: msg.role === 'assistant' ? '1px solid #f1f5f9' : 'none',
// // //                   whiteSpace: 'pre-wrap', wordBreak: 'break-word',
// // //                 }}>
// // //                   {msg.content}
// // //                 </div>
// // //                 {msg.role === 'user' && (
// // //                   <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#fff', fontWeight: '700', flexShrink: 0 }}>U</div>
// // //                 )}
// // //               </div>
// // //             ))}

// // //             {loading && (
// // //               <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
// // //                 <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
// // //                 <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
// // //                   <TypingDots />
// // //                 </div>
// // //               </div>
// // //             )}
// // //             <div ref={messagesEndRef} />
// // //           </div>

// // //           {/* Suggested Questions */}
// // //           {messages.length === 1 && (
// // //             <div style={{ padding: '8px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', background: '#fafbff', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
// // //               {suggestedQuestions.map((q, i) => (
// // //                 <button key={i} className="suggested-btn" onClick={() => { setInput(q); inputRef.current?.focus(); }}>{q}</button>
// // //               ))}
// // //             </div>
// // //           )}

// // //           {/* Input */}
// // //           <div style={{
// // //             padding: '12px 14px', borderTop: '1px solid #f1f5f9',
// // //             display: 'flex', alignItems: 'flex-end', gap: '8px',
// // //             background: '#fff', flexShrink: 0,
// // //           }}>
// // //             <div style={{
// // //               flex: 1, border: '1.5px solid #e2e8f0', borderRadius: '12px',
// // //               padding: '9px 12px', background: '#f8fafc', transition: 'border-color 0.15s',
// // //             }}
// // //               onFocusCapture={e => e.currentTarget.style.borderColor = '#6366f1'}
// // //               onBlurCapture={e => e.currentTarget.style.borderColor = '#e2e8f0'}
// // //             >
// // //               <textarea
// // //                 ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
// // //                 className="chat-input-field"
// // //                 rows={1}
// // //                 placeholder="Ask me anything... (Enter to send)"
// // //                 value={input}
// // //                 onChange={e => {
// // //                   setInput(e.target.value);
// // //                   e.target.style.height = 'auto';
// // //                   e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
// // //                 }}
// // //                 onKeyDown={handleKey}
// // //                 style={{ maxHeight: '100px', overflowY: 'auto' }}
// // //               />
// // //             </div>
// // //             <button className="chat-send-btn" onClick={sendMessage}
// // //               disabled={!input.trim() || loading}
// // //               style={{
// // //                 width: '40px', height: '40px', borderRadius: '12px',
// // //                 background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#e2e8f0',
// // //                 color: input.trim() && !loading ? '#fff' : '#94a3b8',
// // //                 display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
// // //               }}
// // //             >
// // //               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
// // //                 <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
// // //               </svg>
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* FAB */}
// // //       <button className="fab-btn" onClick={() => setOpen(o => !o)} style={{
// // //         position: 'fixed', bottom: '24px', right: '24px',
// // //         width: '56px', height: '56px', borderRadius: '50%',
// // //         background: open ? '#475569' : 'linear-gradient(135deg, #6366f1, #818cf8)',
// // //         color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
// // //         zIndex: 10000, boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
// // //       }}>
// // //         {!open && <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #6366f1', animation: 'pulse-ring 2s ease-out infinite' }} />}
// // //         {open ? (
// // //           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
// // //             <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
// // //           </svg>
// // //         ) : (
// // //           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// // //             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
// // //           </svg>
// // //         )}
// // //         {unread > 0 && !open && (
// // //           <span style={{
// // //             position: 'absolute', top: '-2px', right: '-2px',
// // //             width: '18px', height: '18px', borderRadius: '50%',
// // //             background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: '700',
// // //             display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff',
// // //           }}>{unread}</span>
// // //         )}
// // //       </button>
// // //     </>
// // //   );
// // // };

// // // export default ChatBot;
// // import React, { useState, useRef, useEffect } from 'react';

// // const API_BASE = 'http://localhost:5000/api';

// // const ChatBot = () => {
// //   const [open, setOpen] = useState(false);
// //   const [mode, setMode] = useState('ai'); // 🔥 ai | admin
// //   const [messages, setMessages] = useState([
// //     {
// //       role: 'assistant',
// //       content: "Hi there! 👋 I'm your assistant. Choose AI or Admin to start chatting!",
// //     },
// //   ]);
// //   const [input, setInput] = useState('');
// //   const [unread, setUnread] = useState(0);

// //   const messagesEndRef = useRef(null);
// //   const inputRef = useRef(null);

// //   const ADMIN_ID = 1;

// //   // 🔹 Scroll
// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   }, [messages]);

// //   // 🔹 When chat opens
// //   useEffect(() => {
// //     if (open) {
// //       setUnread(0);

// //       if (mode === 'admin') {
// //         fetchAdminMessages();
// //       }

// //       setTimeout(() => inputRef.current?.focus(), 200);
// //     }
// //   }, [open, mode]);

// //   // 🔹 Fetch admin messages
// //   const fetchAdminMessages = async () => {
// //     const token = localStorage.getItem('token');

// //     const res = await fetch(`${API_BASE}/chat/employee/${ADMIN_ID}`, {
// //       headers: { Authorization: `Bearer ${token}` },
// //     });

// //     const data = await res.json();

// //     if (data.success) {
// //       const formatted = data.data.map(msg => ({
// //         role: msg.sender_id === ADMIN_ID ? 'assistant' : 'user',
// //         content: msg.message,
// //       }));

// //       setMessages(formatted);
// //     }
// //   };

// //   // 🔹 Send Message
// //   const sendMessage = async () => {
// //     const text = input.trim();
// //     if (!text) return;

// //     const token = localStorage.getItem('token');

// //     // show immediately
// //     setMessages(prev => [...prev, { role: 'user', content: text }]);
// //     setInput('');

// //     try {
// //       if (mode === 'admin') {
// //         // 👨‍💼 ADMIN CHAT
// //         await fetch(`${API_BASE}/chat/employee/send`, {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             Authorization: `Bearer ${token}`,
// //           },
// //           body: JSON.stringify({
// //             receiver_id: ADMIN_ID,
// //             message: text,
// //           }),
// //         });

// //         fetchAdminMessages();

// //       } else {
// //         // 🤖 AI CHAT
// //         const res = await fetch(`${API_BASE}/employee/chat`, {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             Authorization: `Bearer ${token}`,
// //           },
// //           body: JSON.stringify({
// //             messages: [...messages, { role: 'user', content: text }],
// //           }),
// //         });

// //         const data = await res.json();

// //         if (data.success) {
// //           setMessages(prev => [
// //             ...prev,
// //             { role: 'assistant', content: data.reply },
// //           ]);
// //         }
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       setMessages(prev => [
// //         ...prev,
// //         { role: 'assistant', content: "⚠️ Error sending message" },
// //       ]);
// //     }
// //   };

// //   const handleKey = (e) => {
// //     if (e.key === 'Enter') {
// //       e.preventDefault();
// //       sendMessage();
// //     }
// //   };

// //   return (
// //     <>
// //       {/* CHAT WINDOW */}
// //       {open && (
// //         <div style={{
// //           position: 'fixed',
// //           bottom: '80px',
// //           right: '20px',
// //           width: '350px',
// //           height: '500px',
// //           background: '#fff',
// //           borderRadius: '15px',
// //           display: 'flex',
// //           flexDirection: 'column',
// //           boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
// //           overflow: 'hidden'
// //         }}>

// //           {/* HEADER */}
// //           <div style={{
// //             padding: '12px',
// //             background: '#6366f1',
// //             color: '#fff'
// //           }}>
// //             <div style={{ fontWeight: 'bold' }}>Chat Assistant</div>

// //             {/* 🔥 TOGGLE */}
// //             <div style={{ marginTop: '6px' }}>
// //               <button onClick={() => setMode('ai')}>AI</button>
// //               <button onClick={() => setMode('admin')}>Admin</button>
// //             </div>
// //           </div>

// //           {/* MESSAGES */}
// //           <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
// //             {messages.map((msg, i) => (
// //               <div key={i} style={{
// //                 textAlign: msg.role === 'user' ? 'right' : 'left',
// //                 margin: '5px 0'
// //               }}>
// //                 <span style={{
// //                   background: msg.role === 'user' ? '#6366f1' : '#eee',
// //                   color: msg.role === 'user' ? '#fff' : '#000',
// //                   padding: '8px',
// //                   borderRadius: '10px',
// //                   display: 'inline-block'
// //                 }}>
// //                   {msg.content}
// //                 </span>
// //               </div>
// //             ))}
// //             <div ref={messagesEndRef} />
// //           </div>

// //           {/* INPUT */}
// //           <div style={{ display: 'flex', padding: '10px' }}>
// //             <input
// //               ref={inputRef}
// //               value={input}
// //               onChange={(e) => setInput(e.target.value)}
// //               onKeyDown={handleKey}
// //               placeholder="Type message..."
// //               style={{ flex: 1, padding: '8px' }}
// //             />
// //             <button onClick={sendMessage}>Send</button>
// //           </div>
// //         </div>
// //       )}

// //       {/* FLOAT BUTTON */}
// //       <button
// //         onClick={() => setOpen(!open)}
// //         style={{
// //           position: 'fixed',
// //           bottom: '20px',
// //           right: '20px',
// //           width: '55px',
// //           height: '55px',
// //           borderRadius: '50%',
// //           background: '#6366f1',
// //           color: '#fff',
// //           fontSize: '20px'
// //         }}
// //       >
// //         💬
// //       </button>
// //     </>
// //   );
// // };

// // export default ChatBot;
// import React, { useState, useRef, useEffect } from 'react';

// const API_BASE = 'http://localhost:5000/api';

// const ChatBot = () => {
//   const [open, setOpen] = useState(false);
//   const [mode, setMode] = useState('ai'); // ai | admin
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       content: "Hi there! 👋 Choose AI or Admin to start chatting!",
//     },
//   ]);
//   const [input, setInput] = useState('');
//   const [unread, setUnread] = useState(0);
//   const [adminId, setAdminId] = useState(null); // 🔥 dynamic admin

//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);

//   const token = localStorage.getItem('token');

//   // 🔹 Scroll
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // 🔹 Fetch admin dynamically
//   useEffect(() => {
//     const fetchAdmin = async () => {
//       const res = await fetch(`${API_BASE}/chat/admin/users`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();

//       if (data.success && data.data.length > 0) {
//         setAdminId(data.data[0].id); // ✅ first admin
//       }
//     };

//     fetchAdmin();
//   }, []);

//   // 🔹 When chat opens
//   useEffect(() => {
//     if (open) {
//       setUnread(0);

//       if (mode === 'admin' && adminId) {
//         fetchAdminMessages();
//       }

//       setTimeout(() => inputRef.current?.focus(), 200);
//     }
//   }, [open, mode, adminId]);

//   // 🔹 Fetch admin messages
//   const fetchAdminMessages = async () => {
//     if (!adminId) return;

//     const res = await fetch(`${API_BASE}/chat/employee/${adminId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const data = await res.json();

//     if (data.success) {
//       const formatted = data.data.map(msg => ({
//         role: msg.sender_id === adminId ? 'assistant' : 'user',
//         content: msg.message,
//       }));

//       setMessages(formatted);
//     }
//   };

//   // 🔹 Send Message
//   const sendMessage = async () => {
//     const text = input.trim();
//     if (!text) return;

//     setMessages(prev => [...prev, { role: 'user', content: text }]);
//     setInput('');

//     try {
//       if (mode === 'admin') {
//         if (!adminId) {
//           alert("Admin not available");
//           return;
//         }

//         await fetch(`${API_BASE}/chat/employee/send`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             receiver_id: adminId, // ✅ FIXED
//             message: text,
//           }),
//         });

//         fetchAdminMessages();

//       } else {
//         // 🤖 AI CHAT
//         const res = await fetch(`${API_BASE}/employee/chat`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             messages: [...messages, { role: 'user', content: text }],
//           }),
//         });

//         const data = await res.json();

//         if (data.success) {
//           setMessages(prev => [
//             ...prev,
//             { role: 'assistant', content: data.reply },
//           ]);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       setMessages(prev => [
//         ...prev,
//         { role: 'assistant', content: "⚠️ Error sending message" },
//       ]);
//     }
//   };

//   const handleKey = (e) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <>
//       {open && (
//         <div style={{
//           position: 'fixed',
//           bottom: '80px',
//           right: '20px',
//           width: '350px',
//           height: '500px',
//           background: '#fff',
//           borderRadius: '15px',
//           display: 'flex',
//           flexDirection: 'column',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
//           overflow: 'hidden'
//         }}>

//           {/* HEADER */}
//           <div style={{
//             padding: '12px',
//             background: '#6366f1',
//             color: '#fff'
//           }}>
//             <div style={{ fontWeight: 'bold' }}>Chat Assistant</div>

//             <div style={{ marginTop: '6px' }}>
//               <button onClick={() => setMode('ai')}>AI</button>
//               <button onClick={() => setMode('admin')}>Admin</button>
//             </div>
//           </div>

//           {/* MESSAGES */}
//           <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
//             {messages.map((msg, i) => (
//               <div key={i} style={{
//                 textAlign: msg.role === 'user' ? 'right' : 'left',
//                 margin: '5px 0'
//               }}>
//                 <span style={{
//                   background: msg.role === 'user' ? '#6366f1' : '#eee',
//                   color: msg.role === 'user' ? '#fff' : '#000',
//                   padding: '8px',
//                   borderRadius: '10px',
//                   display: 'inline-block'
//                 }}>
//                   {msg.content}
//                 </span>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* INPUT */}
//           <div style={{ display: 'flex', padding: '10px' }}>
//             <input
//               ref={inputRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKey}
//               placeholder="Type message..."
//               style={{ flex: 1, padding: '8px' }}
//             />
//             <button onClick={sendMessage}>Send</button>
//           </div>
//         </div>
//       )}

//       {/* FAB */}
//       <button
//         onClick={() => setOpen(!open)}
//         style={{
//           position: 'fixed',
//           bottom: '20px',
//           right: '20px',
//           width: '55px',
//           height: '55px',
//           borderRadius: '50%',
//           background: '#6366f1',
//           color: '#fff',
//           fontSize: '20px'
//         }}
//       >
//         💬
//       </button>
//     </>
//   );
// };

// export default ChatBot;
import React, { useState, useRef, useEffect, useCallback } from 'react';

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
  const [open, setOpen]         = useState(false);
  const [mode, setMode]         = useState('ai');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi there! 👋 I'm your career assistant. Ask me about jobs, applications, or switch to Admin chat!" },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [unread, setUnread]     = useState(0);
  const [admins, setAdmins]     = useState([]);
  const [myUserId, setMyUserId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const textareaRef    = useRef(null);
  const pollRef        = useRef(null);

  // decode own user ID from JWT once
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setMyUserId(payload.id || payload.userId || payload.sub);
      }
    } catch (e) {
      console.warn('Could not decode token:', e);
    }
  }, []);

  // fetch admin list via employee-accessible endpoint
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch(`${API_BASE}/chat/employee/admins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data  = await res.json();
        if (data.success) setAdmins(data.data);
      } catch (err) {
        console.error('Failed to fetch admins:', err);
      }
    };
    fetchAdmins();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // KEY FIX: fetch the merged thread across ALL admins using /my-thread
  // This means replies from any admin will always appear
  const fetchAdminMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/chat/employee/my-thread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data  = await res.json();
      if (data.success) {
        // deduplicate: when employee broadcasts, each admin gets a copy —
        // we only want to show the message once on the employee side
        const seen = new Set();
        const deduped = [];
        for (const msg of data.data) {
          // key = sender + trimmed content + minute-level timestamp (ignores broadcast copies)
          const key = `${msg.sender_id}|${msg.message.trim()}|${new Date(msg.created_at).toISOString().slice(0, 16)}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(msg);
          }
        }

        const formatted = deduped.map(msg => ({
          role:      String(msg.sender_id) === String(myUserId) ? 'user' : 'assistant',
          content:   msg.message,
          timestamp: msg.created_at,
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch admin messages:', err);
    }
  }, [myUserId]);

  useEffect(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (!open) return;

    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 200);

    if (mode === 'admin') {
      setMessages([]);
      fetchAdminMessages();
      // poll every 5s so admin replies appear without page refresh
      pollRef.current = setInterval(fetchAdminMessages, 5000);
    } else {
      setMessages([
        { role: 'assistant', content: "Hi there! 👋 I'm your career assistant. Ask me about jobs, applications, or switch to Admin chat!" },
      ]);
    }

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, mode, fetchAdminMessages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const token   = localStorage.getItem('token');
    const userMsg = { role: 'user', content: text };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      if (mode === 'admin') {
        // no receiver_id → broadcasts to all admins in controller
        const res  = await fetch(`${API_BASE}/chat/employee/send`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ message: text }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        // re-fetch thread so the sent message is confirmed from DB
        await fetchAdminMessages();
      } else {
        const res  = await fetch(`${API_BASE}/employee/chat`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'AI failed');
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (!open) setUnread(u => u + 1);
      }
    } catch (err) {
      console.error('Send error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
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
        .fab-btn:hover { transform:scale(1.07);box-shadow:0 12px 32px rgba(99,102,241,0.45) !important; }
        @media (max-width:480px) { .chatbot-window { right:12px !important;left:12px !important;width:auto !important;bottom:80px !important; } }
      `}</style>

      {open && (
        <div className="chatbot-window" style={{
          position:'fixed', bottom:'88px', right:'24px', width:'360px', maxHeight:'560px',
          background:'#ffffff', borderRadius:'20px',
          boxShadow:'0 24px 64px rgba(0,0,0,0.15), 0 4px 12px rgba(99,102,241,0.12)',
          display:'flex', flexDirection:'column', zIndex:9999, overflow:'hidden',
          animation:'chatSlideUp 0.25s ease', border:'1px solid #e2e8f0',
        }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', padding:'14px 18px', flexShrink:0 }}>
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
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ade80', display:'inline-block' }} />
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
          <div className="chat-scroll" style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px', background:'#fafbff' }}>
            {mode === 'admin' && messages.length === 0 && !loading && (
              <div style={{ textAlign:'center', color:'#94a3b8', fontSize:'0.8rem', marginTop:'20px' }}>
                <div style={{ fontSize:'2rem', marginBottom:'8px' }}>👨‍💼</div>
                {admins.length === 0
                  ? 'No admins are currently available.'
                  : `Your message will be sent to ${admins.length} admin${admins.length !== 1 ? 's' : ''}.`}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}
                style={{ display:'flex', justifyContent:msg.role === 'user' ? 'flex-end' : 'flex-start', gap:'8px', alignItems:'flex-end' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', flexShrink:0 }}>
                    {mode === 'admin' ? '👨‍💼' : '🤖'}
                  </div>
                )}
                <div style={{
                  maxWidth:'82%', padding:'10px 13px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#ffffff',
                  color: msg.role === 'user' ? '#fff' : '#1e293b',
                  fontSize:'0.84rem', lineHeight:'1.55',
                  boxShadow: msg.role === 'user' ? '0 2px 8px rgba(99,102,241,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                  border: msg.role === 'assistant' ? '1px solid #f1f5f9' : 'none',
                  whiteSpace:'pre-wrap', wordBreak:'break-word',
                }}>
                  {msg.content}
                  <div style={{ fontSize:'0.68rem', opacity:0.55, marginTop:'3px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : ''}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', color:'#fff', fontWeight:'700', flexShrink:0 }}>U</div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
                <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', flexShrink:0 }}>
                  {mode === 'admin' ? '👨‍💼' : '🤖'}
                </div>
                <div style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:'16px 16px 16px 4px', padding:'10px 14px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {mode === 'ai' && messages.length === 1 && (
            <div style={{ padding:'8px 16px', display:'flex', gap:'6px', flexWrap:'wrap', background:'#fafbff', borderTop:'1px solid #f1f5f9', flexShrink:0 }}>
              {suggestedQuestions.map((q, i) => (
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
                placeholder={mode === 'admin' ? 'Message admin... (Enter to send)' : 'Ask me anything... (Enter to send)'}
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
                background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#e2e8f0',
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
        background: open ? '#475569' : 'linear-gradient(135deg, #6366f1, #818cf8)',
        color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:10000, boxShadow:'0 8px 24px rgba(99,102,241,0.35)',
      }}>
        {!open && <span style={{ position:'absolute', width:'100%', height:'100%', borderRadius:'50%', border:'2px solid #6366f1', animation:'pulse-ring 2s ease-out infinite' }} />}
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