
import React, { useEffect, useState, useRef, useCallback } from 'react';
import WebRTCCall from './WebRTCCall';

const API_BASE = 'http://localhost:5000/api';
const EMOJI_LIST = ['👍','❤️','😂','😮','😢','🙏','🎉','🔥','✅','💯'];

const THEMES = [
  { id:'default', label:'Default', bg:'#f5f7fa', bubble:'#7c6bff', bubbleText:'#fff', them:'#fff', sidebar:'#fff', header:'#fff' },
  { id:'dark', label:'Dark', bg:'#0f1117', bubble:'#7c6bff', bubbleText:'#fff', them:'#1e1e2a', sidebar:'#161620', header:'#161620' },
  { id:'ocean', label:'Ocean', bg:'#e8f4fd', bubble:'#0284c7', bubbleText:'#fff', them:'#fff', sidebar:'#fff', header:'#fff' },
  { id:'forest', label:'Forest', bg:'#f0fdf4', bubble:'#16a34a', bubbleText:'#fff', them:'#fff', sidebar:'#fff', header:'#fff' },
  { id:'rose', label:'Rose', bg:'#fff1f2', bubble:'#e11d48', bubbleText:'#fff', them:'#fff', sidebar:'#fff', header:'#fff' },
  { id:'sunset', label:'Sunset', bg:'#fff7ed', bubble:'#ea580c', bubbleText:'#fff', them:'#fff', sidebar:'#fff', header:'#fff' },
  { id:'midnight', label:'Midnight', bg:'#1e1b4b', bubble:'#6366f1', bubbleText:'#fff', them:'#2e2b5b', sidebar:'#1a1740', header:'#1a1740' },
  { id:'mint', label:'Mint', bg:'#f0fdf9', bubble:'#0d9488', bubbleText:'#fff', them:'#fff', sidebar:'#fff', header:'#fff' },
];

const groupReactions = (reactions = []) => {
  const map = {};
  for (const r of reactions) {
    map[r.emoji] = map[r.emoji] || [];
    map[r.emoji].push(String(r.user_id));
  }
  return map;
};

const fmtTime = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const fmtDaySep = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};

const initials = (email = '') => (email.split('@')[0] || 'U').slice(0, 2).toUpperCase();
const fmtSize = (b) => {
  if (!b) return '';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
};
const isImage = (name = '') => /\.(jpe?g|png|gif|webp|svg)$/i.test(name);

const hashColor = (email = '') => {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
  const palettes = [
    { bg: 'rgba(124,107,255,0.12)', color: '#7c6bff', border: 'rgba(124,107,255,0.25)' },
    { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.22)' },
    { bg: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: 'rgba(6,182,212,0.22)' },
    { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.22)' },
    { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.22)' },
    { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.22)' },
  ];
  return palettes[h % palettes.length];
};

const Avatar = ({ email, size = 36, online = false, photoUrl = null }) => {
  const pal = hashColor(email);
  return (
    <div className="admc-avatar" style={{ width: size, height: size, fontSize: size * 0.32, background: pal.bg, color: pal.color, borderColor: pal.border, overflow: 'hidden' }}>
      {photoUrl
        ? <img src={`http://localhost:5000${photoUrl}`} alt={email} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display='none'; }} />
        : initials(email)
      }
      {online && <div className="admc-avatar-badge" />}
    </div>
  );
};

const STYLES = `
.admc-root{display:flex;height:calc(100vh - 56px);width:100%;overflow:hidden;font-family:'Inter',system-ui,sans-serif;font-size:14px;color:#0d0f1a}
.admc-sidebar{width:280px;min-width:280px;display:flex;flex-direction:column;border-right:1px solid #e4e7ef}
.admc-sidebar-top{padding:16px 18px 14px;border-bottom:1px solid #e4e7ef;display:flex;align-items:center;justify-content:space-between}
.admc-sidebar-title{font-size:15px;font-weight:700;letter-spacing:-.3px}
.admc-live{display:flex;align-items:center;gap:6px}
.admc-live-dot{width:7px;height:7px;border-radius:50%;background:#16a34a;box-shadow:0 0 8px rgba(22,163,74,.5);animation:admc-pulse 2.2s ease-in-out infinite}
@keyframes admc-pulse{0%,100%{opacity:1}50%{opacity:.4}}
.admc-live-txt{font-size:10px;color:#16a34a;font-family:'JetBrains Mono',monospace;letter-spacing:.5px}
.admc-search-wrap{padding:10px 12px;border-bottom:1px solid #e4e7ef}
.admc-search{width:100%;background:#f0f2f7;border:1px solid #e4e7ef;border-radius:9px;padding:8px 12px 8px 34px;color:#0d0f1a;font-size:12.5px;font-family:inherit;outline:none;transition:border-color .15s;box-sizing:border-box;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%239198b2' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:11px center}
.admc-search::placeholder{color:#9198b2}
.admc-search:focus{border-color:#7c6bff;background-color:#fff}
.admc-user-list{flex:1;overflow-y:auto;padding:6px 8px}
.admc-user-item{display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;cursor:pointer;transition:background .15s;margin-bottom:2px;border:1px solid transparent}
.admc-user-item:hover{background:rgba(0,0,0,.04)}
.admc-user-item.active{background:rgba(124,107,255,.08);border-color:rgba(124,107,255,.2)}
.admc-avatar{flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;position:relative;border:1.5px solid;font-family:'JetBrains Mono',monospace;letter-spacing:.3px}
.admc-avatar-badge{position:absolute;bottom:0;right:0;width:9px;height:9px;border-radius:50%;background:#16a34a;border:2px solid #fff;z-index:2}
.admc-user-info{flex:1;min-width:0}
.admc-user-name{font-size:12.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1px}
.admc-user-item.active .admc-user-name{color:#7c6bff}
.admc-user-preview{font-size:11px;color:#9198b2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.admc-user-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.admc-user-time{font-size:10px;color:#9198b2;font-family:'JetBrains Mono',monospace}
.admc-badge{background:#7c6bff;color:#fff;font-size:9.5px;font-weight:700;font-family:'JetBrains Mono',monospace;padding:1px 6px;border-radius:20px;min-width:18px;text-align:center}
.admc-main{flex:1;display:flex;flex-direction:column;min-width:0}
.admc-header{padding:13px 20px;border-bottom:1px solid #e4e7ef;display:flex;align-items:center;gap:12px;min-height:60px;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.admc-header-info{flex:1;min-width:0}
.admc-header-name{font-size:14px;font-weight:600;letter-spacing:-.3px}
.admc-header-status{font-size:11px;display:flex;align-items:center;gap:5px;margin-top:2px}
.admc-header-status.online{color:#16a34a}
.admc-header-status.offline{color:#9198b2}
.admc-status-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0}
.admc-hdr-btn{width:32px;height:32px;border-radius:8px;border:1px solid #e4e7ef;background:#f5f7fa;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#9198b2;transition:all .15s;position:relative}
.admc-hdr-btn:hover{background:#eaecf3;color:#4a5068}
.admc-hdr-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.admc-messages{flex:1;overflow-y:auto;padding:18px 22px;display:flex;flex-direction:column}
.admc-no-conv{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#9198b2}
.admc-no-conv-ring{width:68px;height:68px;border-radius:50%;border:1.5px solid #e4e7ef;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.admc-day-sep{display:flex;align-items:center;gap:12px;margin:16px 0 14px}
.admc-day-line{flex:1;height:1px;background:#e4e7ef}
.admc-day-lbl{font-size:10.5px;color:#9198b2;font-family:'JetBrains Mono',monospace;white-space:nowrap;letter-spacing:.4px}
.admc-msg-group{display:flex;flex-direction:column;gap:2px;margin-bottom:10px}
.admc-msg-row{display:flex;align-items:flex-end;gap:8px;position:relative}
.admc-msg-row.me{flex-direction:row-reverse}
.admc-msg-av{flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:'JetBrains Mono',monospace;letter-spacing:.3px;border:1.5px solid;overflow:hidden}
.admc-msg-av-spacer{width:28px;flex-shrink:0}
.admc-bubble-wrap{position:relative;max-width:62%;display:flex;flex-direction:column}
.admc-bubble{padding:10px 14px 8px;font-size:13.5px;line-height:1.6;word-break:break-word;position:relative}
.admc-bubble.them{background:#fff;color:#0d0f1a;border:1px solid #e4e7ef;border-radius:3px 16px 16px 16px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.admc-bubble.deleted{background:#f0f2f7;color:#9198b2;border:1px solid #e4e7ef;border-radius:10px;font-style:italic;padding:8px 14px}
.admc-bubble-foot{display:flex;align-items:center;gap:5px;margin-top:5px;font-size:10.5px;font-family:'JetBrains Mono',monospace}
.admc-bubble.them .admc-bubble-foot,.admc-bubble.deleted .admc-bubble-foot{color:#9198b2}
.admc-edited-lbl{font-size:9.5px;opacity:.6;font-style:italic}
.admc-img-thumb{max-width:200px;max-height:160px;border-radius:8px;cursor:pointer;display:block;object-fit:cover;margin-bottom:4px}
.admc-file-attach{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;margin-bottom:4px;text-decoration:none}
.admc-file-attach.me-file{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.2)}
.admc-file-attach.them-file{background:#f5f7fa;border:1px solid #e4e7ef}
.admc-file-icon{width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.admc-file-attach.me-file .admc-file-icon{background:rgba(255,255,255,.2)}
.admc-file-attach.them-file .admc-file-icon{background:#e4e7ef}
.admc-file-name{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px}
.admc-file-size{font-size:10px;opacity:.6}
.admc-action-bar{position:absolute;top:-44px;z-index:200;background:#fff;border:1px solid #e4e7ef;border-radius:10px;padding:4px;display:flex;gap:2px;align-items:center;box-shadow:0 4px 16px rgba(0,0,0,.1);animation:admc-pop .12s cubic-bezier(.34,1.56,.64,1)}
.admc-action-bar.me{right:0}
.admc-action-bar.them{left:0}
@keyframes admc-pop{from{opacity:0;transform:scale(.85) translateY(4px)}to{opacity:1;transform:scale(1) translateY(0)}}
.admc-act-btn{display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:7px;border:none;background:none;cursor:pointer;font-size:12px;color:#4a5068;font-family:inherit;transition:background .12s,color .12s;white-space:nowrap}
.admc-act-btn:hover{background:#f5f7fa;color:#0d0f1a}
.admc-act-btn.danger{color:#dc2626}
.admc-act-btn.danger:hover{background:#fef2f2}
.admc-act-sep{width:1px;height:18px;background:#e4e7ef;flex-shrink:0}
.admc-emoji-sub{position:fixed;z-index:9999;background:#fff;border:1px solid #e4e7ef;border-radius:30px;padding:6px 10px;display:flex;gap:4px;box-shadow:0 4px 20px rgba(0,0,0,.18);animation:admc-pop .12s cubic-bezier(.34,1.56,.64,1)}
.admc-emoji-btn{font-size:18px;padding:2px 3px;border-radius:8px;background:none;border:none;cursor:pointer;transition:transform .1s;line-height:1}
.admc-emoji-btn:hover{transform:scale(1.3)}
.admc-reactions{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px}
.admc-rpill{display:inline-flex;align-items:center;gap:4px;background:#f0f2f7;border:1px solid #e4e7ef;border-radius:20px;padding:3px 9px;font-size:11.5px;cursor:pointer;transition:all .15s;color:#4a5068;line-height:1}
.admc-rpill:hover{border-color:#7c6bff;background:rgba(124,107,255,.08)}
.admc-rpill.mine{background:rgba(124,107,255,.1);border-color:rgba(124,107,255,.3);color:#7c6bff}
.admc-rpill-count{font-size:10.5px;font-family:'JetBrains Mono',monospace}
.admc-input-area{padding:13px 18px;border-top:1px solid #e4e7ef;background:#fff;display:flex;align-items:flex-end;gap:9px;position:relative}
.admc-input-wrap{flex:1;background:#f5f7fa;border:1.5px solid #e4e7ef;border-radius:14px;padding:10px 14px;display:flex;align-items:flex-end;gap:8px;transition:border-color .18s}
.admc-input-wrap:focus-within{border-color:#7c6bff;background:#fff}
.admc-input-wrap.editing{border-color:#f59e0b;background:#fffbeb}
.admc-textarea{flex:1;background:none;border:none;outline:none;color:#0d0f1a;font-size:13.5px;font-family:inherit;resize:none;line-height:1.5;max-height:120px;min-height:22px}
.admc-textarea::placeholder{color:#9198b2}
.admc-icon-btn{width:30px;height:30px;border-radius:8px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#9198b2;transition:color .15s;flex-shrink:0}
.admc-icon-btn:hover{color:#4a5068}
.admc-send-btn{width:36px;height:36px;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;transition:opacity .15s,transform .15s;box-shadow:0 2px 8px rgba(124,107,255,.3)}
.admc-send-btn:hover:not(:disabled){opacity:.85}
.admc-send-btn:active:not(:disabled){transform:scale(.93)}
.admc-send-btn:disabled{opacity:.3;cursor:not-allowed;box-shadow:none}
.admc-attach-previews{padding:8px 18px 0;display:flex;gap:8px;flex-wrap:wrap;background:#fff;border-top:1px solid #f0f2f7}
.admc-attach-chip{display:flex;align-items:center;gap:6px;padding:5px 8px 5px 10px;background:#f0f2f7;border:1px solid #e4e7ef;border-radius:8px;font-size:11.5px;color:#4a5068;max-width:180px}
.admc-attach-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.admc-attach-remove{background:none;border:none;cursor:pointer;color:#9198b2;padding:0;font-size:13px;line-height:1}
.admc-attach-remove:hover{color:#ef4444}
.admc-edit-banner{padding:7px 18px;background:#fffbeb;border-top:1px solid #fde68a;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#92400e;font-family:'JetBrains Mono',monospace}
.admc-edit-cancel{background:none;border:none;cursor:pointer;color:#92400e;font-size:13px;font-family:inherit;opacity:.7}
.admc-edit-cancel:hover{opacity:1}
.admc-emoji-panel{position:absolute;bottom:calc(100% + 8px);right:18px;background:#fff;border:1px solid #e4e7ef;border-radius:16px;padding:12px;display:flex;gap:6px;flex-wrap:wrap;max-width:240px;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.12);animation:admc-pop .14s cubic-bezier(.34,1.56,.64,1)}
.admc-ep-btn{font-size:20px;padding:4px;border-radius:9px;background:none;border:none;cursor:pointer;transition:background .1s,transform .1s;line-height:1}
.admc-ep-btn:hover{background:#f5f7fa;transform:scale(1.2)}
.admc-alert{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 18px;font-size:12.5px;border-bottom:1px solid}
.admc-alert-err{background:#fef2f2;border-color:#fecaca;color:#991b1b}
.admc-alert-ok{background:#f0fdf4;border-color:#bbf7d0;color:#166534}
.admc-alert-close{background:none;border:none;cursor:pointer;color:inherit;font-size:16px;opacity:.7}
.admc-overlay{position:fixed;inset:0;background:rgba(10,10,15,.55);backdrop-filter:blur(6px);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px}
.admc-modal{background:#14141c;border:1px solid #2a2a38;border-radius:18px;padding:28px;width:100%;max-width:420px;animation:admc-modal-in .2s cubic-bezier(.34,1.56,.64,1);box-shadow:0 24px 64px rgba(0,0,0,.5)}
@keyframes admc-modal-in{from{opacity:0;transform:scale(.9) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
.admc-modal-icon{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.admc-modal-icon.red{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.25)}
.admc-modal-icon.red svg{stroke:#ef4444}
.admc-modal-icon svg{width:22px;height:22px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.admc-modal-title{font-size:17px;font-weight:700;color:#f0f0f8;margin-bottom:8px}
.admc-modal-sub{font-size:13px;color:#8888a8;margin-bottom:24px;line-height:1.65}
.admc-modal-btns{display:flex;flex-direction:column;gap:8px}
.admc-modal-btn{padding:11px 18px;border-radius:11px;border:none;cursor:pointer;font-size:13px;font-weight:500;font-family:inherit;transition:opacity .15s,transform .1s;text-align:left;display:flex;align-items:center;gap:10px}
.admc-modal-btn:hover{opacity:.88}
.admc-modal-btn:active{transform:scale(.98)}
.admc-modal-btn.for-me{background:#1e1e28;color:#e8e8f0;border:1px solid #2a2a38}
.admc-modal-btn.for-all{background:#ef4444;color:#fff}
.admc-modal-btn.cancel{background:transparent;color:#55556a;border:1px solid #2a2a38}
.admc-modal-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.admc-lightbox{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out}
.admc-lightbox img{max-width:90vw;max-height:90vh;border-radius:10px}
.admc-theme-panel{position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1px solid #e4e7ef;border-radius:14px;padding:14px;z-index:300;box-shadow:0 8px 32px rgba(0,0,0,.12);animation:admc-pop .14s cubic-bezier(.34,1.56,.64,1);min-width:220px}
.admc-theme-title{font-size:11px;font-weight:600;color:#9198b2;letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px;font-family:'JetBrains Mono',monospace}
.admc-theme-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.admc-theme-swatch{width:100%;aspect-ratio:1;border-radius:10px;cursor:pointer;border:2px solid transparent;position:relative;transition:transform .15s}
.admc-theme-swatch:hover{transform:scale(1.08)}
.admc-theme-swatch.active{border-color:#7c6bff}
.admc-theme-swatch.active::after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.4)}
.admc-theme-label{font-size:10px;color:#9198b2;text-align:center;margin-top:3px}
@media (max-width:680px){.admc-sidebar{width:220px;min-width:220px}}
@media (max-width:500px){.admc-sidebar{display:none}}
`;

const DeleteModal = ({ onDeleteForMe, onDeleteForAll, onCancel }) => (
  <div className="admc-overlay" onClick={onCancel}>
    <div className="admc-modal" onClick={e => e.stopPropagation()}>
      <div className="admc-modal-icon red">
        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
      </div>
      <div className="admc-modal-title">Delete this message?</div>
      <div className="admc-modal-sub">Choose who to delete this message for.</div>
      <div className="admc-modal-btns">
        <button className="admc-modal-btn for-all" onClick={onDeleteForAll}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20M12 2a14.5 14.5 0 010 20M2 12h20"/></svg>
          Delete for everyone
        </button>
        <button className="admc-modal-btn for-me" onClick={onDeleteForMe}>
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Delete for me only
        </button>
        <button className="admc-modal-btn cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  </div>
);

const ThemePanel = ({ current, onSelect, onClose }) => {
  const themeColors = {
    default: ['#f5f7fa','#7c6bff'], dark: ['#0f1117','#7c6bff'],
    ocean: ['#e8f4fd','#0284c7'], forest: ['#f0fdf4','#16a34a'],
    rose: ['#fff1f2','#e11d48'], sunset: ['#fff7ed','#ea580c'],
    midnight: ['#1e1b4b','#6366f1'], mint: ['#f0fdf9','#0d9488'],
  };
  return (
    <div className="admc-theme-panel" onClick={e => e.stopPropagation()}>
      <div className="admc-theme-title">Chat Theme</div>
      <div className="admc-theme-grid">
        {THEMES.map(t => (
          <div key={t.id}>
            <div
              className={`admc-theme-swatch ${current === t.id ? 'active' : ''}`}
              style={{ background: `linear-gradient(135deg, ${themeColors[t.id][0]} 50%, ${themeColors[t.id][1]} 50%)` }}
              onClick={() => { onSelect(t.id); onClose(); }}
            />
            <div className="admc-theme-label">{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MessageBubble = ({ msg, isMe, userEmail, userPhoto, myId, theme, onReact, onDeleteForMe, onDeleteForAll, onEdit }) => {
  const [hovered, setHovered] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiPos, setEmojiPos] = useState({ top: 0, left: 0 });
  const [delModal, setDelModal] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const hoverTimer = useRef(null);
  const emojiBtnRef = useRef(null);
  const inEmojiPanel = useRef(false);

  const deleted = !!msg.deleted_at;
  const grouped = groupReactions(msg.reactions);
  const hasReact = Object.keys(grouped).length > 0;
  const pal = hashColor(userEmail);
  const attachments = msg.attachments || [];

  const clearHoverTimer = () => clearTimeout(hoverTimer.current);
  const startLeaveTimer = () => {
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => {
      if (!inEmojiPanel.current) {
        setHovered(false);
        setShowEmoji(false);
      }
    }, 280);
  };

  const openEmoji = (e) => {
    e.stopPropagation();
    if (emojiBtnRef.current) {
      const rect = emojiBtnRef.current.getBoundingClientRect();
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - 320));
      setEmojiPos({ top: rect.top - 56, left });
    }
    setShowEmoji(p => !p);
  };

  const getDeletedText = () => {
    if (msg.deleted_for === 'all') return '🚫 This message was deleted';
    if (isMe) return '🚫 You deleted this message';
    return msg.message;
  };

  const showDeletedStyle = deleted && (msg.deleted_for === 'all' || isMe);
  const bubbleColor = theme?.bubble || '#7c6bff';

  return (
    <>
      {delModal && (
        <DeleteModal
          onCancel={() => setDelModal(false)}
          onDeleteForMe={() => { setDelModal(false); onDeleteForMe(msg.id); }}
          onDeleteForAll={() => { setDelModal(false); onDeleteForAll(msg.id); }}
        />
      )}
      {lightbox && (
        <div className="admc-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="preview" />
        </div>
      )}

      {showEmoji && (
        <div className="admc-emoji-sub" style={{ top: emojiPos.top, left: emojiPos.left }}
          onMouseEnter={() => { inEmojiPanel.current = true; clearHoverTimer(); }}
          onMouseLeave={() => { inEmojiPanel.current = false; startLeaveTimer(); }}>
          {EMOJI_LIST.slice(0, 8).map(em => (
            <button key={em} className="admc-emoji-btn"
              onClick={() => { onReact(msg.id, em); setShowEmoji(false); inEmojiPanel.current = false; }}>
              {em}
            </button>
          ))}
        </div>
      )}

      <div className="admc-msg-group"
        onMouseEnter={() => { clearHoverTimer(); setHovered(true); }}
        onMouseLeave={startLeaveTimer}>
        <div className={`admc-msg-row ${isMe ? 'me' : ''}`}>
          {isMe
            ? <div className="admc-msg-av-spacer" />
            : (
              <div className="admc-msg-av" style={{ width: 28, height: 28, fontSize: 9.5, background: pal.bg, color: pal.color, borderColor: pal.border }}>
                {userPhoto
                  ? <img src={`http://localhost:5000${userPhoto}`} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                  : initials(userEmail)
                }
              </div>
            )
          }

          <div className="admc-bubble-wrap">
            {!deleted && hovered && (
              <div className={`admc-action-bar ${isMe ? 'me' : 'them'}`}
                onMouseEnter={clearHoverTimer}
                onMouseLeave={startLeaveTimer}>
                <button ref={emojiBtnRef} className="admc-act-btn" onClick={openEmoji}>😊 React</button>
                {isMe && (
                  <>
                    <div className="admc-act-sep" />
                    <button className="admc-act-btn" onClick={() => onEdit(msg)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:12,height:12 }}>
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                  </>
                )}
                <div className="admc-act-sep" />
                <button className="admc-act-btn danger" onClick={() => setDelModal(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:12,height:12 }}>
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                  Delete
                </button>
              </div>
            )}

            <div className={`admc-bubble ${showDeletedStyle ? 'deleted' : isMe ? 'me' : 'them'}`}
              style={isMe && !showDeletedStyle ? { background: bubbleColor, color: theme?.bubbleText || '#fff', borderRadius: '16px 3px 16px 16px', boxShadow: `0 2px 8px ${bubbleColor}55` } : {}}>
              {!showDeletedStyle && attachments.map((f, fi) =>
                isImage(f.name) ? (
                  <img key={fi} className="admc-img-thumb" src={`http://localhost:5000${f.url}`} alt={f.name}
                    onClick={() => setLightbox(`http://localhost:5000${f.url}`)} />
                ) : (
                  <a key={fi} className={`admc-file-attach ${isMe ? 'me-file' : 'them-file'}`}
                    href={`http://localhost:5000${f.url}`} download={f.name} target="_blank" rel="noreferrer">
                    <div className="admc-file-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke={isMe ? '#fff' : bubbleColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:16,height:16 }}>
                        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                    </div>
                    <div>
                      <div className="admc-file-name">{f.name}</div>
                      <div className="admc-file-size">{fmtSize(f.size)}</div>
                    </div>
                  </a>
                )
              )}

              {deleted ? getDeletedText() : msg.message}

              <div className="admc-bubble-foot" style={isMe && !showDeletedStyle ? { color:'rgba(255,255,255,.55)', justifyContent:'flex-end' } : {}}>
                <span>{fmtTime(msg.created_at)}</span>
                {!showDeletedStyle && msg.edited_at && <span className="admc-edited-lbl">· edited</span>}
                {!showDeletedStyle && isMe && (
                  <svg viewBox="0 0 24 24" style={{ width:13,height:13,fill:'none',stroke:'currentColor',strokeWidth:2.5,strokeLinecap:'round',strokeLinejoin:'round',flexShrink:0 }}>
                    {msg.is_read ? <><polyline points="18 6 9 17 4 12"/><polyline points="23 6 12 17"/></> : <polyline points="20 6 9 17 4 12"/>}
                  </svg>
                )}
              </div>
            </div>

            {hasReact && !showDeletedStyle && (
              <div className="admc-reactions" style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                {Object.entries(grouped).map(([emoji, uids]) => (
                  <button key={emoji}
                    className={`admc-rpill ${uids.includes(String(myId)) ? 'mine' : ''}`}
                    onClick={() => onReact(msg.id, emoji)}>
                    {emoji}<span className="admc-rpill-count">{uids.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isMe && <div className="admc-msg-av-spacer" />}
        </div>
      </div>
    </>
  );
};

const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [myId, setMyId] = useState(null);
  const [search, setSearch] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingMsg, setEditingMsg] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [themeId, setThemeId] = useState(() => localStorage.getItem('admc_theme') || 'default');
  const [showTheme, setShowTheme] = useState(false);
  const [activeRTCCall, setActiveRTCCall] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);
  const callPollRef = useRef(null);
  const mutatingRef = useRef(false);
  const selectedUserRef = useRef(null);
  const themeRef = useRef(null);
  const seenCallIds = useRef(new Set());

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  const tkn = () => localStorage.getItem('token');
  const auth = () => ({ Authorization: `Bearer ${tkn()}` });

  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  useEffect(() => {
    const id = 'admc-styles';
    if (!document.getElementById(id)) {
      const el = document.createElement('style'); el.id = id; el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  useEffect(() => {
    try {
      const p = JSON.parse(atob(tkn().split('.')[1]));
      setMyId(String(p.id || p.userId || p.sub || ''));
    } catch {}
  }, []);

  useEffect(() => { localStorage.setItem('admc_theme', themeId); }, [themeId]);

  useEffect(() => {
    const h = e => { if (themeRef.current && !themeRef.current.contains(e.target)) setShowTheme(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  useEffect(() => {
    const h = e => {
      if (!e.target.closest('.admc-emoji-panel') && !e.target.closest('[data-emoji-toggle]'))
        setEmojiOpen(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(t);
  }, [alert]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const showAlert = (type, text) => setAlert({ type, text });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/admin/users`, { headers: auth() });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch {}
  }, []);

  const fetchMessagesRaw = useCallback(async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/chat/admin/${userId}`, { headers: auth() });
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch {}
  }, []);

  const fetchMessagesPoll = useCallback(async (userId) => {
    if (mutatingRef.current) return;
    await fetchMessagesRaw(userId);
  }, [fetchMessagesRaw]);

  useEffect(() => {
    const pollCalls = async () => {
      if (activeRTCCall) return;
      try {
        const res = await fetch(`${API_BASE}/chat/admin/calls/pending`, { headers: auth() });
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
              peerEmail: data.call.email || 'Employee',
            });
          }
        }
      } catch {}
    };
    callPollRef.current = setInterval(pollCalls, 3000);
    return () => clearInterval(callPollRef.current);
  }, [activeRTCCall]);

  const initiateCall = async (type) => {
    if (!selectedUser) {
      showAlert('err', 'Please select an employee first.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/chat/admin/calls/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({ receiver_id: String(selectedUser), type }),
      });
      const data = await res.json();
      if (data.success && data.callId) {
        seenCallIds.current.add(data.callId);
        setActiveRTCCall({
          callId: data.callId,
          type,
          mode: 'caller',
          peerEmail: selectedUserData?.email || 'Employee',
        });
      } else {
        showAlert('err', data.message || 'Could not initiate call.');
      }
    } catch {
      showAlert('err', 'Network error.');
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    if (!selectedUser) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    if (editingMsg) {
      const msgId = editingMsg.id;
      setEditingMsg(null);
      mutatingRef.current = true;
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, message: text, edited_at: new Date().toISOString() } : m));
      try {
        const res = await fetch(`${API_BASE}/chat/admin/${msgId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', ...auth() },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        if (!data.success) showAlert('err', data.message || 'Edit failed');
        else showAlert('ok', 'Message edited.');
      } catch { showAlert('err', 'Network error.'); }
      finally {
        mutatingRef.current = false;
        await fetchMessagesRaw(selectedUser);
      }
      return;
    }

    const toUpload = [...attachments];
    setAttachments([]);
    try {
      const fd = new FormData();
      fd.append('receiver_id', selectedUser);
      if (text) fd.append('message', text);
      toUpload.forEach(a => fd.append('files', a.file));
      const res = await fetch(`${API_BASE}/chat/admin/send`, { method: 'POST', headers: auth(), body: fd });
      const data = await res.json();
      if (!data.success) { showAlert('err', data.message || 'Send failed'); return; }
      await fetchMessagesRaw(selectedUser);
      fetchUsers();
    } catch { showAlert('err', 'Network error.'); }
  };

  const deleteForMe = async (msgId) => {
    mutatingRef.current = true;
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deleted_at: new Date().toISOString(), deleted_for: 'me' } : m));
    try { await fetch(`${API_BASE}/chat/admin/${msgId}/delete-for-me`, { method: 'POST', headers: auth() }); } catch {}
    finally {
      mutatingRef.current = false;
      await fetchMessagesRaw(selectedUser);
    }
  };

  const deleteForAll = async (msgId) => {
    mutatingRef.current = true;
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deleted_at: new Date().toISOString(), deleted_for: 'all' } : m));
    try { await fetch(`${API_BASE}/chat/admin/${msgId}`, { method: 'DELETE', headers: auth() }); } catch {}
    finally {
      mutatingRef.current = false;
      await fetchMessagesRaw(selectedUser);
    }
  };

  const reactToMessage = async (msgId, emoji) => {
    mutatingRef.current = true;
    try {
      const res = await fetch(`${API_BASE}/chat/admin/${msgId}/react`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...auth() },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      if (data.success) setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: data.reactions } : m));
    } catch {}
    finally {
      mutatingRef.current = false;
      await fetchMessagesRaw(selectedUser);
    }
  };

  const startEdit = (msg) => {
    setEditingMsg({ id: msg.id });
    setInput(msg.message || '');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };
  const cancelEdit = () => {
    setEditingMsg(null);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const selectUser = (userId) => {
    setSelectedUser(userId);
    setMessages([]);
    setEditingMsg(null);
    setInput('');
    setAttachments([]);
    setLoading(true);
    fetchMessagesRaw(userId).finally(() => setLoading(false));
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      const uid = selectedUserRef.current;
      if (uid) fetchMessagesPoll(uid);
    }, 5000);
  };

  useEffect(() => {
    fetchUsers();
    const t = setInterval(fetchUsers, 8000);
    return () => { clearInterval(t); if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchUsers]);

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape' && editingMsg) cancelEdit();
  };
  const autoResize = el => { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; };
  const handleFileChange = e => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files.map(f => ({ file:f, name:f.name, size:f.size, previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null }))]);
    e.target.value = '';
  };

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()));
  const selectedUserData = users.find(u => u.id === selectedUser);
  const canSend = !!(input.trim() || attachments.length > 0);

  const buildList = () => {
    const out = [];
    let lastDay = null;
    for (const m of messages) {
      const day = fmtDaySep(m.created_at);
      if (day !== lastDay) {
        out.push({ type:'day', label:day, key:`d-${day}` });
        lastDay = day;
      }
      out.push({ type:'msg', msg:m, key:m.id });
    }
    return out;
  };

  return (
    <div className="admc-root" style={{ background: theme.bg }}>

      {activeRTCCall && (
        <WebRTCCall
          mode={activeRTCCall.mode}
          callId={activeRTCCall.callId}
          callType={activeRTCCall.type}
          token={localStorage.getItem('token')}
          apiBase="http://localhost:5000/api"
          myRole="admin"
          peerEmail={activeRTCCall.peerEmail}
          onEnd={() => setActiveRTCCall(null)}
        />
      )}

      <div className="admc-sidebar" style={{ background: theme.sidebar }}>
        <div className="admc-sidebar-top" style={{ background: theme.sidebar }}>
          <div className="admc-sidebar-title">Messages</div>
          <div className="admc-live"><div className="admc-live-dot" /><span className="admc-live-txt">LIVE</span></div>
        </div>
        <div className="admc-search-wrap" style={{ background: theme.sidebar }}>
          <input className="admc-search" placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admc-user-list">
          {filteredUsers.length === 0 && (
            <div style={{ padding:'24px 12px', color:'#9198b2', fontSize:12, textAlign:'center' }}>No conversations found.</div>
          )}
          {filteredUsers.map(u => (
            <div key={u.id} className={`admc-user-item ${selectedUser === u.id ? 'active' : ''}`} onClick={() => selectUser(u.id)}>
              <Avatar email={u.email} size={38} online={!!u.online} photoUrl={u.photo_url || null} />
              <div className="admc-user-info">
                <div className="admc-user-name">{u.email}</div>
                {u.last_message && <div className="admc-user-preview">{u.last_message}</div>}
              </div>
              <div className="admc-user-right">
                {u.last_message_at && <div className="admc-user-time">{fmtTime(u.last_message_at)}</div>}
                {u.unread_count > 0 && <div className="admc-badge">{u.unread_count}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admc-main">
        <div className="admc-header" style={{ background: theme.header }}>
          {selectedUserData ? (
            <>
              <Avatar email={selectedUserData.email} size={36} online={!!selectedUserData.online} photoUrl={selectedUserData.photo_url || null} />
              <div className="admc-header-info">
                <div className="admc-header-name">{selectedUserData.email}</div>
                <div className={`admc-header-status ${selectedUserData.online ? 'online' : 'offline'}`}>
                  <div className="admc-status-dot" />
                  {selectedUserData.online ? 'Online' : 'Offline'}
                </div>
              </div>
              <button className="admc-hdr-btn" title="Voice call" onClick={() => initiateCall('voice')}>
                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 011 1.24 2 2 0 013 .06h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
              </button>
              <button className="admc-hdr-btn" title="Video call" onClick={() => initiateCall('video')}>
                <svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </button>
              <div style={{ position:'relative' }} ref={themeRef}>
                <button className="admc-hdr-btn" title="Change theme" onClick={e => { e.stopPropagation(); setShowTheme(p => !p); }}>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                </button>
                {showTheme && <ThemePanel current={themeId} onSelect={setThemeId} onClose={() => setShowTheme(false)} />}
              </div>
            </>
          ) : (
            <>
              <span style={{ color:'#9198b2', fontSize:13, flex:1, textAlign:'center' }}>Select an employee to begin</span>
              <div style={{ position:'relative' }} ref={themeRef}>
                <button className="admc-hdr-btn" title="Change theme" onClick={e => { e.stopPropagation(); setShowTheme(p => !p); }}>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                </button>
                {showTheme && <ThemePanel current={themeId} onSelect={setThemeId} onClose={() => setShowTheme(false)} />}
              </div>
            </>
          )}
        </div>

        {alert && (
          <div className={`admc-alert ${alert.type === 'err' ? 'admc-alert-err' : 'admc-alert-ok'}`}>
            <span>{alert.text}</span>
            <button className="admc-alert-close" onClick={() => setAlert(null)}>×</button>
          </div>
        )}

        {!selectedUser ? (
          <div className="admc-no-conv">
            <div className="admc-no-conv-ring">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9198b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:26,height:26 }}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <div style={{ fontSize:14, fontWeight:600, color:'#4a5068' }}>No conversation selected</div>
            <div style={{ fontSize:12, color:'#9198b2' }}>Choose an employee from the sidebar</div>
          </div>
        ) : (
          <div className="admc-messages">
            {loading && <div style={{ textAlign:'center', color:'#9198b2', fontSize:12, padding:24 }}>Loading…</div>}
            {!loading && messages.length === 0 && (
              <div className="admc-no-conv" style={{ flex:'none', paddingTop:60 }}>
                <div className="admc-no-conv-ring">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9198b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:26,height:26 }}>
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <div style={{ fontSize:13, color:'#4a5068' }}>No messages yet</div>
                <div style={{ fontSize:12, color:'#9198b2' }}>Say hello 👋</div>
              </div>
            )}
            {buildList().map(item =>
              item.type === 'day' ? (
                <div key={item.key} className="admc-day-sep">
                  <div className="admc-day-line" /><div className="admc-day-lbl">{item.label}</div><div className="admc-day-line" />
                </div>
              ) : (
                <MessageBubble
                  key={item.key}
                  msg={item.msg}
                  isMe={myId && String(item.msg.sender_id) === String(myId)}
                  userEmail={selectedUserData?.email || ''}
                  userPhoto={selectedUserData?.photo_url || null}
                  myId={myId}
                  theme={theme}
                  onReact={reactToMessage}
                  onDeleteForMe={deleteForMe}
                  onDeleteForAll={deleteForAll}
                  onEdit={startEdit}
                />
              )
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {attachments.length > 0 && (
          <div className="admc-attach-previews">
            {attachments.map((a, i) => (
              <div key={i} className="admc-attach-chip">
                {a.previewUrl
                  ? <img src={a.previewUrl} alt="" style={{ width:20, height:20, borderRadius:4, objectFit:'cover', flexShrink:0 }} />
                  : <svg viewBox="0 0 24 24" fill="none" stroke="#7c6bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:14, height:14, flexShrink:0 }}>
                      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                      <polyline points="13 2 13 9 20 9"/>
                    </svg>
                }
                <span>{a.name}</span>
                <button className="admc-attach-remove" onClick={() => setAttachments(prev => prev.filter((_,idx) => idx !== i))}>×</button>
              </div>
            ))}
          </div>
        )}

        {editingMsg && (
          <div className="admc-edit-banner">
            <span>✏️ Editing message</span>
            <button className="admc-edit-cancel" onClick={cancelEdit}>✕ Cancel (Esc)</button>
          </div>
        )}

        {selectedUser && (
          <div className="admc-input-area" style={{ background: theme.header }}>
            <input ref={fileInputRef} type="file" multiple style={{ display:'none' }} onChange={handleFileChange} />
            <div className={`admc-input-wrap ${editingMsg ? 'editing' : ''}`}>
              <textarea ref={textareaRef} className="admc-textarea"
                placeholder={editingMsg ? 'Edit your message…' : 'Type a message…'}
                value={input} rows={1}
                onChange={e => { setInput(e.target.value); autoResize(e.target); }}
                onKeyDown={handleKey} />
              <button className="admc-icon-btn" title="Attach file" onClick={() => fileInputRef.current?.click()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:16,height:16 }}>
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              <button className="admc-icon-btn" data-emoji-toggle="1" title="Emoji" onClick={e => { e.stopPropagation(); setEmojiOpen(p => !p); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:16,height:16 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </button>
            </div>

            <button className="admc-send-btn" disabled={!canSend} onClick={sendMessage}
              title={editingMsg ? 'Save edit' : 'Send'}
              style={{ background: canSend ? theme.bubble : '#e4e7ef' }}>
              {editingMsg
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:15,height:15 }}><polyline points="20 6 9 17 4 12"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:15,height:15 }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              }
            </button>

            {emojiOpen && (
              <div className="admc-emoji-panel" onClick={e => e.stopPropagation()}>
                {EMOJI_LIST.map(em => (
                  <button key={em} className="admc-ep-btn"
                    onClick={() => { setInput(p => p + em); setEmojiOpen(false); textareaRef.current?.focus(); }}>
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