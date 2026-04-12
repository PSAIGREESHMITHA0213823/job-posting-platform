// import React, { useState, useEffect } from 'react';
// import { Outlet, NavLink, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard, Building2, Users, CreditCard,
//   Package, TrendingUp, Settings, LogOut, Menu, X, UserCircle,
//   MessageSquare, MessageCircle,
// } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// const BASE_URL = 'http://localhost:5000';

// function toDisplayUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http')) return url;
//   return `${BASE_URL}${url}`;
// }

// const nav = [
//   { to: '/admin/dashboard',     label: 'Dashboard',  icon: LayoutDashboard },
//   { to: '/admin/companies',     label: 'Companies',  icon: Building2       },
//   { to: '/admin/users',         label: 'Users',      icon: Users           },
//   { to: '/admin/payments',      label: 'Payments',   icon: CreditCard      },
//   { to: '/admin/subscriptions', label: 'Plans',      icon: Package         },
//   { to: '/admin/revenue',       label: 'Revenue',    icon: TrendingUp      },
//   { to: '/admin/chat',          label: 'Chat',       icon: MessageCircle   },
//   { to: '/admin/settings',      label: 'Settings',   icon: Settings        },
//   { to: '/admin/profile',       label: 'My Profile', icon: UserCircle      },
// ];

// /* ─── Design tokens (hardcoded — no CSS variable dependency) ── */

// // SIDEBAR: dark
// const SB = {
//   bg:       '#0a0a0f',
//   bg1:      '#111118',
//   bg2:      '#18181f',
//   border:   '#1e1e28',
//   border2:  '#2a2a38',
//   text:     '#f0f0f8',
//   text2:    '#8888a8',
//   text3:    '#44445a',
//   accent:   '#7c6bff',
// };

// // MAIN AREA: light
// const MN = {
//   bg:       '#f5f7fa',
//   bg1:      '#ffffff',
//   bg2:      '#f0f2f7',
//   border:   '#e4e7ef',
//   border2:  '#c9cedc',
//   text:     '#0d0f1a',
//   text2:    '#4a5068',
//   text3:    '#9198b2',
//   accent:   '#7c6bff',
//   amber:    '#d97706',
//   amberBg:  '#fffbeb',
// };

// export default function AdminLayout() {
//   const navigate         = useNavigate();
//   const { user, logout } = useAuth();

//   const [open,         setOpen]         = useState(true);
//   const [mobile,       setMobile]       = useState(false);
//   const [waitingCount, setWaitingCount] = useState(0);

//   useEffect(() => {
//     const check = () => {
//       const isMob = window.innerWidth < 768;
//       setMobile(isMob);
//       setOpen(!isMob);
//     };
//     check();
//     window.addEventListener('resize', check);
//     return () => window.removeEventListener('resize', check);
//   }, []);

//   useEffect(() => {
//     const fetchWaiting = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res   = await fetch(
//           `${BASE_URL}/api/admin/chat-sessions?status=waiting_admin`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const data = await res.json();
//         if (data.success) setWaitingCount(data.sessions.length);
//       } catch { /* silently ignore */ }
//     };
//     fetchWaiting();
//     const interval = setInterval(fetchWaiting, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

//   const displayName = user?.full_name || 'Superadmin';
//   const avatarUrl   = toDisplayUrl(user?.avatar_url);
//   const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'SA';
//   const sidebarW    = open ? 240 : 68;

//   return (
//     <div style={{
//       display: 'flex',
//       minHeight: '100vh',
//       background: MN.bg,
//       fontFamily: "'Inter', system-ui, sans-serif",
//     }}>

//       {/* ── Mobile overlay ── */}
//       {mobile && open && (
//         <div
//           onClick={() => setOpen(false)}
//           style={{
//             position: 'fixed', inset: 0,
//             background: 'rgba(10,10,15,.6)',
//             zIndex: 99,
//             backdropFilter: 'blur(3px)',
//           }}
//         />
//       )}

//       {/* ════════════════════════════════════════════
//           SIDEBAR  —  DARK
//           ════════════════════════════════════════════ */}
//       <aside style={{
//         width: sidebarW,
//         minWidth: sidebarW,
//         background: SB.bg,
//         borderRight: `1px solid ${SB.border2}`,
//         display: 'flex',
//         flexDirection: 'column',
//         position: 'fixed',
//         top: 0, bottom: 0, left: 0,
//         zIndex: 100,
//         transition: 'width .22s ease',
//         overflow: 'hidden',
//         boxShadow: '2px 0 16px rgba(0,0,0,.18)',
//         ...(mobile && !open ? { transform: 'translateX(-100%)', width: 240 } : {}),
//         ...(mobile &&  open ? { width: 240 } : {}),
//       }}>

//         {/* ── Logo row ── */}
//         <div style={{
//           height: 58,
//           display: 'flex', alignItems: 'center',
//           borderBottom: `1px solid ${SB.border2}`,
//           padding: '0 16px', gap: 10, flexShrink: 0,
//           background: SB.bg1,
//         }}>
//           <div style={{
//             width: 28, height: 28,
//             background: SB.accent,
//             borderRadius: 6,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             flexShrink: 0,
//             boxShadow: '0 2px 8px rgba(124,107,255,.4)',
//           }}>
//             <Package size={15} color="#fff" />
//           </div>

//           {(open || mobile) && (
//             <span style={{
//               fontFamily: "'JetBrains Mono', monospace",
//               fontSize: 14, fontWeight: 600,
//               color: SB.text, whiteSpace: 'nowrap',
//             }}>
//               admin<span style={{ color: SB.accent }}>core</span>
//             </span>
//           )}

//           {(open || mobile) && (
//             <button
//               onClick={() => setOpen(false)}
//               style={{
//                 marginLeft: 'auto', background: 'none', border: 'none',
//                 color: SB.text3, cursor: 'pointer', padding: 4,
//                 display: 'flex', borderRadius: 5, transition: 'color .15s',
//               }}
//               onMouseEnter={e => e.currentTarget.style.color = SB.text2}
//               onMouseLeave={e => e.currentTarget.style.color = SB.text3}
//             >
//               <X size={16} />
//             </button>
//           )}
//         </div>

//         {/* ── Admin card (expanded) ── */}
//         {(open || mobile) && (
//           <div
//             onClick={() => { navigate('/admin/profile'); if (mobile) setOpen(false); }}
//             style={{
//               margin: '12px 10px 4px',
//               padding: '10px 12px',
//               borderRadius: 9,
//               background: 'rgba(124,107,255,.08)',
//               border: '1px solid rgba(124,107,255,.18)',
//               display: 'flex', alignItems: 'center', gap: 10,
//               cursor: 'pointer', transition: 'background .15s',
//             }}
//             onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,107,255,.15)'}
//             onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,107,255,.08)'}
//           >
//             <div style={{
//               width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
//               background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c6bff, #a78bfa)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden',
//               boxShadow: '0 2px 8px rgba(124,107,255,.3)',
//             }}>
//               {avatarUrl
//                 ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                 : initials}
//             </div>
//             <div style={{ minWidth: 0 }}>
//               <div style={{
//                 fontSize: 12.5, fontWeight: 600, color: SB.text,
//                 whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
//               }}>
//                 {displayName}
//               </div>
//               <div style={{
//                 fontSize: 10.5, color: SB.accent,
//                 fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
//                 letterSpacing: '.6px',
//               }}>
//                 SUPERADMIN
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Admin avatar (collapsed) ── */}
//         {!open && !mobile && (
//           <div
//             onClick={() => navigate('/admin/profile')}
//             style={{
//               margin: '12px auto 4px',
//               width: 36, height: 36, borderRadius: '50%',
//               background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c6bff, #a78bfa)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden',
//               cursor: 'pointer',
//               border: '2px solid rgba(124,107,255,.35)',
//               boxShadow: '0 2px 8px rgba(124,107,255,.25)',
//             }}
//           >
//             {avatarUrl
//               ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//               : initials}
//           </div>
//         )}

//         {/* ── Nav section label ── */}
//         <div style={{
//           fontSize: 9.5, fontWeight: 700, color: SB.text3,
//           textTransform: 'uppercase', letterSpacing: '1.4px',
//           fontFamily: "'JetBrains Mono', monospace",
//           padding: '14px 18px 5px',
//         }}>
//           {(open || mobile) ? 'Navigation' : ''}
//         </div>

//         {/* ── Nav links ── */}
//         <nav style={{ flex: 1, padding: '2px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
//           {nav.map(({ to, label, icon: Icon }) => (
//             <NavLink
//               key={to}
//               to={to}
//               onClick={() => mobile && setOpen(false)}
//               style={({ isActive }) => ({
//                 display: 'flex', alignItems: 'center', gap: 10,
//                 padding: '9px 10px', marginBottom: 2, borderRadius: 8,
//                 textDecoration: 'none',
//                 color:      isActive ? SB.accent : SB.text2,
//                 background: isActive ? 'rgba(124,107,255,.12)' : 'transparent',
//                 fontSize: 13, fontWeight: isActive ? 600 : 400,
//                 transition: 'all .15s', whiteSpace: 'nowrap',
//                 position: 'relative',
//                 borderLeft: isActive ? `2px solid ${SB.accent}` : '2px solid transparent',
//               })}
//               onMouseEnter={e => {
//                 if (e.currentTarget.style.borderLeftColor !== SB.accent) {
//                   e.currentTarget.style.background = `rgba(255,255,255,.05)`;
//                   e.currentTarget.style.color = SB.text;
//                 }
//               }}
//               onMouseLeave={e => {
//                 if (e.currentTarget.style.borderLeftColor !== SB.accent) {
//                   e.currentTarget.style.background = 'transparent';
//                   e.currentTarget.style.color = SB.text2;
//                 }
//               }}
//             >
//               <Icon size={16} style={{ flexShrink: 0 }} />
//               {(open || mobile) && label}

//               {/* Chat badge — expanded */}
//               {label === 'Chat' && waitingCount > 0 && (open || mobile) && (
//                 <span style={{
//                   marginLeft: 'auto',
//                   background: '#ef4444', color: '#fff',
//                   fontSize: 10, fontWeight: 700,
//                   padding: '1px 6px', borderRadius: 10,
//                   minWidth: 18, textAlign: 'center',
//                 }}>
//                   {waitingCount}
//                 </span>
//               )}

//               {/* Chat dot — collapsed */}
//               {label === 'Chat' && waitingCount > 0 && !open && !mobile && (
//                 <span style={{
//                   position: 'absolute', top: 7, right: 7,
//                   width: 7, height: 7, borderRadius: '50%',
//                   background: '#ef4444',
//                   boxShadow: '0 0 0 2px #0a0a0f',
//                 }} />
//               )}
//             </NavLink>
//           ))}
//         </nav>

//         {/* ── Sign Out ── */}
//         <div style={{ padding: '10px 8px', borderTop: `1px solid ${SB.border2}` }}>
//           <button
//             onClick={handleLogout}
//             style={{
//               display: 'flex', alignItems: 'center', gap: 10,
//               padding: '9px 10px', width: '100%',
//               background: 'none', border: 'none',
//               color: '#ef4444', cursor: 'pointer',
//               borderRadius: 8, fontSize: 13, fontWeight: 500,
//               transition: 'background .15s', whiteSpace: 'nowrap',
//               fontFamily: 'inherit',
//             }}
//             onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.1)'}
//             onMouseLeave={e => e.currentTarget.style.background = 'none'}
//           >
//             <LogOut size={16} style={{ flexShrink: 0 }} />
//             {(open || mobile) && 'Sign Out'}
//           </button>
//         </div>
//       </aside>

//       {/* ════════════════════════════════════════════
//           MAIN CONTENT  —  LIGHT
//           ════════════════════════════════════════════ */}
//       <div style={{
//         flex: 1,
//         marginLeft: mobile ? 0 : sidebarW,
//         transition: 'margin-left .22s ease',
//         display: 'flex',
//         flexDirection: 'column',
//         minHeight: '100vh',
//         background: MN.bg,
//       }}>

//         {/* ── Top Header ── */}
//         <header style={{
//           height: 56,
//           background: MN.bg1,
//           borderBottom: `1px solid ${MN.border}`,
//           display: 'flex', alignItems: 'center', gap: 14,
//           padding: '0 22px',
//           position: 'sticky', top: 0, zIndex: 50,
//           flexShrink: 0,
//           boxShadow: '0 1px 4px rgba(0,0,0,.05)',
//         }}>

//           {/* Hamburger */}
//           <button
//             onClick={() => setOpen(o => !o)}
//             style={{
//               background: 'none', border: 'none',
//               color: MN.text3, cursor: 'pointer',
//               padding: 6, display: 'flex', borderRadius: 7,
//               transition: 'background .15s, color .15s',
//             }}
//             onMouseEnter={e => { e.currentTarget.style.background = MN.bg2; e.currentTarget.style.color = MN.text2; }}
//             onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = MN.text3; }}
//           >
//             <Menu size={18} />
//           </button>

//           {/* Date */}
//           <span style={{
//             fontSize: 12, color: MN.text3,
//             fontFamily: "'JetBrains Mono', monospace",
//           }}>
//             {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
//           </span>

//           <div style={{ flex: 1 }} />

//           {/* Waiting chip */}
//           {waitingCount > 0 && (
//             <div
//               onClick={() => navigate('/admin/chat')}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 6,
//                 padding: '5px 13px', borderRadius: 20,
//                 background: MN.amberBg,
//                 border: '1px solid #fcd34d',
//                 cursor: 'pointer', transition: 'opacity .15s',
//               }}
//               onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
//               onMouseLeave={e => e.currentTarget.style.opacity = '1'}
//             >
//               <MessageSquare size={13} color={MN.amber} />
//               <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>
//                 {waitingCount} waiting
//               </span>
//             </div>
//           )}

//           {/* User chip */}
//           <div
//             onClick={() => navigate('/admin/profile')}
//             style={{
//               display: 'flex', alignItems: 'center', gap: 9,
//               padding: '5px 13px 5px 5px', borderRadius: 24,
//               background: MN.bg2,
//               border: `1px solid ${MN.border}`,
//               cursor: 'pointer',
//               transition: 'border-color .15s, box-shadow .15s',
//             }}
//             onMouseEnter={e => {
//               e.currentTarget.style.borderColor = 'rgba(124,107,255,.4)';
//               e.currentTarget.style.boxShadow   = '0 2px 10px rgba(124,107,255,.1)';
//             }}
//             onMouseLeave={e => {
//               e.currentTarget.style.borderColor = MN.border;
//               e.currentTarget.style.boxShadow   = 'none';
//             }}
//           >
//             <div style={{
//               width: 28, height: 28, borderRadius: '50%',
//               background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c6bff, #a78bfa)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: 11, fontWeight: 700, color: '#fff',
//               flexShrink: 0, overflow: 'hidden',
//             }}>
//               {avatarUrl
//                 ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                 : initials}
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
//               <span style={{
//                 fontSize: 12.5, fontWeight: 600, color: MN.text,
//                 whiteSpace: 'nowrap', maxWidth: 130,
//                 overflow: 'hidden', textOverflow: 'ellipsis',
//               }}>
//                 {displayName}
//               </span>
//               <span style={{
//                 fontSize: 10, color: MN.accent,
//                 fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
//                 letterSpacing: '.5px',
//               }}>
//                 SUPERADMIN
//               </span>
//             </div>
//           </div>
//         </header>

//         {/* ── Page content ── */}
//         <main style={{
//           flex: 1,
//           overflow: 'auto',
//           background: MN.bg,
//         }}>
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CreditCard,
  Package, TrendingUp, Settings, LogOut, Menu, X, UserCircle,
  MessageSquare, MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:5000';

function toDisplayUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
}

const nav = [
  { to: '/admin/dashboard',     label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/admin/companies',     label: 'Companies',  icon: Building2       },
  { to: '/admin/users',         label: 'Users',      icon: Users           },
  { to: '/admin/payments',      label: 'Payments',   icon: CreditCard      },
  { to: '/admin/subscriptions', label: 'Plans',      icon: Package         },
  { to: '/admin/revenue',       label: 'Revenue',    icon: TrendingUp      },
  { to: '/admin/chat',          label: 'Chat',       icon: MessageCircle   },
  { to: '/admin/settings',      label: 'Settings',   icon: Settings        },
  { to: '/admin/profile',       label: 'My Profile', icon: UserCircle      },
];

/* ─── Design tokens (hardcoded — no CSS variable dependency) ── */

// SIDEBAR: dark
const SB = {
  bg:       '#0a0a0f',
  bg1:      '#111118',
  bg2:      '#18181f',
  border:   '#1e1e28',
  border2:  '#2a2a38',
  text:     '#f0f0f8',
  text2:    '#8888a8',
  text3:    '#44445a',
  accent:   '#7c6bff',
};

// MAIN AREA: light
const MN = {
  bg:       '#f5f7fa',
  bg1:      '#ffffff',
  bg2:      '#f0f2f7',
  border:   '#e4e7ef',
  border2:  '#c9cedc',
  text:     '#0d0f1a',
  text2:    '#4a5068',
  text3:    '#9198b2',
  accent:   '#7c6bff',
  amber:    '#d97706',
  amberBg:  '#fffbeb',
};

export default function AdminLayout() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const [open,         setOpen]         = useState(true);
  const [mobile,       setMobile]       = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    const check = () => {
      const isMob = window.innerWidth < 768;
      setMobile(isMob);
      setOpen(!isMob);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const fetchWaiting = async () => {
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch(
          `${BASE_URL}/api/admin/chat-sessions?status=waiting_admin`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) setWaitingCount(data.sessions.length);
      } catch { /* silently ignore */ }
    };
    fetchWaiting();
    const interval = setInterval(fetchWaiting, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const displayName = user?.full_name || 'Superadmin';
  const avatarUrl   = toDisplayUrl(user?.avatar_url);
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'SA';
  const sidebarW    = open ? 240 : 68;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: MN.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Mobile overlay ── */}
      {mobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(10,10,15,.6)',
            zIndex: 99,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* ════════════════════════════════════════════
          SIDEBAR  —  DARK
          ════════════════════════════════════════════ */}
      <aside style={{
        width: sidebarW,
        minWidth: sidebarW,
        background: SB.bg,
        borderRight: `1px solid ${SB.border2}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        zIndex: 100,
        transition: 'width .22s ease',
        overflow: 'hidden',
        boxShadow: '2px 0 16px rgba(0,0,0,.18)',
        ...(mobile && !open ? { transform: 'translateX(-100%)', width: 240 } : {}),
        ...(mobile &&  open ? { width: 240 } : {}),
      }}>

        {/* ── Logo row ── */}
        <div style={{
          height: 58,
          display: 'flex', alignItems: 'center',
          borderBottom: `1px solid ${SB.border2}`,
          padding: '0 16px', gap: 10, flexShrink: 0,
          background: SB.bg1,
        }}>
          <div style={{
            width: 28, height: 28,
            background: SB.accent,
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(124,107,255,.4)',
          }}>
            <Package size={15} color="#fff" />
          </div>

          {(open || mobile) && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14, fontWeight: 600,
              color: SB.text, whiteSpace: 'nowrap',
            }}>
              admin<span style={{ color: SB.accent }}>core</span>
            </span>
          )}

          {(open || mobile) && (
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: SB.text3, cursor: 'pointer', padding: 4,
                display: 'flex', borderRadius: 5, transition: 'color .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = SB.text2}
              onMouseLeave={e => e.currentTarget.style.color = SB.text3}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Admin card (expanded) ── */}
        {(open || mobile) && (
          <div
            onClick={() => { navigate('/admin/profile'); if (mobile) setOpen(false); }}
            style={{
              margin: '12px 10px 4px',
              padding: '10px 12px',
              borderRadius: 9,
              background: 'rgba(124,107,255,.08)',
              border: '1px solid rgba(124,107,255,.18)',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,107,255,.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,107,255,.08)'}
          >
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c6bff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(124,107,255,.3)',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 600, color: SB.text,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {displayName}
              </div>
              <div style={{
                fontSize: 10.5, color: SB.accent,
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                letterSpacing: '.6px',
              }}>
                SUPERADMIN
              </div>
            </div>
          </div>
        )}

        {/* ── Admin avatar (collapsed) ── */}
        {!open && !mobile && (
          <div
            onClick={() => navigate('/admin/profile')}
            style={{
              margin: '12px auto 4px',
              width: 36, height: 36, borderRadius: '50%',
              background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c6bff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden',
              cursor: 'pointer',
              border: '2px solid rgba(124,107,255,.35)',
              boxShadow: '0 2px 8px rgba(124,107,255,.25)',
            }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
        )}

        {/* ── Nav section label ── */}
        <div style={{
          fontSize: 9.5, fontWeight: 700, color: SB.text3,
          textTransform: 'uppercase', letterSpacing: '1.4px',
          fontFamily: "'JetBrains Mono', monospace",
          padding: '14px 18px 5px',
        }}>
          {(open || mobile) ? 'Navigation' : ''}
        </div>

        {/* ── Nav links ── */}
        <nav style={{ flex: 1, padding: '2px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => mobile && setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', marginBottom: 2, borderRadius: 8,
                textDecoration: 'none',
                color:      isActive ? SB.accent : SB.text2,
                background: isActive ? 'rgba(124,107,255,.12)' : 'transparent',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                transition: 'all .15s', whiteSpace: 'nowrap',
                position: 'relative',
                borderLeft: isActive ? `2px solid ${SB.accent}` : '2px solid transparent',
              })}
              onMouseEnter={e => {
                if (e.currentTarget.style.borderLeftColor !== SB.accent) {
                  e.currentTarget.style.background = `rgba(255,255,255,.05)`;
                  e.currentTarget.style.color = SB.text;
                }
              }}
              onMouseLeave={e => {
                if (e.currentTarget.style.borderLeftColor !== SB.accent) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = SB.text2;
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {(open || mobile) && label}

              {/* Chat badge — expanded */}
              {label === 'Chat' && waitingCount > 0 && (open || mobile) && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#ef4444', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 10,
                  minWidth: 18, textAlign: 'center',
                }}>
                  {waitingCount}
                </span>
              )}

              {/* Chat dot — collapsed */}
              {label === 'Chat' && waitingCount > 0 && !open && !mobile && (
                <span style={{
                  position: 'absolute', top: 7, right: 7,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 0 2px #0a0a0f',
                }} />
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Sign Out ── */}
        <div style={{ padding: '10px 8px', borderTop: `1px solid ${SB.border2}` }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', width: '100%',
              background: 'none', border: 'none',
              color: '#ef4444', cursor: 'pointer',
              borderRadius: 8, fontSize: 13, fontWeight: 500,
              transition: 'background .15s', whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {(open || mobile) && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════
          MAIN CONTENT  —  LIGHT
          ════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        marginLeft: mobile ? 0 : sidebarW,
        transition: 'margin-left .22s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: MN.bg,
      }}>

        {/* ── Top Header ── */}
        <header style={{
          height: 56,
          background: MN.bg1,
          borderBottom: `1px solid ${MN.border}`,
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '0 22px',
          position: 'sticky', top: 0, zIndex: 50,
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,.05)',
        }}>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              background: 'none', border: 'none',
              color: MN.text3, cursor: 'pointer',
              padding: 6, display: 'flex', borderRadius: 7,
              transition: 'background .15s, color .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = MN.bg2; e.currentTarget.style.color = MN.text2; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = MN.text3; }}
          >
            <Menu size={18} />
          </button>

          {/* Date */}
          <span style={{
            fontSize: 12, color: MN.text3,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>

          <div style={{ flex: 1 }} />

          {/* Waiting chip */}
          {waitingCount > 0 && (
            <div
              onClick={() => navigate('/admin/chat')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 13px', borderRadius: 20,
                background: MN.amberBg,
                border: '1px solid #fcd34d',
                cursor: 'pointer', transition: 'opacity .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <MessageSquare size={13} color={MN.amber} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>
                {waitingCount} waiting
              </span>
            </div>
          )}

          {/* User chip */}
          <div
            onClick={() => navigate('/admin/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '5px 13px 5px 5px', borderRadius: 24,
              background: MN.bg2,
              border: `1px solid ${MN.border}`,
              cursor: 'pointer',
              transition: 'border-color .15s, box-shadow .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(124,107,255,.4)';
              e.currentTarget.style.boxShadow   = '0 2px 10px rgba(124,107,255,.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = MN.border;
              e.currentTarget.style.boxShadow   = 'none';
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c6bff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
              <span style={{
                fontSize: 12.5, fontWeight: 600, color: MN.text,
                whiteSpace: 'nowrap', maxWidth: 130,
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {displayName}
              </span>
              <span style={{
                fontSize: 10, color: MN.accent,
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                letterSpacing: '.5px',
              }}>
                SUPERADMIN
              </span>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          background: MN.bg,
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}