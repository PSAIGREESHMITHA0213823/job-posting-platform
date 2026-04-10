
// // import React, { useState, useEffect } from 'react';
// // import { Outlet, NavLink, useNavigate } from 'react-router-dom';
// // import {
// //   LayoutDashboard, Building2, Users, CreditCard,
// //   Package, TrendingUp, Settings, LogOut, Menu, X, UserCircle
// // } from 'lucide-react';
// // import { useAuth } from '../context/AuthContext';

// // const BASE_URL = 'http://localhost:5000';

// // function toDisplayUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http')) return url;
// //   return `${BASE_URL}${url}`;
// // }

// // const nav = [
// //   { to: '/admin/dashboard',     label: 'Dashboard', icon: LayoutDashboard },
// //   { to: '/admin/companies',     label: 'Companies', icon: Building2       },
// //   { to: '/admin/users',         label: 'Users',     icon: Users           },
// //   { to: '/admin/payments',      label: 'Payments',  icon: CreditCard      },
// //   { to: '/admin/subscriptions', label: 'Plans',     icon: Package         },
// //   { to: '/admin/revenue',       label: 'Revenue',   icon: TrendingUp      },
// //   { to: '/admin/settings',      label: 'Settings',  icon: Settings        },
// //   { to: '/admin/profile',       label: 'My Profile',icon: UserCircle      },
// // ];

// // export default function AdminLayout() {
// //   const navigate         = useNavigate();
// //   const { user, logout } = useAuth();

// //   const [open,   setOpen]   = useState(true);
// //   const [mobile, setMobile] = useState(false);

// //   useEffect(() => {
// //     const check = () => {
// //       const isMob = window.innerWidth < 768;
// //       setMobile(isMob);
// //       setOpen(!isMob);
// //     };
// //     check();
// //     window.addEventListener('resize', check);
// //     return () => window.removeEventListener('resize', check);
// //   }, []);

// //   const handleLogout = () => {
// //     logout();
// //     navigate('/login', { replace: true });
// //   };

// //   const displayName = user?.full_name || 'Superadmin';
// //   const avatarUrl   = toDisplayUrl(user?.avatar_url);
// //   const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'SA';
// //   const w           = open ? 240 : 68;

// //   return (
// //     <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
// //       {mobile && open && (
// //         <div
// //           onClick={() => setOpen(false)}
// //           style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 99, backdropFilter: 'blur(2px)' }}
// //         />
// //       )}

// //       <aside style={{
// //         width: w,
// //         background: 'var(--bg1)',
// //         borderRight: '1px solid var(--border)',
// //         display: 'flex', flexDirection: 'column',
// //         position: 'fixed', top: 0, bottom: 0, left: 0,
// //         zIndex: 100,
// //         transition: 'width .2s ease',
// //         overflow: 'hidden',
// //         ...(mobile && !open ? { transform: 'translateX(-100%)', width: 240 } : {}),
// //         ...(mobile &&  open ? { width: 240 } : {}),
// //       }}>

// //         {/* Logo */}
// //         <div style={{ height: 58, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '0 16px', gap: 10, flexShrink: 0 }}>
// //           <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
// //             <Package size={15} color="#fff" />
// //           </div>
// //           {(open || mobile) && (
// //             <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
// //               admin<span style={{ color: 'var(--accent)' }}>core</span>
// //             </span>
// //           )}
// //           {(open || mobile) && (
// //             <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
// //               <X size={16} />
// //             </button>
// //           )}
// //         </div>

// //         {/* Admin mini-card (expanded) */}
// //         {(open || mobile) && (
// //           <div
// //             onClick={() => { navigate('/admin/profile'); mobile && setOpen(false); }}
// //             style={{
// //               margin: '12px 10px 4px', padding: '10px 12px', borderRadius: 9,
// //               background: 'rgba(124,107,255,.07)', border: '1px solid rgba(124,107,255,.15)',
// //               display: 'flex', alignItems: 'center', gap: 10,
// //               cursor: 'pointer', transition: 'background .15s',
// //             }}
// //             onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,107,255,.13)'}
// //             onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,107,255,.07)'}
// //           >
// //             <div style={{
// //               width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
// //               background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,var(--accent),#a78bfa)',
// //               display: 'flex', alignItems: 'center', justifyContent: 'center',
// //               fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden',
// //             }}>
// //               {avatarUrl
// //                 ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// //                 : initials}
// //             </div>
// //             <div style={{ minWidth: 0 }}>
// //               <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
// //                 {displayName}
// //               </div>
// //               <div style={{ fontSize: 10.5, color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
// //                 SUPERADMIN
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Collapsed avatar */}
// //         {!open && !mobile && (
// //           <div
// //             onClick={() => navigate('/admin/profile')}
// //             style={{
// //               margin: '10px auto 4px',
// //               width: 34, height: 34, borderRadius: '50%',
// //               background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,var(--accent),#a78bfa)',
// //               display: 'flex', alignItems: 'center', justifyContent: 'center',
// //               fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden',
// //               cursor: 'pointer', border: '2px solid rgba(124,107,255,.3)',
// //             }}
// //           >
// //             {avatarUrl
// //               ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// //               : initials}
// //           </div>
// //         )}

// //         {/* Nav links */}
// //         <nav style={{ flex: 1, padding: '6px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
// //           <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--mono)', padding: '8px 10px 4px' }}>
// //             {(open || mobile) ? 'Navigation' : ''}
// //           </div>
// //           {nav.map(({ to, label, icon: Icon }) => (
// //             <NavLink
// //               key={to}
// //               to={to}
// //               onClick={() => mobile && setOpen(false)}
// //               style={({ isActive }) => ({
// //                 display: 'flex', alignItems: 'center', gap: 10,
// //                 padding: '9px 10px', marginBottom: 2, borderRadius: 7,
// //                 textDecoration: 'none',
// //                 color:      isActive ? 'var(--accent)' : 'var(--text2)',
// //                 background: isActive ? 'rgba(124,107,255,.1)' : 'transparent',
// //                 fontSize: 13.5, fontWeight: isActive ? 600 : 400,
// //                 transition: 'all .15s', whiteSpace: 'nowrap',
// //               })}
// //             >
// //               <Icon size={17} style={{ flexShrink: 0 }} />
// //               {(open || mobile) && label}
// //             </NavLink>
// //           ))}
// //         </nav>

// //         {/* Sign Out */}
// //         <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
// //           <button
// //             onClick={handleLogout}
// //             style={{
// //               display: 'flex', alignItems: 'center', gap: 10,
// //               padding: '9px 10px', width: '100%',
// //               background: 'none', border: 'none',
// //               color: 'var(--red)', cursor: 'pointer',
// //               borderRadius: 7, fontSize: 13.5, fontWeight: 500,
// //               transition: 'background .15s', whiteSpace: 'nowrap',
// //             }}
// //             onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.08)'}
// //             onMouseLeave={e => e.currentTarget.style.background = 'none'}
// //           >
// //             <LogOut size={17} style={{ flexShrink: 0 }} />
// //             {(open || mobile) && 'Sign Out'}
// //           </button>
// //         </div>
// //       </aside>

// //       {/* Main content */}
// //       <div style={{ flex: 1, marginLeft: mobile ? 0 : w, transition: 'margin-left .2s ease', display: 'flex', flexDirection: 'column' }}>
// //         <header style={{
// //           height: 58, background: 'var(--bg1)', borderBottom: '1px solid var(--border)',
// //           display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px',
// //           position: 'sticky', top: 0, zIndex: 50,
// //         }}>
// //           <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
// //             <Menu size={18} />
// //           </button>
// //           <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
// //             {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
// //           </span>
// //           <div style={{ flex: 1 }} />

// //           {/* User chip */}
// //           <div
// //             onClick={() => navigate('/admin/profile')}
// //             style={{
// //               display: 'flex', alignItems: 'center', gap: 8,
// //               padding: '5px 12px 5px 5px', borderRadius: 24,
// //               background: 'var(--bg3)', border: '1px solid var(--border)',
// //               cursor: 'pointer', transition: 'border-color .15s',
// //             }}
// //             onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,107,255,.4)'}
// //             onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
// //             title="My Profile"
// //           >
// //             <div style={{
// //               width: 28, height: 28, borderRadius: '50%',
// //               background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,var(--accent),#a78bfa)',
// //               display: 'flex', alignItems: 'center', justifyContent: 'center',
// //               fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden',
// //             }}>
// //               {avatarUrl
// //                 ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// //                 : initials}
// //             </div>
// //             <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
// //               <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
// //                 {displayName}
// //               </span>
// //               <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
// //                 SUPERADMIN
// //               </span>
// //             </div>
// //           </div>
// //         </header>

// //         <main style={{ flex: 1 }}>
// //           <Outlet />
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useState, useEffect } from 'react';
// import { Outlet, NavLink, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard, Building2, Users, CreditCard,
//   Package, TrendingUp, Settings, LogOut, Menu, X, UserCircle,
//   MessageSquare   // ✅ added for Chat Sessions
// } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// const BASE_URL = 'http://localhost:5000';

// function toDisplayUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http')) return url;
//   return `${BASE_URL}${url}`;
// }

// const nav = [
//   { to: '/admin/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
//   { to: '/admin/companies',      label: 'Companies',     icon: Building2       },
//   { to: '/admin/users',          label: 'Users',         icon: Users           },
//   { to: '/admin/payments',       label: 'Payments',      icon: CreditCard      },
//   { to: '/admin/subscriptions',  label: 'Plans',         icon: Package         },
//   { to: '/admin/revenue',        label: 'Revenue',       icon: TrendingUp      },
//   { to: '/admin/chat-sessions',  label: 'Chat Sessions', icon: MessageSquare   }, // ✅ added
//   { to: '/admin/settings',       label: 'Settings',      icon: Settings        },
//   { to: '/admin/profile',        label: 'My Profile',    icon: UserCircle      },
// ];

// export default function AdminLayout() {
//   const navigate         = useNavigate();
//   const { user, logout } = useAuth();

//   const [open,   setOpen]   = useState(true);
//   const [mobile, setMobile] = useState(false);

//   // ✅ Track unread/waiting chat count
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

//   // ✅ Poll for waiting sessions every 30s so admin sees live badge
//   useEffect(() => {
//     const fetchWaiting = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch('http://localhost:5000/api/admin/chat-sessions?status=waiting_admin', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         if (data.success) setWaitingCount(data.sessions.length);
//       } catch {
//         // silently ignore
//       }
//     };
//     fetchWaiting();
//     const interval = setInterval(fetchWaiting, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleLogout = () => {
//     logout();
//     navigate('/login', { replace: true });
//   };

//   const displayName = user?.full_name || 'Superadmin';
//   const avatarUrl   = toDisplayUrl(user?.avatar_url);
//   const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'SA';
//   const w           = open ? 240 : 68;

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
//       {mobile && open && (
//         <div
//           onClick={() => setOpen(false)}
//           style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 99, backdropFilter: 'blur(2px)' }}
//         />
//       )}

//       <aside style={{
//         width: w,
//         background: 'var(--bg1)',
//         borderRight: '1px solid var(--border)',
//         display: 'flex', flexDirection: 'column',
//         position: 'fixed', top: 0, bottom: 0, left: 0,
//         zIndex: 100,
//         transition: 'width .2s ease',
//         overflow: 'hidden',
//         ...(mobile && !open ? { transform: 'translateX(-100%)', width: 240 } : {}),
//         ...(mobile &&  open ? { width: 240 } : {}),
//       }}>

//         {/* Logo */}
//         <div style={{ height: 58, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '0 16px', gap: 10, flexShrink: 0 }}>
//           <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//             <Package size={15} color="#fff" />
//           </div>
//           {(open || mobile) && (
//             <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
//               admin<span style={{ color: 'var(--accent)' }}>core</span>
//             </span>
//           )}
//           {(open || mobile) && (
//             <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
//               <X size={16} />
//             </button>
//           )}
//         </div>

//         {/* Admin mini-card (expanded) */}
//         {(open || mobile) && (
//           <div
//             onClick={() => { navigate('/admin/profile'); mobile && setOpen(false); }}
//             style={{
//               margin: '12px 10px 4px', padding: '10px 12px', borderRadius: 9,
//               background: 'rgba(124,107,255,.07)', border: '1px solid rgba(124,107,255,.15)',
//               display: 'flex', alignItems: 'center', gap: 10,
//               cursor: 'pointer', transition: 'background .15s',
//             }}
//             onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,107,255,.13)'}
//             onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,107,255,.07)'}
//           >
//             <div style={{
//               width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
//               background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,var(--accent),#a78bfa)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden',
//             }}>
//               {avatarUrl
//                 ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                 : initials}
//             </div>
//             <div style={{ minWidth: 0 }}>
//               <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                 {displayName}
//               </div>
//               <div style={{ fontSize: 10.5, color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
//                 SUPERADMIN
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Collapsed avatar */}
//         {!open && !mobile && (
//           <div
//             onClick={() => navigate('/admin/profile')}
//             style={{
//               margin: '10px auto 4px',
//               width: 34, height: 34, borderRadius: '50%',
//               background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,var(--accent),#a78bfa)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden',
//               cursor: 'pointer', border: '2px solid rgba(124,107,255,.3)',
//             }}
//           >
//             {avatarUrl
//               ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//               : initials}
//           </div>
//         )}

//         {/* Nav links */}
//         <nav style={{ flex: 1, padding: '6px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
//           <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--mono)', padding: '8px 10px 4px' }}>
//             {(open || mobile) ? 'Navigation' : ''}
//           </div>
//           {nav.map(({ to, label, icon: Icon }) => (
//             <NavLink
//               key={to}
//               to={to}
//               onClick={() => mobile && setOpen(false)}
//               style={({ isActive }) => ({
//                 display: 'flex', alignItems: 'center', gap: 10,
//                 padding: '9px 10px', marginBottom: 2, borderRadius: 7,
//                 textDecoration: 'none',
//                 color:      isActive ? 'var(--accent)' : 'var(--text2)',
//                 background: isActive ? 'rgba(124,107,255,.1)' : 'transparent',
//                 fontSize: 13.5, fontWeight: isActive ? 600 : 400,
//                 transition: 'all .15s', whiteSpace: 'nowrap',
//                 position: 'relative',   // ✅ needed for badge positioning
//               })}
//             >
//               <Icon size={17} style={{ flexShrink: 0 }} />
//               {(open || mobile) && label}

//               {/* ✅ Live badge: shows count of employees waiting for admin */}
//               {label === 'Chat Sessions' && waitingCount > 0 && (
//                 <span style={{
//                   marginLeft: 'auto',
//                   background: '#ef4444', color: '#fff',
//                   fontSize: 10, fontWeight: 700,
//                   padding: '1px 6px', borderRadius: 10,
//                   minWidth: 18, textAlign: 'center',
//                   display: (open || mobile) ? 'inline-block' : 'none',
//                 }}>
//                   {waitingCount}
//                 </span>
//               )}

//               {/* ✅ Collapsed dot indicator */}
//               {label === 'Chat Sessions' && waitingCount > 0 && !open && !mobile && (
//                 <span style={{
//                   position: 'absolute', top: 6, right: 6,
//                   width: 7, height: 7, borderRadius: '50%',
//                   background: '#ef4444',
//                 }} />
//               )}
//             </NavLink>
//           ))}
//         </nav>

//         {/* Sign Out */}
//         <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
//           <button
//             onClick={handleLogout}
//             style={{
//               display: 'flex', alignItems: 'center', gap: 10,
//               padding: '9px 10px', width: '100%',
//               background: 'none', border: 'none',
//               color: 'var(--red)', cursor: 'pointer',
//               borderRadius: 7, fontSize: 13.5, fontWeight: 500,
//               transition: 'background .15s', whiteSpace: 'nowrap',
//             }}
//             onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.08)'}
//             onMouseLeave={e => e.currentTarget.style.background = 'none'}
//           >
//             <LogOut size={17} style={{ flexShrink: 0 }} />
//             {(open || mobile) && 'Sign Out'}
//           </button>
//         </div>
//       </aside>

//       {/* Main content */}
//       <div style={{ flex: 1, marginLeft: mobile ? 0 : w, transition: 'margin-left .2s ease', display: 'flex', flexDirection: 'column' }}>
//         <header style={{
//           height: 58, background: 'var(--bg1)', borderBottom: '1px solid var(--border)',
//           display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px',
//           position: 'sticky', top: 0, zIndex: 50,
//         }}>
//           <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
//             <Menu size={18} />
//           </button>
//           <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
//             {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
//           </span>
//           <div style={{ flex: 1 }} />

//           {/* ✅ Chat waiting alert chip in header */}
//           {waitingCount > 0 && (
//             <div
//               onClick={() => navigate('/admin/chat-sessions')}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 6,
//                 padding: '5px 12px', borderRadius: 20,
//                 background: '#fef3c7', border: '1px solid #fde68a',
//                 cursor: 'pointer', transition: 'opacity .15s',
//               }}
//               onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
//               onMouseLeave={e => e.currentTarget.style.opacity = '1'}
//               title="Employees waiting for admin reply"
//             >
//               <MessageSquare size={13} color="#d97706" />
//               <span style={{ fontSize: 12, fontWeight: 600, color: '#d97706' }}>
//                 {waitingCount} waiting
//               </span>
//             </div>
//           )}

//           {/* User chip */}
//           <div
//             onClick={() => navigate('/admin/profile')}
//             style={{
//               display: 'flex', alignItems: 'center', gap: 8,
//               padding: '5px 12px 5px 5px', borderRadius: 24,
//               background: 'var(--bg3)', border: '1px solid var(--border)',
//               cursor: 'pointer', transition: 'border-color .15s',
//             }}
//             onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,107,255,.4)'}
//             onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
//             title="My Profile"
//           >
//             <div style={{
//               width: 28, height: 28, borderRadius: '50%',
//               background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,var(--accent),#a78bfa)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden',
//             }}>
//               {avatarUrl
//                 ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                 : initials}
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
//               <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                 {displayName}
//               </span>
//               <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
//                 SUPERADMIN
//               </span>
//             </div>
//           </div>
//         </header>

//         <main style={{ flex: 1, overflow: 'auto' }}>
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
  MessageCircle // 🔥 added
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:5000';

function toDisplayUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
}

// 🔥 UPDATED NAV WITH CHAT
const nav = [
  { to: '/admin/dashboard',     label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/companies',     label: 'Companies', icon: Building2       },
  { to: '/admin/users',         label: 'Users',     icon: Users           },
  { to: '/admin/payments',      label: 'Payments',  icon: CreditCard      },
  { to: '/admin/subscriptions', label: 'Plans',     icon: Package         },
  { to: '/admin/revenue',       label: 'Revenue',   icon: TrendingUp      },

  // ✅ THIS IS WHAT WAS MISSING
  { to: '/admin/chat',          label: 'Chat',      icon: MessageCircle   },

  { to: '/admin/settings',      label: 'Settings',  icon: Settings        },
  { to: '/admin/profile',       label: 'My Profile',icon: UserCircle      },
];

export default function AdminLayout() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const [open,   setOpen]   = useState(true);
  const [mobile, setMobile] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.full_name || 'Superadmin';
  const avatarUrl   = toDisplayUrl(user?.avatar_url);
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'SA';
  const w           = open ? 240 : 68;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside style={{
        width: w,
        background: 'var(--bg1)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0,
        zIndex: 100,
        transition: 'width .2s ease',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          height: 58,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          padding: '0 16px',
          gap: 10
        }}>
          <div style={{
            width: 28,
            height: 28,
            background: 'var(--accent)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={15} color="#fff" />
          </div>

          {(open || mobile) && (
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text)'
            }}>
              admin<span style={{ color: 'var(--accent)' }}>core</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '10px' }}>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? '#7c6bff' : '#ccc',
                background: isActive ? 'rgba(124,107,255,.1)' : 'transparent',
                fontSize: 14
              })}
            >
              <Icon size={18} />
              {(open || mobile) && label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(239,68,68,.1)',
              border: 'none',
              borderRadius: 8,
              color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: w,
        padding: '20px'
      }}>
        <Outlet />
      </div>
    </div>
  );
}